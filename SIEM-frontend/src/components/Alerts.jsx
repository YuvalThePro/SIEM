import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import { getAlerts } from '../services/alertsService';
import '../styles/pages.css';

function Alerts() {
    const { tenant } = useAuth();

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pageInfo, setPageInfo] = useState({
        limit: 25,
        skip: 0,
        total: 0
    });
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, setFilters] = useState({
        status: '',
        severity: '',
        from: '',
        to: ''
    });

    useEffect(() => {
        fetchAlerts();
    }, []);

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
                                            <tr key={alert.id}>
                                                <td>{formatTimestamp(alert.ts)}</td>
                                                <td>{alert.ruleName}</td>
                                                <td>{alert.severity}</td>
                                                <td>{alert.status}</td>
                                                <td>{formatEntities(alert.entities)}</td>
                                                <td>{alert.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Alerts;
