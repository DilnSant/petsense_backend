import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useState } from 'react';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const setAuth = (t) => {
    localStorage.setItem('token', t);
    setToken(t);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setAuth} />} />
        <Route
          path="/"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
