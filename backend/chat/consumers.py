import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message
import logging

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope["user"]

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        logger.info(f"WebSocket connected - Room: {self.room_id}, User: {self.user}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected - Code: {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data['message']

            # Save message to database
            saved_message = await self.save_message(message)

            # Send message to room group (only once)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'timestamp': saved_message.timestamp.isoformat()
                }
            )
            
            logger.info(f"Message sent successfully: {message}")
        except Exception as e:
            logger.error(f"Error handling message: {str(e)}")

    async def chat_message(self, event):
        # Send message to WebSocket
        try:
            await self.send(text_data=json.dumps({
                'message': event['message'],
                'user_id': event['user_id'],
                'username': event['username'],
                'timestamp': event['timestamp']
            }))
        except Exception as e:
            logger.error(f"Error sending message to WebSocket: {str(e)}")

    @database_sync_to_async
    def save_message(self, message):
        room = ChatRoom.objects.get(id=self.room_id)
        return Message.objects.create(
            content=message,
            room=room,
            sender=self.user
        )