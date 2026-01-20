import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getLogs } from '../services/logsService';
import '../styles/pages.css';

function Logs() {
    const { user, tenant, logout } = useAuth();
    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getLogs({ limit: 50 });
            setLogs(data.items);
        } catch (err) {
            setError(err.error || 'Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatTimestamp = (ts) => {
        return new Date(ts).toLocaleString();
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
                    Welcome, <strong>{user?.email}</strong> from <strong>{tenant?.name}</strong>
                </p>

                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <p>No logs found</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Level</th>
                                    <th>Event Type</th>
                                    <th>Source</th>
                                    <th>IP</th>
                                    <th>User</th>
                                    <th>Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log._id}>
                                        <td>{formatTimestamp(log.ts)}</td>
                                        <td>{log.level}</td>
                                        <td>{log.eventType}</td>
                                        <td>{log.source}</td>
                                        <td>{log.ip || '-'}</td>
                                        <td>{log.user || '-'}</td>
                                        <td>{log.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Logs;
