-- Hapus data lama agar tidak duplikat jika dieksekusi ulang
DELETE FROM users;
DELETE FROM categories;

-- Insert Users (Database akan otomatis mengisi id: 1 dan 2)
-- Password untuk keduanya adalah: password123
INSERT INTO users (name, email, password, role) 
VALUES 
  ('Administrator', 'rherdians31@gmail.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'admin'),
  ('Staff Gudang', 'staff@khwarizmi.ac.id', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'user');

-- Insert Categories (Database akan otomatis mengisi id: 1, 2, dan 3)
INSERT INTO categories (name, icon) 
VALUES 
  ('Alat Tulis Kantor', 'pencil'),
  ('Elektronik', 'cpu'),
  ('Kebersihan', 'trash-2');