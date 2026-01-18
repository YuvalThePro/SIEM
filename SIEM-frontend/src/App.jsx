import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Logs from './components/Logs';
import Alerts from './components/Alerts';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/style.css';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/logs" 
          element={
            <ProtectedRoute>
              <Logs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alerts" 
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
