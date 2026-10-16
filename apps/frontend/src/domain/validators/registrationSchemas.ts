import { z } from 'zod';

export const step1CalonSiswaSchema = z.object({
  namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  jenisKelamin: z.enum(['L', 'P'], { required_error: 'Pilih jenis kelamin' }),
  tempatLahir: z.string().min(2, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid (YYYY-MM-DD)'),
  agama: z.string().min(1, 'Agama wajib dipilih'),
  noHpSiswa: z.string().optional(),
  gelombangId: z.number().int().positive(),
});

export type Step1CalonSiswaInput = z.infer<typeof step1CalonSiswaSchema>;
