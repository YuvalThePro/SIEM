import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import { getLogs } from '../services/logsService';
import '../styles/pages.css';

function Logs() {
    const { user, tenant } = useAuth();

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
    const [autoRefresh, setAutoRefresh] = useState(false);

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

    const closeButtonRef = useRef(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        if (selectedLog) {
            closeButtonRef.current?.focus();

            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    handleCloseModal();
                }
            };

            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [selectedLog]);

    useEffect(() => {
        if (autoRefresh && !selectedLog) {
            const interval = setInterval(() => {
                fetchLogs();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [autoRefresh, selectedLog, filters, currentPage]);

    /**
     * Fetch logs from API with filtering and pagination
     * @param {Object} customFilters - Optional filters to override state
     * @param {number} page - Page number to fetch
     */
    const fetchLogs = async (customFilters = null, page = currentPage) => {
        try {
            setLoading(true);
            setError('');

            const activeFilters = customFilters || filters;

            // Validate date range
            if (activeFilters.from && activeFilters.to) {
                const fromDate = new Date(activeFilters.from);
                const toDate = new Date(activeFilters.to);
                if (fromDate > toDate) {
                    setError('"From" date must be before "To" date');
                    setLoading(false);
                    return;
                }
            }

            const skip = (page - 1) * pageInfo.limit;
            const params = {
                limit: pageInfo.limit,
                skip: skip
            };

            // Only include non empty filter values
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
            let errorMessage = 'Failed to load logs';

            if (!navigator.onLine) {
                errorMessage = 'Network error: Please check your internet connection';
            } else if (err.error) {
                errorMessage = err.error;
            } else if (err.message) {
                if (err.message.includes('403')) {
                    errorMessage = 'Access forbidden: You do not have permission to view these logs';
                } else if (err.message.includes('500')) {
                    errorMessage = 'Server error: Please try again later';
                } else if (err.message.includes('timeout')) {
                    errorMessage = 'Request timeout: The server took too long to respond';
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle filter input changes
     */
    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    /**
     * Apply current filters and reset to page 1
     */
    const handleApplyFilters = () => {
        setCurrentPage(1);
        fetchLogs(null, 1);
    };

    /**
     * Clear all filters and reset to page 1
     */
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

    /**
     * Navigate to previous page
     */
    const handlePrevPage = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            fetchLogs(null, newPage);
        }
    };

    /**
     * Navigate to next page with validation
     */
    const handleNextPage = () => {
        const totalPages = Math.ceil(pageInfo.total / pageInfo.limit);
        if (currentPage < totalPages && totalPages > 0) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            fetchLogs(null, newPage);
        }
    };

    /**
     * Format timestamp to readable date string
     * @param {Date|string} ts - Timestamp to format
     * @returns {string} Formatted date string
     */
    const formatTimestamp = (ts) => {
        const date = new Date(ts);
        const options = {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return date.toLocaleString('en-US', options);
    };

    /**
     * Get CSS class for level badge based on severity
     * @param {string} level - Log level (info, warn, error, critical)
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

    return (
        <div className="app-layout">
            <Navigation />
            <div className="main-content">
                <div className="container">
                    <div className="page-card">
                        <div className="page-header">
                            <h1>Security Logs</h1>
                        </div>
                        <p className="page-subtitle">
                            Monitor and analyze security events for <strong>{tenant?.name}</strong>
                        </p>

                        {error && (
                            <div className="error-banner">
                                <div className="error-message">
                                    {error}
                                </div>
                                <button onClick={() => fetchLogs()} className="btn-retry">
                                    Retry
                                </button>
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
                                <div className="auto-refresh-toggle">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={autoRefresh}
                                            onChange={(e) => setAutoRefresh(e.target.checked)}
                                        />
                                        <span>Auto-refresh every 30s</span>
                                        {autoRefresh && !selectedLog && (
                                            <span className="refresh-indicator"></span>
                                        )}
                                    </label>
                                </div>
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
                                    <table className="logs-table" aria-label="Security logs table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Time</th>
                                                <th scope="col">Level</th>
                                                <th scope="col">Event Type</th>
                                                <th scope="col">Source</th>
                                                <th scope="col">IP</th>
                                                <th scope="col">User</th>
                                                <th scope="col">Message</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {logs.map((log) => (
                                                <tr key={log._id} onClick={() => setSelectedLog(log)}>
                                                    <td>{formatTimestamp(log.ts)}</td>
                                                    <td>
                                                        <span className={`level-badge ${getLevelBadgeClass(log.level)}`}>
                                                            {log.level}
                                                        </span>
                                                    </td>
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
                            <div
                                className="modal-overlay"
                                onClick={handleCloseModal}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="modal-title"
                            >
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h2 id="modal-title">Log Details</h2>
                                        <button
                                            ref={closeButtonRef}
                                            onClick={handleCloseModal}
                                            className="modal-close"
                                            aria-label="Close modal"
                                        >
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
            </div>
        </div>
    );
}

export default Logs;
