import { Navigate } from 'react-router-dom';

// For login/register routes (redirects to chat if logged in)
export const AuthRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user?.token) {
        return <Navigate to="/chat" />;
    }
    
    return children;
};

// For protected routes like chat (redirects to login if not logged in)
export const PrivateRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user?.token) {
        return <Navigate to="/login" />;
    }
    
    return children;
};