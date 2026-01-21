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

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getAlerts({ limit: 25 });
            setAlerts(data.items);
            setPageInfo(data.page);
        } catch (err) {
            setError(err.error || 'Failed to load alerts');
        } finally {
            setLoading(false);
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
