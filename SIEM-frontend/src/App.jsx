import { createContext, useEffect, useState } from 'react'
import './styles/App.css'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import Dashboard from './components/Dashboard.jsx'
import axios from 'axios'

export const ServerContext = createContext()
export const AuthContext = createContext()

function App() {
  const navigate = useNavigate()
  const server = axios.create({
    baseURL: "http://localhost:5000/api"
  })
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Session restore
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          server.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
          const res = await server.get('/auth/me')
          setUser(res.data.user)
          setToken(savedToken)
        } catch (err) {
          console.log('Session restore failed:', err)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(newUser)
    server.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete server.defaults.headers.common['Authorization']
    navigate('/login', { replace: true })
  }

  if (loading) {
    return <div className="app-loading">
      Loading...
    </div>
  }

  return (
    <>
      <div className="app-nav">
        <Link to="/login" replace>Login</Link>
        <Link to="/register" replace>Register</Link>
        {user && <Link to="/dashboard" replace>Dashboard</Link>}
        {user && <button onClick={logout}>Logout</button>}
      </div>
      <div className="app-content">
        <ServerContext.Provider value={{ server }}>
          <AuthContext.Provider value={{ user, setUser, token, login, logout }}>
            <Routes>
              <Route path='/' index element={<Login navigate={navigate} />} />
              <Route path='/login' element={<Login navigate={navigate} />} />
              <Route path='/register' element={<Register navigate={navigate} />} />
              <Route path='/dashboard' element={<Dashboard navigate={navigate} />} />
            </Routes>
          </AuthContext.Provider>
        </ServerContext.Provider>
      </div>
    </>
  )
}

export default App
