from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from urllib.parse import parse_qs
import logging

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user(token_key):
    try:
        token = Token.objects.get(key=token_key)
        logger.info(f"✅ Found user: {token.user.username}")
        return token.user
    except Token.DoesNotExist:
        logger.warning("❌ Invalid token")
        return AnonymousUser()
    except Exception as e:
        logger.error(f"❌ Error getting user: {str(e)}")
        return AnonymousUser()

class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        try:
            # Get token from query string
            query_string = scope.get('query_string', b'').decode()
            query_params = parse_qs(query_string)
            token_key = query_params.get('token', [None])[0]

            logger.info(f"🔑 Token from query: {token_key}")

            if token_key:
                scope['user'] = await get_user(token_key)
                logger.info(f"👤 User authenticated: {scope['user']}")
            else:
                scope['user'] = AnonymousUser()
                logger.warning("❌ No token provided")

            return await super().__call__(scope, receive, send)

        except Exception as e:
            logger.error(f"❌ Middleware error: {str(e)}")
            scope['user'] = AnonymousUser()
            return await super().__call__(scope, receive, send)
