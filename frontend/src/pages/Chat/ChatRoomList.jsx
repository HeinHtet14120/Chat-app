import { useEffect, useState } from 'react';
import { chatApi } from '../../../services/api/chatApi';
import RoomItem from '../../molecules/RoomItem';
import { RoomListContainer } from './styles';

const ChatRoomList = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const loadRooms = async () => {
            const response = await chatApi.getRooms();
            setRooms(response.data);
        };
        loadRooms();
    }, []);

    return (
        <RoomListContainer>
            {rooms.map(room => (
                <RoomItem key={room.id} room={room} />
            ))}
        </RoomListContainer>
    );
};

export default ChatRoomList;