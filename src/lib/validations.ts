import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['admin', 'user']).optional(),
});

// Document schemas
export const documentSchema = z.object({
  title: z.string().min(1, 'Judul dokumen wajib diisi').max(500, 'Judul terlalu panjang'),
  description: z.string().optional(),
  content: z.string().optional(),
  category_id: z.number().int().positive('Kategori wajib dipilih'),
  document_number: z.string().optional(),
  document_type: z.enum([
    'undang-undang',
    'peraturan-pemerintah',
    'peraturan-presiden',
    'peraturan-menteri',
    'keputusan',
    'instruksi',
    'surat-edaran',
    'lainnya'
  ]).default('lainnya'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  published_at: z.string().datetime().optional(),
});

export const documentUpdateSchema = documentSchema.partial();

// Search schemas
export const searchSchema = z.object({
  q: z.string().min(1, 'Kata kunci pencarian wajib diisi'),
  category_id: z.number().int().positive().optional(),
  document_type: z.enum([
    'undang-undang',
    'peraturan-pemerintah',
    'peraturan-presiden',
    'peraturan-menteri',
    'keputusan',
    'instruksi',
    'surat-edaran',
    'lainnya'
  ]).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(255, 'Nama kategori terlalu panjang'),
  description: z.string().optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => {
    if (!file) return false;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return allowedTypes.includes(file.type);
  }, 'File harus berformat PDF atau Word'),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID harus berupa angka').transform(Number),
});

// Query parameter schemas
export const queryParamsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  sort: z.enum(['newest', 'oldest', 'title_asc', 'title_desc']).default('newest'),
});

// Type exports for TypeScript
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type QueryParamsInput = z.infer<typeof queryParamsSchema>;
