import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiKeys } from '../services/api';
import '../styles/pages.css';

function ApiKeys() {
    const { user, tenant, logout } = useAuth();
    const navigate = useNavigate();

    // State management
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Fetch API keys on mount
    useEffect(() => {
        fetchApiKeys();
    }, []);

    const fetchApiKeys = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getApiKeys();
            setItems(data);
        } catch (err) {
            console.error('Failed to fetch API keys:', err);
            setError(err.response?.data?.message || 'Failed to load API keys');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container page-container">
            <div className="page-card">
                <div className="page-header">
                    <h1>API Keys</h1>
                    <button onClick={handleLogout} className="btn btn-danger">
                        Logout
                    </button>
                </div>
                <p className="page-subtitle">
                    Manage ingest API keys for <strong>{tenant?.name}</strong>
                </p>

                {/* Loading state */}
                {loading && (
                    <div className="loading-container">
                        <p>Loading API keys...</p>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button onClick={fetchApiKeys} className="btn btn-secondary">
                            Retry
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && items.length === 0 && (
                    <div className="empty-state">
                        <p>No API keys yet. Create one to start ingesting logs.</p>
                    </div>
                )}

                {/* API Keys table */}
                {!loading && !error && items.length > 0 && (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Last Used</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((key) => (
                                    <tr key={key.id}>
                                        <td>
                                            <strong>{key.name}</strong>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${key.enabled ? 'status-active' : 'status-revoked'}`}>
                                                {key.enabled ? 'Active' : 'Revoked'}
                                            </span>
                                        </td>
                                        <td>{formatDate(key.createdAt)}</td>
                                        <td>{formatDate(key.lastUsed)}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                disabled={!key.enabled}
                                            >
                                                Revoke
                                            </button>
                                        </td>
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

export default ApiKeys;
