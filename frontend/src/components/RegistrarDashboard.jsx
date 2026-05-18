import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function RegistrarDashboard({ user, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [slots, setSlots] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ studentId: '', documentType: '' });
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setStatusMessage('');

    try {
      const [requestsRes, slotsRes, staffRes] = await Promise.all([
        api.get('/document-requests'),
        api.get('/locker-status'),
        api.get('/staff-availability')
      ]);

      setRequests(requestsRes.data || []);
      setSlots(slotsRes.data || []);
      setStaff(staffRes.data || []);
    } catch (error) {
      setStatusMessage(error.response?.data?.error || 'Unable to load registrar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setStatusMessage('');

    if (!form.studentId || !form.documentType) {
      setStatusMessage('Student ID and document type are required.');
      return;
    }

    try {
      const response = await api.post('/document-requests', form);
      setStatusMessage('Request created successfully.');
      setForm({ studentId: '', documentType: '' });
      loadData();
    } catch (error) {
      setStatusMessage(error.response?.data?.error || 'Unable to create request');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await api.put(`/staff-availability/${item.id}`, { ...item, is_available: !item.is_available });
      loadData();
    } catch (error) {
      setStatusMessage(error.response?.data?.error || 'Unable to update availability');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1>Registrar Dashboard</h1>
          <p>Welcome, <strong>{user.name}</strong></p>
          <p style={{ marginTop: 4 }}>Role: Registrar</p>
        </div>
        <button onClick={onLogout} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>

      <section style={{ marginBottom: 24, background: '#fff', padding: 20, borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
        <h2 style={{ marginBottom: 14 }}>Create Document Request</h2>
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
            <input
              placeholder="Student ID"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
            />
            <input
              placeholder="Document type (e.g. Diploma, Transcript)"
              value={form.documentType}
              onChange={(e) => setForm({ ...form, documentType: e.target.value })}
              style={{ padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
            />
            <button type="submit" style={{ padding: 12, borderRadius: 10, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>
              Create Request
            </button>
          </div>
        </form>
      </section>

      {statusMessage && <p style={{ marginBottom: 24, color: '#1f2937' }}>{statusMessage}</p>}

      <div style={{ display: 'grid', gap: 24 }}>
        <section style={{ background: '#fff', padding: 20, borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2>Locker Status</h2>
            <button onClick={loadData} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #9ca3af', background: '#fff', cursor: 'pointer' }}>
              Refresh
            </button>
          </div>
          {loading ? (
            <p>Loading locker status...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: 10, textAlign: 'left' }}>Slot</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Student ID</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.slot_number} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: 10 }}>{slot.slot_number}</td>
                      <td style={{ padding: 10 }}>{slot.status}</td>
                      <td style={{ padding: 10 }}>{slot.student_id || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={{ background: '#fff', padding: 20, borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
          <h2 style={{ marginBottom: 14 }}>Staff Availability</h2>
          {staff.length === 0 ? (
            <p>No staff availability data available.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {staff.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600' }}>{item.staff_name}</p>
                    <p style={{ margin: '4px 0 0', color: '#6b7280' }}>{item.is_available ? 'Available' : 'Unavailable'}</p>
                  </div>
                  <button onClick={() => toggleAvailability(item)} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: item.is_available ? '#f97316' : '#10b981', color: '#fff', cursor: 'pointer' }}>
                    {item.is_available ? 'Set unavailable' : 'Set available'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ background: '#fff', padding: 20, borderRadius: 16, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
          <h2 style={{ marginBottom: 14 }}>Recent Requests</h2>
          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length === 0 ? (
            <p>No document requests found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: 10, textAlign: 'left' }}>Request ID</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Student ID</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Document Type</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Status</th>
                    <th style={{ padding: 10, textAlign: 'left' }}>Slot</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: 10 }}>{request.id}</td>
                      <td style={{ padding: 10 }}>{request.student_id}</td>
                      <td style={{ padding: 10 }}>{request.document_type}</td>
                      <td style={{ padding: 10 }}>{request.status}</td>
                      <td style={{ padding: 10 }}>{request.slot_number || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
