import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function StudentDashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/students/${user.id}/requests`);
      setRequests(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user.id]);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome, <strong>{user.name}</strong></p>
          <p style={{ marginTop: 4 }}>Student ID: {user.id}</p>
        </div>
        <button onClick={onLogout} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>

      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2>My Document Requests</h2>
          <button onClick={loadRequests} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #9ca3af', background: '#fff', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading requests...</p>
        ) : error ? (
          <p style={{ color: '#b91c1c' }}>{error}</p>
        ) : requests.length === 0 ? (
          <p>No document requests found yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '10px' }}>Request ID</th>
                  <th style={{ padding: '10px' }}>Document Type</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Slot</th>
                  <th style={{ padding: '10px' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px' }}>{request.id}</td>
                    <td style={{ padding: '10px' }}>{request.document_type}</td>
                    <td style={{ padding: '10px' }}>{request.status}</td>
                    <td style={{ padding: '10px' }}>{request.slot_number || '-'}</td>
                    <td style={{ padding: '10px' }}>{new Date(request.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
