import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { chatApi } from '../../../services/api/chatApi';
import ChatWebSocket from '../../../services/websocket/chatSocket';
import MessageList from '../../molecules/MessageList';
import MessageInput from '../../molecules/MessageInput';
import { ChatContainer } from './styles';

const ChatRoom = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Load initial messages
        const loadMessages = async () => {
            const response = await chatApi.getRoomMessages(roomId);
            setMessages(response.data);
        };
        loadMessages();

        // Setup WebSocket
        const ws = new ChatWebSocket(roomId, (data) => {
            setMessages(prev => [...prev, data.message]);
        });
        ws.connect();
        setSocket(ws);

        return () => ws.disconnect();
    }, [roomId]);

    const handleSendMessage = async (text) => {
        try {
            const response = await chatApi.sendMessage({
                room: roomId,
                content: text
            });
            socket.sendMessage(response.data);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    return (
        <ChatContainer>
            <MessageList messages={messages} />
            <MessageInput onSend={handleSendMessage} />
        </ChatContainer>
    );
};

export default ChatRoom;