import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import { getStats } from '../services/statsService';
import '../styles/pages.css';

function Dashboard() {
    const { user, tenant } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [range, setRange] = useState('24h');

    useEffect(() => {
        fetchStats();
    }, []);

    /**
     * Fetches dashboard statistics from the API
     * @param {string|null} customRange - Optional time range override (24h, 7d, 30d)
     */
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

    /**
     * Retries fetching statistics after an error
     */
    const handleRetry = () => {
        fetchStats();
    };

    /**
     * Handles time range selection change
     * @param {Event} e - Change event from select element
     */
    const handleRangeChange = (e) => {
        const newRange = e.target.value;
        setRange(newRange);
        fetchStats(newRange);
    };

    /**
     * Returns CSS class for alert severity badge
     * @param {string} severity - Alert severity level
     * @returns {string} CSS class name
     */
    const getSeverityBadgeClass = (severity) => {
        const severityMap = {
            low: 'badge-severity-low',
            medium: 'badge-severity-medium',
            high: 'badge-severity-high',
            critical: 'badge-severity-critical'
        };
        return severityMap[severity] || 'badge-severity-low';
    };

    /**
     * Returns CSS class for alert status badge
     * @param {string} status - Alert status
     * @returns {string} CSS class name
     */
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            open: 'badge-status-open',
            closed: 'badge-status-closed'
        };
        return statusMap[status] || 'badge-status-open';
    };

    /**
     * Returns CSS class for log level badge
     * @param {string} level - Log level
     * @returns {string} CSS class name
     */
    const getLevelBadgeClass = (level) => {
        const levelMap = {
            info: 'badge-info',
            warn: 'badge-warn',
            error: 'badge-error',
            critical: 'badge-critical'
        };
        return levelMap[level] || 'badge-info';
    };

    /**
     * Truncates a message to specified length with ellipsis
     * @param {string} message - Message to truncate
     * @param {number} maxLength - Maximum length before truncation
     * @returns {string} Truncated message
     */
    const truncateMessage = (message, maxLength = 60) => {
        if (!message) return '';
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    /**
     * Formats a date string for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date string
     */
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Navigates to logs page with pre-applied filters
     * @param {string} filterType - Type of filter (source or eventType)
     * @param {string} filterValue - Value to filter by
     */
    const handleNavigateToLogs = (filterType, filterValue) => {
        const params = new URLSearchParams();
        if (filterType === 'source') {
            params.set('source', filterValue);
        } else if (filterType === 'eventType') {
            params.set('eventType', filterValue);
        }
        navigate(`/logs?${params.toString()}`);
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

                        {error && (
                            <div className="error-banner" role="alert" aria-live="polite">
                                <div className="error-content">
                                    <div className="error-message">
                                        {error}
                                    </div>
                                    <button onClick={handleRetry} className="btn btn-retry" aria-label="Retry loading statistics">
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="loading-container" role="status" aria-live="polite">
                                <div className="spinner" aria-hidden="true"></div>
                                <p className="loading-text">Loading dashboard statistics...</p>
                            </div>
                        ) : (
                            <>
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
                                aria-label="Select time range for dashboard statistics"
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
                                <div className="info-card-content" role="list" aria-label="Top IP addresses">
                                    {stats?.topIps && stats.topIps.length > 0 ? (
                                        stats.topIps.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className="info-item" 
                                                role="listitem"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleNavigateToLogs('source', item.ip)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleNavigateToLogs('source', item.ip)}
                                                tabIndex={0}
                                                aria-label={`${item.ip} with ${item.count} occurrences, click to view logs`}
                                            >
                                                <span className="info-label">{item.ip}</span>
                                                <span className="info-value">{item.count}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="info-item" role="listitem">
                                            <span className="info-value">No IP data available</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="info-card">
                                <div className="info-card-header">
                                    <h3>Top Event Types</h3>
                                </div>
                                <div className="info-card-content" role="list" aria-label="Top event types">
                                    {stats?.topEventTypes && stats.topEventTypes.length > 0 ? (
                                        stats.topEventTypes.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className="info-item"
                                                role="listitem"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleNavigateToLogs('eventType', item.eventType)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleNavigateToLogs('eventType', item.eventType)}
                                                tabIndex={0}
                                                aria-label={`${item.eventType} with ${item.count} occurrences, click to view logs`}
                                            >
                                                <span className="info-label">{item.eventType}</span>
                                                <span className="info-value">{item.count}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="info-item" role="listitem">
                                            <span className="info-value">No event type data available</span>
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
                                    <div className="table-container" role="region" aria-label="Recent security alerts table">
                                        <table className="alerts-table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Time</th>
                                                    <th scope="col">Rule Name</th>
                                                    <th scope="col">Severity</th>
                                                    <th scope="col">Status</th>
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
                                        <span className="info-value">No recent alerts found</span>
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
                                    <div className="table-container" role="region" aria-label="Recent log activity table">
                                        <table className="alerts-table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Time</th>
                                                    <th scope="col">Level</th>
                                                    <th scope="col">Event Type</th>
                                                    <th scope="col">Source</th>
                                                    <th scope="col">Message</th>
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
                                        <span className="info-value">No recent logs found</span>
                                    </div>
                                )}
                            </div>
                        </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
