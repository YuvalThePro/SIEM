import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return (
            <div className="container page-container">
                <div className="page-card text-center">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;
