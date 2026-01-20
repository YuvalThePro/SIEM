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
    const [pageInfo, setPageInfo] = useState({
        limit: 50,
        skip: 0,
        total: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const [filters, setFilters] = useState({
        from: '',
        to: '',
        level: '',
        source: '',
        eventType: '',
        ip: '',
        user: '',
        q: ''
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async (customFilters = null, page = currentPage) => {
        try {
            setLoading(true);
            setError('');

            const activeFilters = customFilters || filters;
            const skip = (page - 1) * pageInfo.limit;
            const params = {
                limit: pageInfo.limit,
                skip: skip
            };

            if (activeFilters.from) params.from = activeFilters.from;
            if (activeFilters.to) params.to = activeFilters.to;
            if (activeFilters.level) params.level = activeFilters.level;
            if (activeFilters.source) params.source = activeFilters.source;
            if (activeFilters.eventType) params.eventType = activeFilters.eventType;
            if (activeFilters.ip) params.ip = activeFilters.ip;
            if (activeFilters.user) params.user = activeFilters.user;
            if (activeFilters.q) params.q = activeFilters.q;

            const data = await getLogs(params);
            setLogs(data.items);
            setPageInfo(data.page);
        } catch (err) {
            setError(err.error || 'Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleApplyFilters = () => {
        setCurrentPage(1);
        fetchLogs(null, 1);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            from: '',
            to: '',
            level: '',
            source: '',
            eventType: '',
            ip: '',
            user: '',
            q: ''
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        fetchLogs(clearedFilters, 1);
    };

    const handleCloseModal = () => {
        setSelectedLog(null);
        setCopySuccess(false);
    };

    const handleCopyJSON = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(selectedLog.raw, null, 2));
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            fetchLogs(null, newPage);
        }
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(pageInfo.total / pageInfo.limit);
        if (currentPage < totalPages) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            fetchLogs(null, newPage);
        }
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

                <div className="filters-bar">
                    <div className="filters-row">
                        <div className="filter-group">
                            <label htmlFor="from" className="filter-label">From</label>
                            <input
                                type="datetime-local"
                                id="from"
                                name="from"
                                className="filter-input"
                                value={filters.from}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="to" className="filter-label">To</label>
                            <input
                                type="datetime-local"
                                id="to"
                                name="to"
                                className="filter-input"
                                value={filters.to}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="level" className="filter-label">Level</label>
                            <select
                                id="level"
                                name="level"
                                className="filter-input"
                                value={filters.level}
                                onChange={handleFilterChange}
                            >
                                <option value="">All</option>
                                <option value="info">Info</option>
                                <option value="warn">Warn</option>
                                <option value="error">Error</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="source" className="filter-label">Source</label>
                            <input
                                type="text"
                                id="source"
                                name="source"
                                className="filter-input"
                                placeholder="Source system"
                                value={filters.source}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="eventType" className="filter-label">Event Type</label>
                            <input
                                type="text"
                                id="eventType"
                                name="eventType"
                                className="filter-input"
                                placeholder="Event type"
                                value={filters.eventType}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="ip" className="filter-label">IP</label>
                            <input
                                type="text"
                                id="ip"
                                name="ip"
                                className="filter-input"
                                placeholder="IP address"
                                value={filters.ip}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="user" className="filter-label">User</label>
                            <input
                                type="text"
                                id="user"
                                name="user"
                                className="filter-input"
                                placeholder="Username"
                                value={filters.user}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="q" className="filter-label">Search</label>
                            <input
                                type="text"
                                id="q"
                                name="q"
                                className="filter-input"
                                placeholder="Search in message"
                                value={filters.q}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    <div className="filters-actions">
                        <button onClick={handleApplyFilters} className="btn btn-primary">
                            Apply Filters
                        </button>
                        <button onClick={handleClearFilters} className="btn btn-secondary">
                            Clear Filters
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state">
                        <p>No logs found</p>
                    </div>
                ) : (
                    <>
                        <div className="pagination-info">
                            <span>
                                Showing {pageInfo.skip + 1}–{Math.min(pageInfo.skip + pageInfo.limit, pageInfo.total)} of {pageInfo.total} logs
                            </span>
                        </div>

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
                                        <tr key={log._id} onClick={() => setSelectedLog(log)}>
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

                        <div className="pagination-controls">
                            <button
                                onClick={handlePrevPage}
                                className="btn btn-secondary"
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span className="pagination-page">
                                Page {currentPage} of {Math.ceil(pageInfo.total / pageInfo.limit) || 1}
                            </span>
                            <button
                                onClick={handleNextPage}
                                className="btn btn-secondary"
                                disabled={currentPage >= Math.ceil(pageInfo.total / pageInfo.limit)}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}

                {selectedLog && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Log Details</h2>
                                <button onClick={handleCloseModal} className="modal-close">
                                    &times;
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-section">
                                    <h3>Summary</h3>
                                    <div className="log-summary">
                                        <div className="log-summary-row">
                                            <span className="log-summary-label">Time:</span>
                                            <span className="log-summary-value">{formatTimestamp(selectedLog.ts)}</span>
                                        </div>
                                        <div className="log-summary-row">
                                            <span className="log-summary-label">Level:</span>
                                            <span className="log-summary-value">{selectedLog.level}</span>
                                        </div>
                                        <div className="log-summary-row">
                                            <span className="log-summary-label">Event Type:</span>
                                            <span className="log-summary-value">{selectedLog.eventType}</span>
                                        </div>
                                        <div className="log-summary-row">
                                            <span className="log-summary-label">Source:</span>
                                            <span className="log-summary-value">{selectedLog.source}</span>
                                        </div>
                                        <div className="log-summary-row">
                                            <span className="log-summary-label">IP:</span>
                                            <span className="log-summary-value">{selectedLog.ip || '-'}</span>
                                        </div>
                                        <div className="log-summary-row">
                                            <span className="log-summary-label">User:</span>
                                            <span className="log-summary-value">{selectedLog.user || '-'}</span>
                                        </div>
                                        <div className="log-summary-row">
                                            <span className="log-summary-label">Message:</span>
                                            <span className="log-summary-value">{selectedLog.message}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-section">
                                    <div className="raw-header">
                                        <h3>Raw Data</h3>
                                        <button onClick={handleCopyJSON} className="btn btn-primary btn-sm">
                                            {copySuccess ? 'Copied!' : 'Copy JSON'}
                                        </button>
                                    </div>
                                    <pre className="raw-json">
                                        <code>{JSON.stringify(selectedLog.raw, null, 2)}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Logs;
