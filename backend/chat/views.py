from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import ChatRoom, Message, UserProfile, User
from .serializers import ChatRoomSerializer, MessageSerializer, UserProfileSerializer, UserSerializer, UserRegistrationSerializer
from rest_framework.exceptions import NotFound, PermissionDenied
from django.contrib.auth.models import User
from django.db import models

class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]  # Base permission

    def get_queryset(self):
        """
        Filter rooms based on access rights:
        - Public rooms
        - Private rooms where user is participant
        """
        user = self.request.user
        return ChatRoom.objects.filter(
            # Show public rooms OR private rooms where user is participant
            models.Q(is_private=False) | 
            models.Q(is_private=True, participants=user)
        ).distinct()

    @action(detail=True, methods=['post'])
    def join_room(self, request, pk=None):
        try:
            room = self.get_object()
            user = request.user

            # Check if user is already a participant
            if room.participants.filter(id=user.id).exists():
                return Response({
                    'message': 'Already a member of this room',
                    'room': self.get_serializer(room).data
                })

            # Allow joining if room is public
            if not room.is_private:
                room.participants.add(user)
                serializer = self.get_serializer(room)
                return Response({
                    'message': 'Successfully joined the room',
                    'room': serializer.data
                })
            
            return Response(
                {'error': 'Cannot join private room'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        except ChatRoom.DoesNotExist:
            return Response(
                {'error': 'Room not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            room = self.get_object()
            user = request.user

            # Allow access if:
            # 1. Room is public OR
            # 2. User is a participant
            if not room.is_private or room.participants.filter(id=user.id).exists():
                serializer = self.get_serializer(room)
                return Response(serializer.data)

            return Response(
                {'error': 'You don\'t have access to this room'}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        except ChatRoom.DoesNotExist:
            return Response(
                {'error': 'Room not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve', 'join_room']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'])
    def add_participants(self, request, pk=None):
        room = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        try:
            # Get all users
            users = User.objects.filter(id__in=user_ids)
            if not users.exists():
                return Response(
                    {'error': 'No valid users found'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Add users to room
            room.participants.add(*users)
            
            # Return updated participant list
            serializer = UserSerializer(room.participants.all(), many=True)
            return Response({
                'message': 'Participants added successfully',
                'participants': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        # Automatically add the creator as a participant
        room = serializer.save()
        room.participants.add(self.request.user)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        room = self.get_object()
        messages = room.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_participant(self, request, pk=None):
        room = self.get_object()
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            room.participants.add(user)
            return Response({'status': 'participant added'})
        except User.DoesNotExist:
            return Response({'error': 'user not found'}, status=status.HTTP_404_NOT_FOUND)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Include related sender data to avoid N+1 queries
        return Message.objects.filter(
            room__participants=self.request.user
        ).select_related('sender')

    def perform_create(self, serializer):
        room_id = self.request.data.get('room')
        try:
            room = ChatRoom.objects.get(id=room_id)
            if not room.participants.filter(id=self.request.user.id).exists():
                raise PermissionError("You are not a participant of this room")
            serializer.save(sender=self.request.user)
        except ChatRoom.DoesNotExist:
            raise NotFound("Chat room not found")
        except PermissionError as e:
            raise PermissionDenied(str(e))

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def online_users(self, request):
        online_users = UserProfile.objects.filter(is_online=True)
        serializer = self.get_serializer(online_users, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def set_online_status(self, request, pk=None):
        profile = self.get_object()
        status = request.data.get('is_online', False)
        profile.is_online = status
        if not status:
            profile.last_seen = timezone.now()
        profile.save()
        return Response({'status': 'updated'})

class UserRegistrationViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return all users except the current user"""
        return User.objects.exclude(id=self.request.user.id)

    def list(self, request, *args, **kwargs):
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)