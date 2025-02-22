import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthForm from './pages/Auth/AuthPage';
import HomePage from './components/HomePage';
import Chats from './components/Chats';
import { AuthRoute, PrivateRoute } from './components/atoms/PrivateRoute';
import Room from './components/Room';
import CreateRoomPage from './pages/CreateRoomPage';

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="app" style={{backgroundColor: 'var(--discord-bg)', height: '100vh'}}>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={
                            <AuthRoute>
                                <AuthForm action="login" />
                            </AuthRoute>
                        } />
                        <Route path="/register" element={
                            <AuthRoute>
                                <AuthForm action="register" />
                            </AuthRoute>
                        } />
                        <Route path="/chat" element={
                            <PrivateRoute>
                                <Chats />
                            </PrivateRoute>
                        } />
                        <Route path="/room/:id" element={
                            <PrivateRoute>
                                <Room />
                            </PrivateRoute>
                        } />
                        <Route path="/create-room" element={<CreateRoomPage />} />
                        {/* ... other routes ... */}
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;