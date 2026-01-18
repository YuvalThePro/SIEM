import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/pages.css';

function Alerts() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="container page-container">
            <div className="page-card">
                <div className="page-header">
                    <h1>Alerts</h1>
                    <button onClick={handleLogout} className="btn btn-danger">
                        Logout
                    </button>
                </div>
                <p className="page-subtitle">
                    Welcome, <strong>{user?.email}</strong>! This is the alerts page.
                </p>
                <div className="placeholder-box">
                    <p>Alert management functionality will be implemented in future commits.</p>
                </div>
            </div>
        </div>
    );
}

export default Alerts;
