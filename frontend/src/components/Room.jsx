import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { authApi } from '../services/api/authApi';
import { chatApi } from '../services/api/chatApi';
import ChatWebSocket from '../services/websocket/chatSocket';
import './Room.css';
import { SendIcon, PlusIcon, X } from 'lucide-react';
import CreateRoom from './CreateRoom';

const Room = () => {
    const location = useLocation();
    const { id } = useParams();
    const [roomData, setRoomData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [wsConnected, setWsConnected] = useState(false);
    const websocket = useRef(null);
    const messagesEndRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isParticipant, setIsParticipant] = useState(false);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Scroll to bottom whenever messages update
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        let ws = null;

        const connectWebSocket = () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.token) {
                setError('Authentication required');
                return;
            }

            // Create WebSocket instance
            ws = new ChatWebSocket(
                id,
                (data) => {
                    if (data.message) {
                        setMessages(prev => [...prev, {
                            content: data.message,
                            sender: {
                                id: data.user_id,
                                username: data.username
                            },
                            timestamp: data.timestamp || new Date().toISOString()
                        }]);
                    }
                },
                user.token
            );

            ws.onConnectionChange = (isConnected) => {
                setWsConnected(isConnected);
            };

            ws.connect();
            websocket.current = ws;
        };

        const fetchRoomData = async () => {
            try {
                setLoading(true);
                const response = await authApi.checkRoomAccess(id);
                
                if (response.error) {
                    setError(response.error);
                    return;
                }

                setRoomData(response);
                
                // Check if current user is a participant
                const currentUser = JSON.parse(localStorage.getItem('user'));
                const userIsParticipant = response.participants.some(
                    p => p.id === currentUser.user_id
                );
                setIsParticipant(userIsParticipant);

                if (!userIsParticipant && !response.is_private) {
                    // If public room and not a participant, join automatically
                    const joinResponse = await authApi.joinRoom(id);
                    if (joinResponse.room) {
                        setRoomData(joinResponse.room);
                        setIsParticipant(true);
                    }
                }

                // Load messages if access is granted
                if (userIsParticipant) {
                    const messagesResponse = await chatApi.getRoomMessages(id);
                    setMessages(messagesResponse.data || []);
                }
                
            } catch (err) {
                setError('Failed to access room');
                console.error('Room access error:', err);
                navigate('/chat'); // Redirect to chat list on error
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRoomData();
        }
        connectWebSocket();

        // Cleanup on unmount
        return () => {
            if (websocket.current) {
                websocket.current.disconnect();
                websocket.current = null;
            }
        };
    }, [id, navigate]);

    // Add connection status indicator
    useEffect(() => {
        if (!wsConnected) {
            console.log('WebSocket disconnected, attempting to reconnect...');
        }
    }, [wsConnected]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !websocket.current) return;

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                setError('User not authenticated');
                return;
            }

            // Send message through WebSocket
            websocket.current.sendMessage({
                content: newMessage.trim(),
                user_id: user.user_id,
                username: user.username
            });

            // Clear input field
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message:', err);
            setError('Failed to send message');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleCreateRoom = (newRoom) => {
        // Handle the newly created room
        setIsModalOpen(false);
        // You might want to navigate to the new room or update the room list
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="discord-container">
            <div className="chat-area">
                <div className="messages">
                    {messages.map((message, index) => (
                        <div key={message.id || index} className="message">
                            <img 
                                className="avatar" 
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/discord%20features-TIV8tJO0oOhq1o2SB8xKAe9YDXAiYo.png" 
                                alt={`${message.sender.username}'s avatar`}
                            />
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="username">{message.sender.username}</span>
                                    <time>{new Date(message.timestamp).toLocaleTimeString()}</time>
                                </div>
                                <p>{message.content}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="message-input">
                <form onSubmit={handleSendMessage} style={{width: '100%', padding: '10px'}}>
<div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px'}}>

                    <div className="message-input-container" style={{width: '80%'}}>
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={`Message ${roomData?.name || 'room'}`}
                        />
                        
                    </div>
                    <div style={{width: '12%'}}>
                    <button type="submit" className="send-button">
                            <SendIcon size={25} />
                        </button>
                    </div>
</div>

                    </form>

                </div>
            </div>

            {/* Create Room Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button 
                            className="modal-close"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X size={24} />
                        </button>
                        <CreateRoom 
                            onRoomCreated={(newRoom) => {
                                handleCreateRoom(newRoom);
                            }}
                        />
                    </div>
                </div>
            )}

            <div className="members-list">  
                <h3>MEMBERS—{roomData?.participants?.length || 0}</h3>
                {roomData?.participants?.map((participant) => (
                    <div className="member" key={participant.id}>
                        <img 
                            className="avatar" 
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/discord%20features-TIV8tJO0oOhq1o2SB8xKAe9YDXAiYo.png" 
                            alt={`${participant.username}'s avatar`}
                        />
                        <span>{participant.username}</span>
                    </div>  
                ))}
            </div>
        </div>
    );
};

export default Room;