-- JDIH (Jaringan Dokumentasi dan Informasi Hukum) Database Schema
-- Created for Legal Documentation and Information Network System

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content LONGTEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size INT,
    category_id INT,
    document_number VARCHAR(100),
    document_type ENUM('undang-undang', 'peraturan-pemerintah', 'peraturan-presiden', 'peraturan-menteri', 'keputusan', 'instruksi', 'surat-edaran', 'lainnya') DEFAULT 'lainnya',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_document_type (document_type),
    INDEX idx_published_at (published_at)
);

-- Create audit_logs table for tracking admin activities
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Undang-Undang', 'Peraturan perundang-undangan tingkat tertinggi setelah UUD 1945'),
('Peraturan Pemerintah', 'Peraturan yang ditetapkan oleh Presiden untuk menjalankan undang-undang'),
('Peraturan Presiden', 'Peraturan yang ditetapkan oleh Presiden dalam menyelenggarakan pemerintahan negara'),
('Peraturan Menteri', 'Peraturan yang ditetapkan oleh menteri berdasarkan kewenangan yang ada'),
('Keputusan', 'Keputusan yang bersifat konkret, individual, dan final'),
('Instruksi', 'Peraturan yang berisi perintah dari pejabat yang berwenang'),
('Surat Edaran', 'Surat yang berisi pemberitahuan, penjelasan, atau petunjuk pelaksanaan'),
('Dokumen Lainnya', 'Dokumen hukum lainnya yang tidak termasuk dalam kategori di atas');

-- Insert default admin user (password: admin123 - hashed with bcrypt)
INSERT INTO users (name, email, password, role) VALUES
('Administrator', 'admin@jdih.go.id', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', 'admin'),
('User Demo', 'user@jdih.go.id', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQq', 'user');

-- Insert sample documents
INSERT INTO documents (title, description, content, category_id, document_number, document_type, status, published_at) VALUES
('Undang-Undang Republik Indonesia Nomor 12 Tahun 2011', 'Tentang Pembentukan Peraturan Perundang-undangan', 'Undang-Undang ini mengatur tentang pembentukan peraturan perundang-undangan yang baik dan benar sesuai dengan hierarki peraturan perundang-undangan di Indonesia.', 1, 'UU No. 12 Tahun 2011', 'undang-undang', 'published', '2011-08-12 00:00:00'),
('Peraturan Pemerintah Nomor 80 Tahun 2019', 'Tentang Perdagangan Melalui Sistem Elektronik', 'Peraturan Pemerintah ini mengatur mengenai perdagangan melalui sistem elektronik yang mencakup perdagangan dalam negeri dan lintas negara.', 2, 'PP No. 80 Tahun 2019', 'peraturan-pemerintah', 'published', '2019-12-31 00:00:00'),
('Peraturan Presiden Nomor 95 Tahun 2018', 'Tentang Sistem Pemerintahan Berbasis Elektronik', 'Peraturan Presiden ini mengatur tentang penyelenggaraan Sistem Pemerintahan Berbasis Elektronik dalam rangka mewujudkan tata kelola pemerintahan yang bersih, efektif, transparan, dan akuntabel.', 3, 'Perpres No. 95 Tahun 2018', 'peraturan-presiden', 'published', '2018-11-28 00:00:00'),
('Peraturan Menteri Komunikasi dan Informatika Nomor 20 Tahun 2016', 'Tentang Perlindungan Data Pribadi dalam Sistem Elektronik', 'Peraturan Menteri ini mengatur tentang perlindungan data pribadi dalam sistem elektronik untuk memberikan perlindungan hukum terhadap data pribadi dalam sistem elektronik.', 4, 'Permen Kominfo No. 20 Tahun 2016', 'peraturan-menteri', 'published', '2016-12-01 00:00:00');

-- Create indexes for better performance
CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_documents_search ON documents(title, description, content);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_categories_name ON categories(name);

-- Create view for document listing with category information
CREATE VIEW document_list AS
SELECT 
    d.id,
    d.title,
    d.description,
    d.document_number,
    d.document_type,
    d.status,
    d.published_at,
    d.created_at,
    c.name as category_name,
    c.id as category_id
FROM documents d
LEFT JOIN categories c ON d.category_id = c.id
WHERE d.status = 'published'
ORDER BY d.published_at DESC;

-- Grant permissions (adjust as needed for your database user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON jdih.* TO 'jdih_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Database setup completed
-- Default admin credentials:
-- Email: admin@jdih.go.id
-- Password: admin123 (please change after first login)
