import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import { getStats } from '../services/statsService';
import '../styles/pages.css';

function Dashboard() {
    const { user, tenant } = useAuth();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [range, setRange] = useState('24h');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async (customRange = null) => {
        try {
            setLoading(true);
            setError('');

            const activeRange = customRange || range;
            const data = await getStats(activeRange);
            setStats(data);
        } catch (err) {
            let errorMessage = 'Failed to load statistics';
            
            if (err.error) {
                errorMessage = err.error;
            } else if (err.message) {
                if (err.message.includes('Network Error') || err.message.includes('ERR_NETWORK')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else if (err.message.includes('timeout')) {
                    errorMessage = 'Request timeout. The server is taking too long to respond.';
                } else {
                    errorMessage = err.message;
                }
            }
            
            if (err.status === 403 || err.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (err.status === 404) {
                errorMessage = 'Statistics endpoint not found. Please contact support.';
            } else if (err.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        fetchStats();
    };

    const handleRangeChange = (e) => {
        const newRange = e.target.value;
        setRange(newRange);
        fetchStats(newRange);
    };

    const getSeverityBadgeClass = (severity) => {
        const severityMap = {
            low: 'badge-severity-low',
            medium: 'badge-severity-medium',
            high: 'badge-severity-high',
            critical: 'badge-severity-critical'
        };
        return severityMap[severity] || 'badge-severity-low';
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            open: 'badge-status-open',
            closed: 'badge-status-closed'
        };
        return statusMap[status] || 'badge-status-open';
    };

    const getLevelBadgeClass = (level) => {
        const levelMap = {
            info: 'badge-info',
            warn: 'badge-warn',
            error: 'badge-error',
            critical: 'badge-critical'
        };
        return levelMap[level] || 'badge-info';
    };

    const truncateMessage = (message, maxLength = 60) => {
        if (!message) return '';
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="app-layout">
            <Navigation />
            <div className="main-content">
                <div className="container">
                    <div className="page-card">
                        <div className="dashboard-welcome">
                            <h1>Welcome to Your Security Dashboard</h1>
                            <p className="welcome-subtitle">
                                Monitor security events and manage your infrastructure in real-time
                            </p>
                        </div>

                        <div className="dashboard-grid">
                            <div className="info-card">
                                <div className="info-card-header">
                                    <h3>User Information</h3>
                                </div>
                                <div className="info-card-content">
                                    <div className="info-item">
                                        <span className="info-label">Email :</span>
                                        <span className="info-value">{user?.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Role :</span>
                                        <span className="info-value">
                                            <span className={`role-badge role-${user?.role}`}>
                                                {user?.role}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">User ID :</span>
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
                                        <span className="info-label">Company :</span>
                                        <span className="info-value">{tenant?.name}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Tenant ID :</span>
                                        <span className="info-value code">{tenant?.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="range-select">Time Range:</label>
                            <select 
                                id="range-select"
                                value={range} 
                                onChange={handleRangeChange}
                                className="filter-select"
                            >
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>
                        </div>

                        <div className="dashboard-stats">
                            <div className="stat-card">
                                <div className="stat-icon stat-icon-logs"></div>
                                <div className="stat-info">
                                    <div className="stat-label">Total Logs</div>
                                    <div className="stat-value">{stats?.counts?.totalLogs || 0}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon stat-icon-alerts"></div>
                                <div className="stat-info">
                                    <div className="stat-label">Open Alerts</div>
                                    <div className="stat-value">{stats?.counts?.openAlerts || 0}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon stat-icon-alerts"></div>
                                <div className="stat-info">
                                    <div className="stat-label">Warnings</div>
                                    <div className="stat-value">{stats?.counts?.byLevel?.warn || 0}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon stat-icon-alerts"></div>
                                <div className="stat-info">
                                    <div className="stat-label">Errors</div>
                                    <div className="stat-value">{stats?.counts?.byLevel?.error || 0}</div>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-grid">
                            <div className="info-card">
                                <div className="info-card-header">
                                    <h3>Top IP Addresses</h3>
                                </div>
                                <div className="info-card-content">
                                    {stats?.topIps && stats.topIps.length > 0 ? (
                                        stats.topIps.map((item, index) => (
                                            <div key={index} className="info-item">
                                                <span className="info-label">{item.ip}</span>
                                                <span className="info-value">{item.count}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="info-item">
                                            <span className="info-value">No data available</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-card-header">
                                    <h3>Top Event Types</h3>
                                </div>
                                <div className="info-card-content">
                                    {stats?.topEventTypes && stats.topEventTypes.length > 0 ? (
                                        stats.topEventTypes.map((item, index) => (
                                            <div key={index} className="info-item">
                                                <span className="info-label">{item.eventType}</span>
                                                <span className="info-value">{item.count}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="info-item">
                                            <span className="info-value">No data available</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card-header">
                                <h3>Recent Security Alerts</h3>
                            </div>
                            <div className="info-card-content">
                                {stats?.recent?.alerts && stats.recent.alerts.length > 0 ? (
                                    <div className="table-container">
                                        <table className="alerts-table">
                                            <thead>
                                                <tr>
                                                    <th>Time</th>
                                                    <th>Rule Name</th>
                                                    <th>Severity</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recent.alerts.slice(0, 10).map((alert) => (
                                                    <tr key={alert.id}>
                                                        <td>{formatDateTime(alert.timestamp)}</td>
                                                        <td>{alert.ruleName}</td>
                                                        <td>
                                                            <span className={`severity-badge ${getSeverityBadgeClass(alert.severity)}`}>
                                                                {alert.severity}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${getStatusBadgeClass(alert.status)}`}>
                                                                {alert.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="info-item">
                                        <span className="info-value">No recent alerts</span>
                                    </div>
                                ) : (
                                    <div className="info-item">
                                        <span className="info-value">No recent alerts</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card-header">
                                <h3>Recent Log Activity</h3>
                            </div>
                            <div className="info-card-content">
                                {stats?.recent?.logs && stats.recent.logs.length > 0 ? (
                                    <div className="table-container">
                                        <table className="alerts-table">
                                            <thead>
                                                <tr>
                                                    <th>Time</th>
                                                    <th>Level</th>
                                                    <th>Event Type</th>
                                                    <th>Source</th>
                                                    <th>Message</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stats.recent.logs.slice(0, 10).map((log) => (
                                                    <tr key={log.id}>
                                                        <td>{formatDateTime(log.timestamp)}</td>
                                                        <td>
                                                            <span className={`level-badge ${getLevelBadgeClass(log.level)}`}>
                                                                {log.level}
                                                            </span>
                                                        </td>
                                                        <td>{log.eventType}</td>
                                                        <td>{log.source}</td>
                                                        <td>{truncateMessage(log.message)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="info-item">
                                        <span className="info-value">No recent logs</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
