import { useState, useContext } from "react"
import { ServerContext, AuthContext } from "../App.jsx"
import "../styles/Login.css"

const Login = ({ navigate }) => {
    const { server } = useContext(ServerContext)
    const { login } = useContext(AuthContext)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setError("")
        setLoading(true)
        try {
            const res = await server.post('/auth/login', { email, password })
            login(res.data.token, res.data.user)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            console.log(err)
            setError(err.response?.data?.error || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>SIEM Login</h1>
                {error && <div className="login-error">{error}</div>}
                <input 
                    type="text" 
                    placeholder="Email" 
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
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <div className="login-divider"><span>or</span></div>
                <button
                    className="secondary"
                    onClick={() => navigate('/register', { replace: true })}
                >
                    Create Account
                </button>
            </div>
        </div>
    )
}

export default Login
