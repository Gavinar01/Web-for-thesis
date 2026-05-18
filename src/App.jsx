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
  const [selectedRole, setSelectedRole] = useState('');
  const [studentAction, setStudentAction] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('pupDocumentUser');
    const storedToken = localStorage.getItem('token');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setStatus('Logged in');
    } else {
      setStatus('Please select a role');
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
    setSelectedRole('');
    setStudentAction('');
    setStatus('Please select a role');
  };

  const resetSelection = () => {
    setSelectedRole('');
    setStudentAction('');
    setError('');
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    setStudentAction('');
    setError('');
  };

  const selectStudentAction = (action) => {
    setSelectedRole('student');
    setStudentAction(action);
    setError('');
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

          {!selectedRole ? (
            <div style={{ maxWidth: 560, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 20, boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
              <p style={{ marginBottom: 24, color: '#374151' }}>Choose your entry point:</p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => selectRole('student')} style={{ flex: '1 1 180px', padding: '16px 20px', borderRadius: 14, border: '1px solid #cbd5e1', background: '#e0f2fe', color: '#0369a1', fontSize: 16, cursor: 'pointer' }}>
                  Student
                </button>
                <button onClick={() => selectRole('registrar')} style={{ flex: '1 1 180px', padding: '16px 20px', borderRadius: 14, border: '1px solid #cbd5e1', background: '#fef3c7', color: '#92400e', fontSize: 16, cursor: 'pointer' }}>
                  Registrar
                </button>
              </div>
            </div>
          ) : selectedRole === 'student' && !studentAction ? (
            <div style={{ maxWidth: 560, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 20, boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ margin: 0 }}>Student Actions</h2>
                  <p style={{ margin: '8px 0 0', color: '#475569' }}>Select an action below to continue.</p>
                </div>
                <button onClick={resetSelection} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>
                  Change role
                </button>
              </div>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => selectStudentAction('claim')} style={{ flex: '1 1 200px', padding: '16px 20px', borderRadius: 14, border: '1px solid #cbd5e1', background: '#d1fae5', color: '#047857', fontSize: 16, cursor: 'pointer' }}>
                  Claim Document
                </button>
                <button onClick={() => selectStudentAction('request')} style={{ flex: '1 1 200px', padding: '16px 20px', borderRadius: 14, border: '1px solid #cbd5e1', background: '#ede9fe', color: '#5b21b6', fontSize: 16, cursor: 'pointer' }}>
                  Request Document
                </button>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: 520, margin: '2rem auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0 }}>{selectedRole === 'registrar' ? 'Registrar Login' : 'Student Login'}</h2>
                  {studentAction && <p style={{ margin: '8px 0 0', color: '#475569' }}>Selected action: <strong>{studentAction === 'claim' ? 'Claim Document' : 'Request Document'}</strong></p>}
                </div>
                <button onClick={resetSelection} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>
                  Back
                </button>
              </div>
              <Login
                onLogin={handleLogin}
                role={selectedRole}
                title={selectedRole === 'registrar' ? 'Registrar Login' : 'Student Login'}
              />
            </div>
          )}

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
