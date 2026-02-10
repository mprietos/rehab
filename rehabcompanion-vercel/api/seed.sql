-- Seed data for RehabCompanion (Supabase)
-- Execute this AFTER running schema.sql

-- Note: You'll need to manually hash passwords or use your API's registration endpoint
-- These are example bcrypt hashes for 'patient123', 'doctor123', and 'admin123'
-- Password hashing should be done server-side for security

-- Insert Mock Clinic
INSERT INTO clinics (id, name, address, phone, email)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Centro de Rehabilitación Esperanza', 'Calle Principal 123, Madrid, España', '+34 91 123 4567', 'info@esperanza-rehab.es');

-- Insert Admin (password: admin123)
INSERT INTO users (id, email, password, first_name, last_name, role, encryption_key, clinic_id)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@esperanza-rehab.es', '$2b$10$SmhB5W5HLMYFe4DyMF.Fqu7.DUwNhLqpLNkCLZiL8lQiBDo0BZBhS', 'María', 'García', 'ADMIN', 'admin_salt_key_123', '550e8400-e29b-41d4-a716-446655440000');

-- Insert Doctors (password: doctor123)
INSERT INTO users (id, email, password, first_name, last_name, role, encryption_key, clinic_id)
VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'dr.rodriguez@esperanza-rehab.es', '$2b$10$phRkjv.DQQUrIl8zfUKBJeIs8EacKRGy79CU/Oz4ADF85R/iC0QCO', 'Carlos', 'Rodríguez', 'DOCTOR', 'doctor1_salt_key_456', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440003', 'dr.martinez@esperanza-rehab.es', '$2b$10$phRkjv.DQQUrIl8zfUKBJeIs8EacKRGy79CU/Oz4ADF85R/iC0QCO', 'Ana', 'Martínez', 'DOCTOR', 'doctor2_salt_key_789', '550e8400-e29b-41d4-a716-446655440000');

-- Insert Patients (password: patient123)
INSERT INTO users (id, email, password, first_name, last_name, role, encryption_key, clinic_id)
VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 'juan.perez@email.com', '$2b$10$GS6QKD4HPLKc0GWKR/4dx.GaipimHsWgaWIrwnW/6yXe8WwRkPiD.', 'Juan', 'Pérez', 'PATIENT', 'patient1_salt_abc', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440005', 'lucia.fernandez@email.com', '$2b$10$GS6QKD4HPLKc0GWKR/4dx.GaipimHsWgaWIrwnW/6yXe8WwRkPiD.', 'Lucía', 'Fernández', 'PATIENT', 'patient2_salt_def', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440006', 'miguel.santos@email.com', '$2b$10$GS6QKD4HPLKc0GWKR/4dx.GaipimHsWgaWIrwnW/6yXe8WwRkPiD.', 'Miguel', 'Santos', 'PATIENT', 'patient3_salt_ghi', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440007', 'sofia.lopez@email.com', '$2b$10$GS6QKD4HPLKc0GWKR/4dx.GaipimHsWgaWIrwnW/6yXe8WwRkPiD.', 'Sofía', 'López', 'PATIENT', 'patient4_salt_jkl', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440008', 'david.ruiz@email.com', '$2b$10$GS6QKD4HPLKc0GWKR/4dx.GaipimHsWgaWIrwnW/6yXe8WwRkPiD.', 'David', 'Ruiz', 'PATIENT', 'patient5_salt_mno', '550e8400-e29b-41d4-a716-446655440000');

-- Insert Garden States
INSERT INTO garden_states (user_id, plant_stage, current_xp, streak_days, last_action_date, total_tasks_completed)
VALUES
  ('550e8400-e29b-41d4-a716-446655440004', 'SEED', 30, 3, CURRENT_DATE, 2),
  ('550e8400-e29b-41d4-a716-446655440005', 'SPROUT', 150, 7, CURRENT_DATE, 8),
  ('550e8400-e29b-41d4-a716-446655440006', 'PLANT', 450, 15, CURRENT_DATE, 20),
  ('550e8400-e29b-41d4-a716-446655440007', 'PLANT', 580, 21, CURRENT_DATE, 28),
  ('550e8400-e29b-41d4-a716-446655440008', 'FLOWER', 850, 30, CURRENT_DATE, 42);

-- Insert Doctor-Patient relationships
INSERT INTO doctor_patients (doctor_id, patient_id)
VALUES
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005'),
  ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007'),
  ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008');

-- Insert Sample Daily Tasks
INSERT INTO daily_tasks (user_id, description, type, date, is_completed, completed_at)
VALUES
  -- Patient 1 (Juan - SEED)
  ('550e8400-e29b-41d4-a716-446655440004', 'Tomar medicación matutina', 'MEDICATION', CURRENT_DATE, false, NULL),
  ('550e8400-e29b-41d4-a716-446655440004', 'Caminar 15 minutos', 'ACTIVITY', CURRENT_DATE, false, NULL),
  ('550e8400-e29b-41d4-a716-446655440004', '¿Cómo te sientes hoy?', 'EMOTION_CHECK', CURRENT_DATE, true, NOW()),
  
  -- Patient 2 (Lucía - SPROUT)
  ('550e8400-e29b-41d4-a716-446655440005', 'Tomar medicación matutina', 'MEDICATION', CURRENT_DATE, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Ejercicios de fisioterapia', 'ACTIVITY', CURRENT_DATE, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Registro emocional del día', 'EMOTION_CHECK', CURRENT_DATE, false, NULL),
  
  -- Patient 3 (Miguel - PLANT)
  ('550e8400-e29b-41d4-a716-446655440006', 'Medicación matutina y vespertina', 'MEDICATION', CURRENT_DATE, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'Sesión de yoga 30 min', 'ACTIVITY', CURRENT_DATE, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'Meditación guiada', 'ACTIVITY', CURRENT_DATE, false, NULL),
  ('550e8400-e29b-41d4-a716-446655440006', 'Check-in emocional', 'EMOTION_CHECK', CURRENT_DATE, true, NOW()),
  
  -- Patient 4 (Sofía - High PLANT)
  ('550e8400-e29b-41d4-a716-446655440007', 'Medicación completa', 'MEDICATION', CURRENT_DATE, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'Entrenamiento de fuerza', 'ACTIVITY', CURRENT_DATE, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'Paseo al aire libre', 'ACTIVITY', CURRENT_DATE, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'Diario de gratitud', 'EMOTION_CHECK', CURRENT_DATE, true, NOW()),
  
  -- Patient 5 (David - FLOWER)
  ('550e8400-e29b-41d4-a716-446655440008', 'Medicación de mantenimiento', 'MEDICATION', CURRENT_DATE, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440008', 'Rutina deportiva completa', 'ACTIVITY', CURRENT_DATE, true, NOW()),
  ('550e8400-e29b-41d4-a716-446655440008', 'Reflexión semanal', 'EMOTION_CHECK', CURRENT_DATE, true, NOW());
