import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setIsAuthenticated(!!user?.token);
    }, []);

    return (
        <div className="home-container">
            <div className="home-content">
                <h1 className="home-title">
                    Welcome to Our Chat Application
                </h1>
                <p className="home-subtitle">
                    Connect with friends and colleagues in real-time
                </p>
                
                <div className="button-group">
                    {isAuthenticated ? (
                        <button
                            onClick={() => navigate('/chat')}
                            className="button primary-button"
                        >
                            Go to Chat Rooms
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/login')}
                                className="button primary-button"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="button secondary-button"
                            >
                                Register
                            </button>
                        </>
                    )}
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3 className="feature-title">Real-time Chat</h3>
                        <p className="feature-description">
                            Experience seamless real-time messaging with WebSocket technology
                        </p>
                    </div>
                    <div className="feature-card">
                        <h3 className="feature-title">Multiple Rooms</h3>
                        <p className="feature-description">
                            Create or join different chat rooms for various topics
                        </p>
                    </div>
                    <div className="feature-card">
                        <h3 className="feature-title">Secure</h3>
                        <p className="feature-description">
                            Your conversations are protected with secure authentication
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
