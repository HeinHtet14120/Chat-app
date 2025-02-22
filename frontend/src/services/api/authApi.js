const BASE_URL = 'http://127.0.0.1:8000/api';

const fetchWithConfig = async (url, options = {}) => {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    // Get token from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
        defaultOptions.headers.Authorization = `Token ${user.token}`;
    }

    // Merge default options with provided options
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    const response = await fetch(`${BASE_URL}${url}`, finalOptions);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

export const authApi = {
    register: (userData) => 
        fetchWithConfig('/users/', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),

    login: (credentials) => 
        fetchWithConfig('/token/', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
    
    chatRooms: () => 
        fetchWithConfig('/rooms/', {
            method: 'GET',
        }),

    getProfile: () => 
        fetchWithConfig('/profiles/me/'),

    updateProfile: (data) => 
        fetchWithConfig('/profiles/me/', {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),

    checkRoomAccess: async (roomId) => {
        try {
            const response = await fetchWithConfig(`/rooms/${roomId}/`, {
                method: 'GET',
            });
            return response;
        } catch (error) {
            console.error('Check room access error:', error);
            throw error;
        }
    },

    createRoom: async (roomData) => {
        const response = await fetchWithConfig('/rooms/', {
            method: 'POST',
            body: JSON.stringify(roomData)
        });
        return response;
    },

    addRoomParticipants: async (roomId, userIds) => {
        const response = await fetchWithConfig(`/rooms/${roomId}/add_participants/`, {
            method: 'POST',
            body: JSON.stringify({ user_ids: userIds })
        });
        return response;
    },

    getUsers: async () => {
        const response = await fetchWithConfig('/users/', {
            method: 'GET'
        });
        return response;
    },

    joinRoom: async (roomId) => {
        try {
            const response = await fetchWithConfig(`/rooms/${roomId}/join_room/`, {
                method: 'POST'
            });
            return response;
        } catch (error) {
            console.error('Join room error:', error);
            throw error;
        }
    }
};