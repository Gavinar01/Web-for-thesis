import { useEffect, useState } from 'react';

export default function Login({ onLogin, role: initialRole, title }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole || 'student');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!id || !password) {
      setError('Student ID / Username and password are required.');
      return;
    }

    onLogin({ id, password, role }).catch((err) => {
      setError(err.message || 'Login failed');
    });
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '1.5rem', background: '#fff', borderRadius: 12, boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
      <h2 style={{ marginBottom: '1rem' }}>{title || 'Sign in'}</h2>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: 10 }}>
          {role === 'student' ? 'Student ID' : 'Username'}
          <input
            style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 8, border: '1px solid #d1d5db' }}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder={role === 'student' ? '2021001' : 'admin'}
          />
        </label>

        <label style={{ display: 'block', marginBottom: 10 }}>
          Password
          <input
            style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 8, border: '1px solid #d1d5db' }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        {!initialRole && (
          <label style={{ display: 'block', marginBottom: 20 }}>
            Role
            <select
              style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 8, border: '1px solid #d1d5db' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="registrar">Registrar</option>
            </select>
          </label>
        )}

        {error && <p style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</p>}

        <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
          Login
        </button>
      </form>
    </div>
  );
}
