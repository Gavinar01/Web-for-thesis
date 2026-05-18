require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.post('/api/init-lockers', async (req, res) => {
  try {
    const slots = Array.from({ length: 12 }, (_, index) => ({
      slot_number: index + 1,
      status: 'available'
    }));

    const { error } = await supabase.from('locker_slots').upsert(slots, { onConflict: ['slot_number'] });
    if (error) throw error;

    res.json({ message: '12 locker slots initialized!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { id, password, role = 'student' } = req.body;
    const table = role === 'student' ? 'users' : 'registrar';
    const keyName = role === 'student' ? 'student_id' : 'username';

    const { data: user, error } = await supabase.from(table).select('*').eq(keyName, id).single();
    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, studentId: user.student_id || user.username, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.student_id || user.username, name: user.name, role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/staff-availability', async (req, res) => {
  try {
    const { data, error } = await supabase.from('staff_availability').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/staff-availability/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'registrar') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { error } = await supabase
      .from('staff_availability')
      .update(req.body)
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Staff availability updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/document-requests', authenticateToken, async (req, res) => {
  if (req.user.role !== 'registrar') {
    return res.status(403).json({ error: 'Registrar only' });
  }

  const { studentId, documentType } = req.body;

  try {
    const { data: availableSlot, error: slotError } = await supabase
      .from('locker_slots')
      .select('slot_number')
      .eq('status', 'available')
      .limit(1)
      .single();

    if (slotError || !availableSlot) {
      return res.status(400).json({ error: 'No available locker slots' });
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const qrData = {
      requestId,
      studentId,
      slotNumber: availableSlot.slot_number,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));

    const { data: request, error: insertError } = await supabase
      .from('document_requests')
      .insert({
        id: requestId,
        student_id: studentId,
        document_type: documentType,
        status: 'ready',
        slot_number: availableSlot.slot_number,
        qr_data: qrData,
        qr_code_url: qrCodeUrl
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('locker_slots')
      .update({ status: 'occupied', request_id: requestId, student_id: studentId })
      .eq('slot_number', availableSlot.slot_number);

    if (updateError) throw updateError;

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/document-requests', authenticateToken, async (req, res) => {
  if (req.user.role !== 'registrar') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { data, error } = await supabase
      .from('document_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:studentId/requests', authenticateToken, async (req, res) => {
  if (req.user.studentId !== req.params.studentId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { data, error } = await supabase
      .from('document_requests')
      .select('*')
      .eq('student_id', req.params.studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/locker-status', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locker_slots')
      .select('*')
      .order('slot_number');

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/claim-complete/:requestId', async (req, res) => {
  const { requestId } = req.params;

  try {
    const { data: request, error: requestError } = await supabase
      .from('document_requests')
      .select('slot_number')
      .eq('id', requestId)
      .single();

    if (requestError || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { error: slotError } = await supabase
      .from('locker_slots')
      .update({ status: 'available', request_id: null, student_id: null })
      .eq('slot_number', request.slot_number);

    if (slotError) throw slotError;

    const { error: updateError } = await supabase
      .from('document_requests')
      .update({ status: 'claimed' })
      .eq('id', requestId);

    if (updateError) throw updateError;

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
