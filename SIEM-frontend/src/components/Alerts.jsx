import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import '../styles/pages.css';

function Alerts() {
    const { tenant } = useAuth();

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

                        <div className="alert-placeholder">
                            <h3>Alert Management Coming Soon</h3>
                            <p>Real-time security alert monitoring and incident response features will be available in the next release.</p>

                            <div className="feature-preview">
                                <h4>Upcoming Features:</h4>
                                <ul>
                                    <li>Real-time alert notifications</li>
                                    <li>Alert severity classification</li>
                                    <li>Incident response workflow</li>
                                    <li>Alert correlation and aggregation</li>
                                    <li>Custom alert rules and triggers</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Alerts;
