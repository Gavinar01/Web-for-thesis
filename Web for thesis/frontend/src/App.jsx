import { useEffect, useState } from 'react';
import api from './utils/api';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import RegistrarDashboard from './components/RegistrarDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('pupDocumentUser');
    const storedToken = localStorage.getItem('token');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setStatus('Logged in');
    } else {
      setStatus('Please log in');
    }

    setLoading(false);
  }, []);

  const handleLogin = async ({ id, password, role }) => {
    setError('');
    try {
      const response = await api.post('/auth/login', { id, password, role });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('pupDocumentUser', JSON.stringify(user));
      setUser(user);
      setStatus('Logged in');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('pupDocumentUser');
    setUser(null);
    setStatus('Please log in');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>PUP Document System</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {!user ? (
        <div>
          <header style={{ padding: '2rem 2rem 0', textAlign: 'center' }}>
            <h1>PUP Document System</h1>
            <p style={{ color: '#4b5563' }}>{status}</p>
          </header>
          <Login onLogin={handleLogin} />
          {error && <p style={{ color: '#b91c1c', textAlign: 'center' }}>{error}</p>}
        </div>
      ) : user.role === 'student' ? (
        <StudentDashboard user={user} onLogout={handleLogout} />
      ) : (
        <RegistrarDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
