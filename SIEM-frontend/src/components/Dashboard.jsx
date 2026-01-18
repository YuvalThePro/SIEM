import { useContext, useEffect } from "react"
import { AuthContext } from "../App.jsx"
import "../styles/Dashboard.css"

const Dashboard = ({ navigate }) => {
    const { user, logout } = useContext(AuthContext)

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true })
        }
    }, [user, navigate])

    if (!user) {
        return null
    }

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <p className="dashboard-welcome">Welcome back, {user.email}</p>
            
            <div className="dashboard-card">
                <div className="dashboard-info">
                    <div className="dashboard-label">Email</div>
                    <div className="dashboard-value">{user.email}</div>
                    
                    <div className="dashboard-label">Role</div>
                    <div className="dashboard-value">{user.role}</div>
                    
                    <div className="dashboard-label">Organization</div>
                    <div className="dashboard-value">{user.tenantId?.name || 'N/A'}</div>
                    
                    <div className="dashboard-label">User ID</div>
                    <div className="dashboard-userid">{user._id}</div>
                </div>
                
                <div className="dashboard-divider"></div>
                
                <button onClick={logout} className="dashboard-logout">
                    Sign Out
                </button>
            </div>
        </div>
    )
}

export default Dashboard
