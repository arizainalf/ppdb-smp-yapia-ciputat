import { z } from 'zod';

export const createCalonSiswaSchema = z.object({
  userId: z.string().uuid('Format UUID tidak valid').optional().or(z.string().min(1).optional()),
  gelombangId: z.number().int().positive('Gelombang ID harus valid'),
  namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  jenisKelamin: z.enum(['L', 'P'], { required_error: 'Pilih jenis kelamin L atau P' }),
  tempatLahir: z.string().min(2, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal lahir YYYY-MM-DD'),
  agama: z.string().min(2, 'Agama wajib diisi'),
  noHpSiswa: z.string().regex(/^08[0-9]{8,11}$/, 'Format nomor HP tidak valid').optional().or(z.literal('')),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  
  // Data Ortu & Sekolah
  namaOrtu: z.string().optional().or(z.literal('')),
  noHpOrtu: z.string().optional().or(z.literal('')),
  sekolahAsal: z.string().optional().or(z.literal('')),
  nisn: z.string().optional().or(z.literal('')),
  alamat: z.string().optional().or(z.literal('')),

  // Fitur Tata Kelola: Jalur & KIP/SKTM
  jalurPendaftaran: z.enum(['REGULER', 'AFIRMASI', 'PRESTASI']).default('REGULER'),
  nomorKipSktm: z.string().optional().or(z.literal('')),

  // Kepatuhan UU PDP No. 27/2022
  pdpConsent: z.boolean().refine((val) => val === true, {
    message: 'Anda wajib menyetujui ketentuan pemrosesan data pribadi (UU PDP No. 27/2022)',
  }).default(true),
});

export type CreateCalonSiswaInput = z.infer<typeof createCalonSiswaSchema>;

export const loginSchema = z.object({
  noHp: z.string().min(3, 'Nomor WhatsApp atau Email wajib diisi'),
  password: z.string().min(4, 'Password minimal 4 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;
