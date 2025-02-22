import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, username, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand" onClick={() => navigate('/')}>
                HH
            </div>
            
            <div className="nav-links">
                {isAuthenticated && (
                    <>
                        <div className="nav-user">
                            <span className="username">{username}</span>
                            <button 
                                className="nav-link logout-btn"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;