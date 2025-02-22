import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api/authApi';
import './CreateRoomPage.css';

const CreateRoomPage = () => {
    const [roomName, setRoomName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await authApi.getUsers();
                setAvailableUsers(response.data);
            } catch (err) {
                setError('Failed to load users');
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const roomResponse = await authApi.createRoom({
                name: roomName,
                is_private: isPrivate
            });

            if (roomResponse && selectedUsers.length > 0) {
                await authApi.addRoomParticipants(
                    roomResponse.id,
                    { user_ids: selectedUsers }
                );
            }

            // Navigate back to chat list
            navigate('/chats');

        } catch (err) {
            setError('Failed to create room');
        }
    };

    const handleUserSelect = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            }
            return [...prev, userId];
        });
    };

    return (
        <div className="create-room-page">
            <div className="create-room-container">
                <h2>Create New Chat Room</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="roomName">Room Name</label>
                        <input
                            type="text"
                            id="roomName"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Enter room name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                            />
                            Private Room
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Add Participants</label>
                        <div className="users-list">
                            {availableUsers.map(user => (
                                <label key={user.id} className="user-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleUserSelect(user.id)}
                                    />
                                    {user.username}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="button-group">
                        <button type="button" className="cancel-button" onClick={() => navigate('/chats')}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-button">
                            Create Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomPage; 