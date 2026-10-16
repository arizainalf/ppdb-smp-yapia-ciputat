import { StatusPendaftaran, UserRole, JalurPendaftaran, KemampuanQuran } from '../constants/index.js';

export interface UserDTO {
  id: string;
  namaLengkap: string;
  noHp: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface CalonSiswaDTO {
  id: string;
  userId: string;
  gelombangId: number;
  nomorPendaftaran: string;
  namaLengkap: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  noHpSiswa?: string;
  statusPendaftaran: StatusPendaftaran;
  
  // Fitur Audit Tata Kelola: Jalur Afirmasi & KIP
  jalurPendaftaran: JalurPendaftaran;
  nomorKipSktm?: string;
  
  // Kepatuhan UU PDP No. 27/2022
  pdpConsent: boolean;
  pdpConsentAt?: string;

  // Verifikasi Fisik TU (Two-Eyes Principle / Golden Record)
  verifikasiFisik?: {
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    notes?: string;
  };

  // Observasi Khusus & Tes Penempatan (Waka Kesiswaan & Rombel)
  observasi?: {
    kemampuanQuran?: KemampuanQuran | string;
    catatanPendampingan?: string;
    catatanWawancara?: string;
    assessedBy?: string;
    assessedAt?: string;
  };

  // Audit Trail Riwayat Perubahan
  auditLogs?: Array<{
    action: string;
    actor: string;
    timestamp: string;
    notes?: string;
  }>;

  // Dapodik Standard Fields
  nisn?: string;
  nik?: string;
  noKk?: string;
  namaIbuKandung?: string;
  sekolahAsal?: string;
  npsnAsal?: string;
  kecamatanAsal?: string;
  kabupatenAsal?: string;
  provinsiAsal?: string;

  createdAt: string;
  updatedAt: string;
}

export interface GelombangPendaftaranDTO {
  id: number;
  namaGelombang: string;
  tahunAjaran: string;
  tanggalBuka: string;
  tanggalTutup: string;
  kuotaMaksimal: number;
  biayaPendaftaran: number;
  isActive: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  errors?: unknown[];
}
