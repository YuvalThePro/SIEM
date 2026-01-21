import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navigation() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            document.documentElement.removeAttribute('data-theme');
        }
        return savedTheme || 'dark';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/logs', label: 'Logs' },
        { path: '/alerts', label: 'Alerts' },
    ];

    // Add admin-only links
    if (user?.role === 'admin') {
        navLinks.push({ path: '/api-keys', label: 'API Keys' });
        navLinks.push({ path: '/users', label: 'Users' });
    }

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.email) return '?';
        return user.email.charAt(0).toUpperCase();
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/dashboard" className="brand-link">
                        <span className="brand-text">SIEM Portal</span>
                    </Link>
                </div>

                <div className="navbar-links">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
                        >
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="navbar-user">
                    <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <div className="user-info">
                        <div className="user-avatar">{getUserInitials()}</div>
                        <div className="user-details">
                            <span className="user-email">{user?.email}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
