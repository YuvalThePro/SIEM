import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authService';
import '../styles/auth.css';

function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        companyName: '',
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

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            setIsLoading(false);
            return;
        }

        try {
            const data = await registerUser(
                formData.companyName,
                formData.email,
                formData.password
            );

            login(data.user, data.tenant, data.token);

            navigate('/dashboard');
        } catch (err) {
            setError(err.error || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-logo">
                        <span className="auth-logo-text">SIEM Portal</span>
                    </div>

                    <div className="auth-header">
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Start monitoring your security today</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <span className="auth-error-text">{error}</span>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="companyName" className="form-label">
                                Company Name
                            </label>
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                className="form-input"
                                placeholder="Acme Corporation"
                                value={formData.companyName}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="name@company.com"
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
                                placeholder="Minimum 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoading}
                                required
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in instead
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
