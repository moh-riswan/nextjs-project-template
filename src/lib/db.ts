import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jdih',
  port: parseInt(process.env.DB_PORT || '3306'),
};

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Database connection helper
export async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

// Execute query helper
export async function executeQuery(query: string, params: any[] = []) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// User-related database operations
export const userQueries = {
  findByEmail: async (email: string) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const results = await executeQuery(query, [email]) as any[];
    return results[0] || null;
  },

  findById: async (id: number) => {
    const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = ?';
    const results = await executeQuery(query, [id]) as any[];
    return results[0] || null;
  },

  create: async (userData: { name: string; email: string; password: string; role?: string }) => {
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const params = [userData.name, userData.email, userData.password, userData.role || 'user'];
    return await executeQuery(query, params);
  }
};

// Document-related database operations
export const documentQueries = {
  findAll: async (limit: number = 50, offset: number = 0) => {
    const query = `
      SELECT d.*, c.name as category_name 
      FROM documents d 
      LEFT JOIN categories c ON d.category_id = c.id 
      WHERE d.status = 'published' 
      ORDER BY d.published_at DESC 
      LIMIT ? OFFSET ?
    `;
    return await executeQuery(query, [limit, offset]);
  },

  findById: async (id: number) => {
    const query = `
      SELECT d.*, c.name as category_name 
      FROM documents d 
      LEFT JOIN categories c ON d.category_id = c.id 
      WHERE d.id = ?
    `;
    const results = await executeQuery(query, [id]) as any[];
    return results[0] || null;
  },

  search: async (searchTerm: string, categoryId?: number) => {
    let query = `
      SELECT d.*, c.name as category_name 
      FROM documents d 
      LEFT JOIN categories c ON d.category_id = c.id 
      WHERE d.status = 'published' 
      AND (d.title LIKE ? OR d.description LIKE ? OR d.content LIKE ?)
    `;
    let params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

    if (categoryId) {
      query += ' AND d.category_id = ?';
      params.push(categoryId.toString());
    }

    query += ' ORDER BY d.published_at DESC';
    return await executeQuery(query, params);
  },

  create: async (documentData: any) => {
    const query = `
      INSERT INTO documents (title, description, content, file_path, file_name, file_size, category_id, document_number, document_type, status, published_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      documentData.title,
      documentData.description,
      documentData.content,
      documentData.file_path,
      documentData.file_name,
      documentData.file_size,
      documentData.category_id,
      documentData.document_number,
      documentData.document_type,
      documentData.status,
      documentData.published_at
    ];
    return await executeQuery(query, params);
  },

  update: async (id: number, documentData: any) => {
    const query = `
      UPDATE documents 
      SET title = ?, description = ?, content = ?, category_id = ?, document_number = ?, document_type = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [
      documentData.title,
      documentData.description,
      documentData.content,
      documentData.category_id,
      documentData.document_number,
      documentData.document_type,
      documentData.status,
      id
    ];
    return await executeQuery(query, params);
  },

  delete: async (id: number) => {
    const query = 'DELETE FROM documents WHERE id = ?';
    return await executeQuery(query, [id]);
  }
};

// Category-related database operations
export const categoryQueries = {
  findAll: async () => {
    const query = 'SELECT * FROM categories ORDER BY name';
    return await executeQuery(query);
  },

  findById: async (id: number) => {
    const query = 'SELECT * FROM categories WHERE id = ?';
    const results = await executeQuery(query, [id]) as any[];
    return results[0] || null;
  }
};

// Audit log operations
export const auditQueries = {
  log: async (logData: { user_id: number; action: string; table_name: string; record_id?: number; old_values?: any; new_values?: any; ip_address?: string; user_agent?: string }) => {
    const query = `
      INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      logData.user_id,
      logData.action,
      logData.table_name,
      logData.record_id || null,
      logData.old_values ? JSON.stringify(logData.old_values) : null,
      logData.new_values ? JSON.stringify(logData.new_values) : null,
      logData.ip_address || null,
      logData.user_agent || null
    ];
    return await executeQuery(query, params);
  }
};

export default pool;
