import { useState, useContext } from "react"
import { ServerContext, AuthContext } from "../App.jsx"
import "../styles/Register.css"

const Register = ({ navigate }) => {
    const { server } = useContext(ServerContext)
    const { login } = useContext(AuthContext)
    const [tenantName, setTenantName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleRegister = async () => {
        setError("")
        setLoading(true)
        try {
            const res = await server.post('/auth/register', { tenantName, email, password })
            login(res.data.token, res.data.user)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            console.log(err)
            setError(err.response?.data?.error || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-container">
            <div className="register-card">
                <h1>Create Account</h1>
                {error && <div className="register-error">{error}</div>}
                <input 
                    type="text" 
                    placeholder="Organization Name" 
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                />
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                    onClick={handleRegister}
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Account'}
                </button>
                <div className="register-divider"><span>already have an account?</span></div>
                <button
                    className="secondary"
                    onClick={() => navigate('/login', { replace: true })}
                >
                    Sign In
                </button>
            </div>
        </div>
    )
}

export default Register
