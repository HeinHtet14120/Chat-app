from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from chat import views
from chat.auth import CustomAuthToken
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.conf import settings
from django.conf.urls.static import static

# Create schema view for API documentation
schema_view = get_schema_view(
    openapi.Info(
        title="Chat API",
        default_version='v1',
        description="API for real-time chat application",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# Create router for API views
router = DefaultRouter()
router.register(r'rooms', views.ChatRoomViewSet)
router.register(r'messages', views.MessageViewSet)
router.register(r'profiles', views.UserProfileViewSet)
router.register(r'users', views.UserRegistrationViewSet)

# Combine all URL patterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # All API endpoints will be under /api/
    path('api/token/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('api-auth/', include('rest_framework.urls')),  # Authentication URLs
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),  # API documentation
    path('chat/', include('chat.urls')),  # Add this line if you have chat-specific URLs
]

# Add this condition for serving static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)