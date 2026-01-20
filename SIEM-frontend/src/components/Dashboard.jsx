import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import '../styles/pages.css';

function Dashboard() {
    const { user, tenant } = useAuth();

    return (
        <div className="app-layout">
            <Navigation />
            <div className="main-content">
                <div className="container">
                    <div className="page-card">
                        <div className="dashboard-welcome">
                            <h1>Welcome to Your SIEM Dashboard</h1>
                            <p className="welcome-subtitle">
                                Monitor your security events and manage your infrastructure
                            </p>
                        </div>

                        <div className="dashboard-grid">
                            <div className="info-card">
                                <div className="info-card-header">
                                    <h3>User Information</h3>
                                </div>
                                <div className="info-card-content">
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <span className="info-value">{user?.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Role:</span>
                                        <span className="info-value">
                                            <span className={`role-badge role-${user?.role}`}>
                                                {user?.role}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">User ID:</span>
                                        <span className="info-value code">{user?.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-card-header">
                                    <h3>Tenant Information</h3>
                                </div>
                                <div className="info-card-content">
                                    <div className="info-item">
                                        <span className="info-label">Company:</span>
                                        <span className="info-value">{tenant?.name}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Tenant ID:</span>
                                        <span className="info-value code">{tenant?.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-stats">
                            <div className="stat-card">
                                <div className="stat-info">
                                    <div className="stat-label">Total Logs</div>
                                    <div className="stat-value">-</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <div className="stat-label">Active Alerts</div>
                                    <div className="stat-value">-</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-info">
                                    <div className="stat-label">System Status</div>
                                    <div className="stat-value status-active">Active</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
