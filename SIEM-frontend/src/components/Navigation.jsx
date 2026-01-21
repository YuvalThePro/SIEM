import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function Navigation() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
                    <div className="user-info">
                        <div className="user-details">
                            <span className="user-email">{user?.email}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-logout">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
