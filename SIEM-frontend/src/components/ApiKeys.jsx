import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiKeys, createApiKey, revokeApiKey } from '../services/api';
import '../styles/pages.css';

function ApiKeys() {
    const { user, tenant, logout } = useAuth();
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    // Raw key modal state
    const [showRawKeyModal, setShowRawKeyModal] = useState(false);
    const [rawKeyValue, setRawKeyValue] = useState('');
    const [copiedMessage, setCopiedMessage] = useState('');

    // Revoke state
    const [revokeLoadingId, setRevokeLoadingId] = useState(null);
    const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
    const [keyToRevoke, setKeyToRevoke] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
        return date.toLocaleString("en-US", options);
    };

    const handleCreateClick = () => {
        setShowCreateModal(true);
        setNewKeyName('');
        setCreateError(null);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!newKeyName.trim()) {
            setCreateError('Name is required');
            return;
        }

        setCreating(true);
        setCreateError(null);

        try {
            const result = await createApiKey(newKeyName.trim());
            setShowCreateModal(false);
            setRawKeyValue(result.rawKey);
            setShowRawKeyModal(true);
            await fetchApiKeys();
        } catch (err) {
            console.error('Failed to create API key:', err);
            setCreateError(err.response?.data?.message || 'Failed to create API key');
        } finally {
            setCreating(false);
        }
    };

    const handleCopyKey = async () => {
        try {
            await navigator.clipboard.writeText(rawKeyValue);
            setCopiedMessage('Copied!');
            setTimeout(() => setCopiedMessage(''), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            setCopiedMessage('Failed to copy');
        }
    };

    const handleRevokeClick = (key) => {
        setKeyToRevoke(key);
        setShowRevokeConfirm(true);
    };

    const handleRevokeConfirm = async () => {
        if (!keyToRevoke) return;

        setRevokeLoadingId(keyToRevoke.id);
        setShowRevokeConfirm(false);

        try {
            await revokeApiKey(keyToRevoke.id);
            setItems(items.map(item =>
                item.id === keyToRevoke.id
                    ? { ...item, enabled: false }
                    : item
            ));
        } catch (err) {
            console.error('Failed to revoke API key:', err);
            alert(err.response?.data?.message || 'Failed to revoke API key');
        } finally {
            setRevokeLoadingId(null);
            setKeyToRevoke(null);
        }
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

                <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                    <button onClick={handleCreateClick} className="btn btn-primary">
                        + Create API Key
                    </button>
                </div>

                {loading && (
                    <div className="loading-container">
                        <p>Loading API keys...</p>
                    </div>
                )}

                {error && (
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button onClick={fetchApiKeys} className="btn btn-secondary">
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="empty-state">
                        <p>No API keys yet. Create one to start ingesting logs.</p>
                    </div>
                )}

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
                                                disabled={!key.enabled || revokeLoadingId === key.id}
                                                onClick={() => handleRevokeClick(key)}
                                            >
                                                {revokeLoadingId === key.id ? 'Revoking...' : 'Revoke'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showCreateModal && (
                    <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Create API Key</h2>
                            <form onSubmit={handleCreateSubmit}>
                                <div className="form-group">
                                    <label htmlFor="keyName">Name *</label>
                                    <input
                                        type="text"
                                        id="keyName"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="e.g., prod, staging, web-server"
                                        maxLength={100}
                                        disabled={creating}
                                        autoFocus
                                    />
                                    <small>Give this key a descriptive name (1-100 characters)</small>
                                </div>
                                {createError && (
                                    <p className="error-message">{createError}</p>
                                )}
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="btn btn-secondary"
                                        disabled={creating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={creating || !newKeyName.trim()}
                                    >
                                        {creating ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showRawKeyModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>API Key Created!</h2>
                            <div className="warning-box">
                                <strong>⚠️ Important:</strong> Save this key now. You won't see it again.
                            </div>
                            <div className="key-display">
                                <code>{rawKeyValue}</code>
                            </div>
                            <button onClick={handleCopyKey} className="btn btn-secondary" style={{ width: '100%', marginBottom: '1rem' }}>
                                {copiedMessage || 'Copy to Clipboard'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRawKeyModal(false);
                                    setRawKeyValue('');
                                    setCopiedMessage('');
                                }}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                I've Saved the Key
                            </button>
                        </div>
                    </div>
                )}

                {showRevokeConfirm && keyToRevoke && (
                    <div className="modal-overlay" onClick={() => setShowRevokeConfirm(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Revoke API Key</h2>
                            <p>Are you sure you want to revoke key <strong>'{keyToRevoke.name}'</strong>?</p>
                            <div className="warning-box">
                                <strong>⚠️ Warning:</strong> Ingest will stop working for systems using this key.
                            </div>
                            <div className="modal-actions">
                                <button
                                    onClick={() => {
                                        setShowRevokeConfirm(false);
                                        setKeyToRevoke(null);
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRevokeConfirm}
                                    className="btn btn-danger"
                                >
                                    Revoke Key
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ApiKeys;
