from django.contrib import admin
from .models import ChatRoom, Message, UserProfile

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_private', 'created_at')
    filter_horizontal = ('participants',)
    search_fields = ('name',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'room', 'content', 'timestamp', 'is_read')
    list_filter = ('is_read', 'room', 'sender')
    search_fields = ('content',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_online', 'last_seen')
    list_filter = ('is_online',)
    search_fields = ('user__username',)