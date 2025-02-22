import api from './axios';

export const chatApi = {
    // Rooms
    getRooms: () => api.get('/rooms/'),
    createRoom: (roomData) => api.post('/rooms/', roomData),
    getRoom: (roomId) => api.get(`/rooms/${roomId}/`),
    addParticipant: (roomId, userId) => 
        api.post(`/rooms/${roomId}/add_participant/`, { user_id: userId }),
    
    // Messages
    getRoomMessages: (roomId) => api.get(`/rooms/${roomId}/messages/`),
    sendMessage: (messageData) => api.post('/messages/', messageData),
    
    // Users
    getOnlineUsers: () => api.get('/profiles/online_users/'),
    setOnlineStatus: (status) => 
        api.post('/profiles/set_online_status/', { is_online: status })
};