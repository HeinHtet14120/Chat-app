import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setIsAuthenticated(!!user?.token);
        setUsername(user?.username || '');
    }, []);

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUsername(userData.username);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUsername('');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);