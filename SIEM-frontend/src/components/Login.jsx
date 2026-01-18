import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import '../styles/auth.css';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        try {
            const data = await loginUser(formData.email, formData.password);

            login(data.user, data.tenant, data.token);

            navigate('/dashboard');
        } catch (err) {
            setError(err.error || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your SIEM portal</p>
                </div>

                {error && (
                    <div className="error-message">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
