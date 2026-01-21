import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import { getAlerts, updateAlertStatus } from '../services/alertsService';
import { getLogsByIds } from '../services/logsService';
import '../styles/pages.css';

function Alerts() {
    const { tenant } = useAuth();
    const modalCloseButtonRef = useRef(null);

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pageInfo, setPageInfo] = useState({
        limit: 25,
        skip: 0,
        total: 0
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [matchedLogs, setMatchedLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [updateError, setUpdateError] = useState('');

    const [filters, setFilters] = useState({
        status: '',
        severity: '',
        from: '',
        to: ''
    });

    useEffect(() => {
        fetchAlerts();
    }, []);

    useEffect(() => {
        const fetchMatchedLogs = async () => {
            if (selectedAlert && selectedAlert.matchedLogIds && selectedAlert.matchedLogIds.length > 0) {
                setLoadingLogs(true);
                try {
                    const logs = await getLogsByIds(selectedAlert.matchedLogIds);
                    setMatchedLogs(logs);
                } catch (err) {
                    console.error('Failed to fetch matched logs:', err);
                    setMatchedLogs([]);
                } finally {
                    setLoadingLogs(false);
                }
            } else {
                setMatchedLogs([]);
            }
        };

        fetchMatchedLogs();
    }, [selectedAlert]);

    // Keyboard navigation and accessibility
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && selectedAlert) {
                handleCloseModal();
            }
        };

        if (selectedAlert) {
            // Add escape key listener
            document.addEventListener('keydown', handleEscapeKey);
            
            // Auto-focus close button when modal opens
            if (modalCloseButtonRef.current) {
                modalCloseButtonRef.current.focus();
            }

            return () => {
                document.removeEventListener('keydown', handleEscapeKey);
            };
        }
    }, [selectedAlert]);

    const fetchAlerts = async (customFilters = null, page = currentPage) => {
        try {
            setLoading(true);
            setError('');

            const activeFilters = customFilters || filters;
            const skip = (page - 1) * pageInfo.limit;
            const params = {
                limit: pageInfo.limit,
                skip: skip
            };

            if (activeFilters.status) params.status = activeFilters.status;
            if (activeFilters.severity) params.severity = activeFilters.severity;
            if (activeFilters.from) params.from = activeFilters.from;
            if (activeFilters.to) params.to = activeFilters.to;

            const data = await getAlerts(params);
            setAlerts(data.items);
            setPageInfo(data.page);
        } catch (err) {
            setError(err.error || 'Failed to load alerts');
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
        fetchAlerts(null, 1);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            status: '',
            severity: '',
            from: '',
            to: ''
        };
        setFilters(clearedFilters);
        setCurrentPage(1);
        fetchAlerts(clearedFilters, 1);
    };

    const handleCloseModal = () => {
        setSelectedAlert(null);
        setMatchedLogs([]);
        setExpandedLogId(null);
        setUpdateSuccess('');
        setUpdateError('');
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            fetchAlerts(null, newPage);
        }
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(pageInfo.total / pageInfo.limit);
        if (currentPage < totalPages && totalPages > 0) {
            const newPage = currentPage + 1;
            setCurrentPage(newPage);
            fetchAlerts(null, newPage);
        }
    };

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

    const formatEntities = (entities) => {
        if (!entities || Object.keys(entities).length === 0) {
            return '-';
        }
        return Object.entries(entities)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
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

    return (
        <div className="app-layout">
            <Navigation />
            <div className="main-content">
                <div className="container">
                    <div className="page-card">
                        <div className="page-header">
                            <h1>Security Alerts</h1>
                        </div>
                        <p className="page-subtitle">
                            Monitor critical security alerts and incidents for <strong>{tenant?.name}</strong>
                        </p>

                        {error && (
                            <div className="error-banner">
                                <div className="error-message">
                                    {error}
                                </div>
                            </div>
                        )}

                        <div className="filters-bar">
                            <div className="filters-row">
                                <div className="filter-group">
                                    <label htmlFor="status" className="filter-label">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        className="filter-input"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All</option>
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <div className="filter-group">
                                    <label htmlFor="severity" className="filter-label">Severity</label>
                                    <select
                                        id="severity"
                                        name="severity"
                                        className="filter-input"
                                        value={filters.severity}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>

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
                        ) : alerts.length === 0 ? (
                            <div className="empty-state">
                                <p>No alerts found</p>
                            </div>
                        ) : (
                            <>
                                <div className="pagination-info">
                                    <span>
                                        Showing {pageInfo.skip + 1}–{Math.min(pageInfo.skip + pageInfo.limit, pageInfo.total)} of {pageInfo.total} alerts
                                    </span>
                                </div>

                                <div className="table-container">
                                    <table className="alerts-table" aria-label="Security alerts table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Time</th>
                                                <th scope="col">Rule</th>
                                                <th scope="col">Severity</th>
                                                <th scope="col">Status</th>
                                                <th scope="col">Entities</th>
                                                <th scope="col">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {alerts.map((alert) => (
                                                <tr 
                                                    key={alert.id} 
                                                    onClick={() => setSelectedAlert(alert)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            setSelectedAlert(alert);
                                                        }
                                                    }}
                                                    tabIndex={0}
                                                    role="button"
                                                    aria-label={`View alert: ${alert.ruleName}`}
                                                >
                                                    <td>{formatTimestamp(alert.ts)}</td>
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
                                                    <td>{formatEntities(alert.entities)}</td>
                                                    <td>{alert.description}</td>
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

                        {selectedAlert && (
                            <div
                                className="modal-overlay"
                                onClick={handleCloseModal}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="alert-modal-title"
                            >
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <div className="alert-modal-header-content">
                                            <h2 id="alert-modal-title">{selectedAlert.ruleName}</h2>
                                            <div className="alert-modal-badges">
                                                <span className={`severity-badge ${getSeverityBadgeClass(selectedAlert.severity)}`}>
                                                    {selectedAlert.severity}
                                                </span>
                                                <span className={`status-badge ${getStatusBadgeClass(selectedAlert.status)}`}>
                                                    {selectedAlert.status}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            ref={modalCloseButtonRef}
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
                                            <div className="summary-grid">
                                                <div className="summary-item">
                                                    <span className="summary-label">Timestamp:</span>
                                                    <span className="summary-value">{formatTimestamp(selectedAlert.ts)}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Rule Name:</span>
                                                    <span className="summary-value">{selectedAlert.ruleName}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Severity:</span>
                                                    <span className={`severity-badge ${getSeverityBadgeClass(selectedAlert.severity)}`}>
                                                        {selectedAlert.severity}
                                                    </span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Status:</span>
                                                    <span className={`status-badge ${getStatusBadgeClass(selectedAlert.status)}`}>
                                                        {selectedAlert.status}
                                                    </span>
                                                </div>
                                                <div className="summary-item summary-item-full">
                                                    <span className="summary-label">Description:</span>
                                                    <span className="summary-value">{selectedAlert.description}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="modal-section">
                                            <h3>Entities</h3>
                                            {selectedAlert.entities && Object.keys(selectedAlert.entities).length > 0 ? (
                                                <div className="entities-grid">
                                                    {Object.entries(selectedAlert.entities).map(([key, value]) => (
                                                        <div key={key} className="entity-item">
                                                            <span className="entity-key">{key}:</span>
                                                            <span className="entity-value">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="empty-text">No entities associated with this alert</p>
                                            )}
                                        </div>
                                        <div className="modal-section">
                                            <h3>Matched Logs ({matchedLogs.length})</h3>
                                            {loadingLogs ? (
                                                <div className="loading-container">
                                                    <div className="spinner"></div>
                                                </div>
                                            ) : matchedLogs.length === 0 ? (
                                                <p className="empty-text">No matched logs found</p>
                                            ) : (
                                                <div className="matched-logs-table-container">
                                                    <table className="matched-logs-table" aria-label="Matched logs table">
                                                        <thead>
                                                            <tr>
                                                                <th scope="col">Time</th>
                                                                <th scope="col">Event Type</th>
                                                                <th scope="col">IP</th>
                                                                <th scope="col">User</th>
                                                                <th scope="col">Message</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {matchedLogs.map((log) => (
                                                                <>
                                                                    <tr 
                                                                        key={log._id} 
                                                                        onClick={() => setExpandedLogId(expandedLogId === log._id ? null : log._id)}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter' || e.key === ' ') {
                                                                                e.preventDefault();
                                                                                setExpandedLogId(expandedLogId === log._id ? null : log._id);
                                                                            }
                                                                        }}
                                                                        tabIndex={0}
                                                                        role="button"
                                                                        aria-expanded={expandedLogId === log._id}
                                                                        aria-label={`View log details: ${log.message}`}
                                                                        className={expandedLogId === log._id ? 'expanded' : ''}
                                                                    >
                                                                        <td>{formatTimestamp(log.ts)}</td>
                                                                        <td>{log.eventType || '-'}</td>
                                                                        <td>{log.ip || '-'}</td>
                                                                        <td>{log.user || '-'}</td>
                                                                        <td className="log-message">{log.message}</td>
                                                                    </tr>
                                                                    {expandedLogId === log._id && (
                                                                        <tr className="expanded-row">
                                                                            <td colSpan="5">
                                                                                <div className="log-raw-json">
                                                                                    <div className="log-raw-json-header">
                                                                                        <strong>Raw Log Data</strong>
                                                                                        <button 
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setExpandedLogId(null);
                                                                                            }}
                                                                                            className="close-raw-json"
                                                                                        >
                                                                                            ×
                                                                                        </button>
                                                                                    </div>
                                                                                    <pre>{JSON.stringify(log, null, 2)}</pre>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        {updateSuccess && (
                                            <div className="success-message">
                                                {updateSuccess}
                                            </div>
                                        )}
                                        
                                        {updateError && (
                                            <div className="error-message">
                                                {updateError}
                                            </div>
                                        )}

                                        <div className="modal-actions">
                                            <button
                                                onClick={handleUpdateStatus}
                                                className={`btn btn-action ${selectedAlert.status === 'open' ? 'btn-close-alert' : 'btn-reopen-alert'}`}
                                                disabled={updating}
                                            >
                                                {updating ? (
                                                    <>
                                                        <span className="btn-spinner"></span>
                                                        {selectedAlert.status === 'open' ? 'Closing...' : 'Reopening...'}
                                                    </>
                                                ) : (
                                                    selectedAlert.status === 'open' ? 'Close Alert' : 'Reopen Alert'
                                                )}
                                            </button>
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

export default Alerts;
