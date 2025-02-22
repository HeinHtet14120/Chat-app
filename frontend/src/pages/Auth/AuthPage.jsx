import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api/authApi';
import './AuthForm.css';
import { useAuth } from '../../context/AuthContext';


//login
//tester
//Test123


const AuthForm = ({ action }) => {
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            let response;
            if (action === 'login') {
                response = await authApi.login(formData);
                localStorage.setItem('user', JSON.stringify(response));
                authLogin(response);
                navigate('/chat');
            } else if (action === 'register') {
                response = await authApi.register(formData);

                console.log('response', response);
                navigate('/login');
            }
            
           
        } catch (err) {
            console.error(`${action} error:`, err);
            setError(action === 'login' ? 'Invalid credentials' : 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <div className="auth-header">
                    <h2 className="auth-title">
                        {action === 'login' ? 'Sign in to your account' : 'Create new account'}
                    </h2>
                    <p className="auth-subtitle">
                        {action === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                        <button 
                            onClick={() => navigate(action === 'login' ? '/register' : '/login')}
                            className="auth-link"
                        >
                            {action === 'login' ? 'Create an account' : 'Sign in'}
                        </button>
                    </p>
                </div>
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({
                                ...formData,
                                username: e.target.value
                            })}
                            required
                        />
                    </div>

                    {action === 'register' && (
                    <div className="form-group">
                    <input
                        type="email"
                        className="form-input"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({
                            ...formData,
                            email: e.target.value
                        })}
                        required
                    />
                    </div>
                    )}

                    <div className="form-group">
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({
                                ...formData,
                                password: e.target.value
                            })}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="spinner" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                </svg>
                                {action === 'login' ? 'Signing in...' : 'Registering...'}
                            </>
                        ) : (
                            action === 'login' ? 'Sign in' : 'Register'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthForm;