import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/pages.css';

function Logs() {
    const { user, tenant, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="container page-container">
            <div className="page-card">
                <div className="page-header">
                    <h1>Logs</h1>
                    <button onClick={handleLogout} className="btn btn-danger">
                        Logout
                    </button>
                </div>
                <p className="page-subtitle">
                    Welcome, <strong>{user?.email}</strong> from <strong>{tenant?.name}</strong>! This is the logs page.
                </p>
                <div className="placeholder-box">
                    <p>Log management functionality will be implemented in future commits.</p>
                </div>
            </div>
        </div>
    );
}

export default Logs;
