from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ChatRoomViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'rooms', ChatRoomViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 