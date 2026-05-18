-- Supabase schema for PUP Document System

-- 1. Disable RLS for simplicity (optional)
-- ALTER DATABASE your_project SET app.supabase.enable_rls TO false;

-- USERS table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW()
);

-- REGISTRAR table
CREATE TABLE IF NOT EXISTS registrar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- LOCKER SLOTS table
CREATE TABLE IF NOT EXISTS locker_slots (
  slot_number INTEGER PRIMARY KEY,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'claimed')),
  request_id VARCHAR(50),
  student_id VARCHAR(20),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- DOCUMENT REQUESTS table
CREATE TABLE IF NOT EXISTS document_requests (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'claimed')),
  slot_number INTEGER REFERENCES locker_slots(slot_number),
  qr_data JSONB,
  qr_code_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- STAFF AVAILABILITY table
CREATE TABLE IF NOT EXISTS staff_availability (
  id SERIAL PRIMARY KEY,
  staff_name VARCHAR(100),
  is_available BOOLEAN DEFAULT true,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Example demo data (replace hashed passwords with actual bcrypt hashes)
INSERT INTO users (student_id, name, password_hash) VALUES
('2021001', 'Juan Dela Cruz', '$2a$10$hashedpassword'),
('2021002', 'Maria Santos', '$2a$10$hashedpassword');

INSERT INTO registrar (username, name, password_hash) VALUES
('admin', 'Registrar Admin', '$2a$10$hashedpassword');

INSERT INTO staff_availability (staff_name, is_available) VALUES
('Main Registrar', true),
('Assistant Registrar', true);
