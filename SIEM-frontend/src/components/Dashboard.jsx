import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const { user, tenant, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <div style={{
                background: 'white',
                borderRadius: '0.5rem',
                padding: '2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h1>Dashboard</h1>
                <div style={{ marginTop: '1.5rem' }}>
                    <h3>User Information</h3>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                    <p><strong>User ID:</strong> {user?.id}</p>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                    <h3>Tenant Information</h3>
                    <p><strong>Company:</strong> {tenant?.name}</p>
                    <p><strong>Tenant ID:</strong> {tenant?.id}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn btn-danger"
                    style={{ marginTop: '2rem' }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Dashboard;
