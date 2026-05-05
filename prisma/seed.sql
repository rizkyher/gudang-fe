-- Hapus data lama agar tidak duplikat jika dieksekusi ulang (opsional, hapus baris ini jika tidak perlu)
DELETE FROM users;
DELETE FROM categories;

-- Insert Users (Password untuk keduanya adalah: password123)
-- Hash: $2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa
INSERT INTO users (id, name, email, password, role) 
VALUES 
  ('cltzadmin0000000000000001', 'Administrator', 'admin@khwarizmi.ac.id', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'admin'),
  ('cltzstaff0000000000000002', 'Staff Gudang', 'staff@khwarizmi.ac.id', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'user');

-- Insert Categories
INSERT INTO categories (id, name, icon) 
VALUES 
  ('cltzcat000000000000000001', 'Alat Tulis Kantor', 'pencil'),
  ('cltzcat000000000000000002', 'Elektronik', 'cpu'),
  ('cltzcat000000000000000003', 'Kebersihan', 'trash-2');