import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api/authApi';
import './ChatRoom.css';
import { LockIcon, Globe, PlusCircle } from 'lucide-react';

const Chats = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchChatRooms = async () => {
    try {
      const response = await authApi.chatRooms();
      if (Array.isArray(response)) {
        setChatRooms(response);
      }
    } catch (err) {
      console.error('Failed to fetch chat rooms:', err);
      setError('Failed to load chat rooms');
    }
  };

  const handleRoomClick = async (roomId) => {
    try {
      const roomData = await authApi.checkRoomAccess(roomId);
      
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const hasAccess = roomData.participants.some(
        participant => participant.id === currentUser.user_id
      );

      if (hasAccess) {
        navigate(`/room/${roomId}`, { 
          state: { roomData }
        });
      } else {
        setError('You do not have access to this room');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Failed to check room access:', err);
      setError('Unable to access this room');
      setTimeout(() => setError(''), 3000);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="header-section">
        <button 
          className="create-room-link"
          onClick={() => navigate('/create-room')}
        >
          <PlusCircle size={20} />
          <span>New Chat Room</span>
        </button>
      </div>
     
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      <div className="chat-list">
        {chatRooms.map((chatRoom) => (
          <div
            key={chatRoom.id}
            onClick={() => handleRoomClick(chatRoom.id)}
            className="chat-room-item"
          >
            <div className="flex items-center gap-3">
              <div className="chat-room-details">
                <div className="text-sm font-semibold text-red-500">
                  {chatRoom.name}
                </div>
                <div className="chat-room-last-message">
                  {chatRoom.last_message ? chatRoom.last_message.content : 'No messages yet'}
                </div>

              </div>
            </div>
            <div className="chat-room-timestamp">
              {new Date(chatRoom.created_at).toLocaleDateString()}
            </div>
            <div className="chat-room-icon">
              {chatRoom.is_private ? <LockIcon size={10} /> : <Globe size={10} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chats;