import { Routes, Route, Navigate } from 'react-router-dom';
import './styles/style.css';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Auth routes will be added in later commits */}
        {/* Protected routes will be added in later commits */}
      </Routes>
    </div>
  );
}

export default App;
