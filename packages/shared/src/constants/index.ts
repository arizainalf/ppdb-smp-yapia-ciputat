export const USER_ROLES = {
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
  BENDAHARA: 'BENDAHARA',
  KEPSEK: 'KEPSEK',
  PENDAFTAR: 'PENDAFTAR',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type Permission =
  | 'VIEW_DASHBOARD'
  | 'VIEW_PENDAFTAR'
  | 'VERIFY_BERKAS'
  | 'VERIFY_FISIK'
  | 'ASSESS_OBSERVASI'
  | 'APPROVE_KELULUSAN'
  | 'EXPORT_DAPODIK'
  | 'MANAGE_GELOMBANG'
  | 'MANAGE_USERS'
  | 'VERIFY_PAYMENT'
  | 'VIEW_PENDAFTARAN_SENDIRI'
  | 'DOWNLOAD_BUKTI';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'VIEW_DASHBOARD',
    'VIEW_PENDAFTAR',
    'VERIFY_BERKAS',
    'VERIFY_FISIK',
    'ASSESS_OBSERVASI',
    'APPROVE_KELULUSAN',
    'EXPORT_DAPODIK',
    'MANAGE_GELOMBANG',
    'MANAGE_USERS',
    'VERIFY_PAYMENT',
    'VIEW_PENDAFTARAN_SENDIRI',
    'DOWNLOAD_BUKTI',
  ],
  OPERATOR: [
    'VIEW_DASHBOARD',
    'VIEW_PENDAFTAR',
    'VERIFY_BERKAS',
    'VERIFY_FISIK',
    'ASSESS_OBSERVASI',
    'EXPORT_DAPODIK',
  ],
  KEPSEK: [
    'VIEW_DASHBOARD',
    'VIEW_PENDAFTAR',
    'ASSESS_OBSERVASI',
    'APPROVE_KELULUSAN',
    'EXPORT_DAPODIK',
  ],
  BENDAHARA: [
    'VIEW_DASHBOARD',
    'VIEW_PENDAFTAR',
    'VERIFY_PAYMENT',
  ],
  PENDAFTAR: [
    'VIEW_PENDAFTARAN_SENDIRI',
    'DOWNLOAD_BUKTI',
  ],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const STATUS_PENDAFTARAN = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  VERIFIED: 'VERIFIED',
  LOLOS_SELEKSI: 'LOLOS_SELEKSI',
  MENGIKUTI_MPLS: 'MENGIKUTI_MPLS',
  DITERIMA_RESMI: 'DITERIMA_RESMI',
  REVISI: 'REVISI',
  REJECTED: 'REJECTED',
  CADANGAN: 'CADANGAN',
  ACCEPTED: 'ACCEPTED', // Backward compatibility
} as const;

export type StatusPendaftaran = (typeof STATUS_PENDAFTARAN)[keyof typeof STATUS_PENDAFTARAN];

export const JALUR_PENDAFTARAN = {
  REGULER: 'REGULER',
  AFIRMASI: 'AFIRMASI', // Pemegang KIP / PIP / KKS / SKTM
  PRESTASI: 'PRESTASI', // Tahfidz Qur'an / Prestasi Akademik & Non-akademik
} as const;

export type JalurPendaftaran = (typeof JALUR_PENDAFTARAN)[keyof typeof JALUR_PENDAFTARAN];

export const KEMAMPUAN_QURAN = {
  BELUM_BISA: 'BELUM_BISA',
  IQRA_DASAR: 'IQRA_DASAR', // Iqra Jilid 1 - 3
  IQRA_LANJUT: 'IQRA_LANJUT', // Iqra Jilid 4 - 6
  LANCAR_ALQURAN: 'LANCAR_ALQURAN', // Sudah Al-Qur'an tartil
  TAHFIDZ: 'TAHFIDZ', // Memiliki hafalan Juz 30 / lebih
} as const;

export type KemampuanQuran = (typeof KEMAMPUAN_QURAN)[keyof typeof KEMAMPUAN_QURAN];

export const JENIS_BERKAS = {
  IJAZAH_SKL: 'IJAZAH_SKL',
  KARTU_KELUARGA: 'KARTU_KELUARGA',
  AKTA_KELAHIRAN: 'AKTA_KELAHIRAN',
  FOTO: 'FOTO',
  KIP_PIP: 'KIP_PIP',
  SKTM: 'SKTM',
  SERTIFIKAT_PRESTASI: 'SERTIFIKAT_PRESTASI',
  LAINNYA: 'LAINNYA',
} as const;

export type JenisBerkas = (typeof JENIS_BERKAS)[keyof typeof JENIS_BERKAS];

export const STATUS_PEMBAYARAN = {
  UNPAID: 'UNPAID',
  PENDING: 'PENDING',
  PAID: 'PAID',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
} as const;

export type StatusPembayaran = (typeof STATUS_PEMBAYARAN)[keyof typeof STATUS_PEMBAYARAN];

