import {
  StatusPendaftaran,
  UserRole,
  JalurPendaftaran,
  KemampuanQuran,
  KategoriHelpdesk,
  StatusHelpdesk,
} from '../constants/index.js';

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

export interface LandingMetricItem {
  title: string;
  subtitle: string;
}

export interface LandingSyaratItem {
  title: string;
  desc: string;
}

export interface LandingStepItem {
  title: string;
  desc: string;
}

export interface LandingContentDTO {
  hero: {
    badgeText: string;
    heroTitle: string;
    heroHighlight: string;
    heroSubtitle: string;
    heroDaftarBtn: string;
    heroCekStatusBtn: string;
  };
  metrics: LandingMetricItem[];
  syarat: {
    syaratBadge: string;
    syaratTitle: string;
    syaratSubtitle: string;
    items: LandingSyaratItem[];
  };
  panduan: {
    panduanBadge: string;
    panduanTitle: string;
    steps: LandingStepItem[];
  };
  cta: {
    ctaBadge: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaPrimaryBtn: string;
    ctaSecondaryBtn: string;
    ctaChip1: string;
    ctaChip2: string;
    ctaChip3: string;
  };
  kontak: {
    namaSekolah: string;
    deskripsiSekolah: string;
    npsn: string;
    akreditasi: string;
    alamatSekolah: string;
    telepon: string;
    whatsapp: string;
    email: string;
    jadwalPelayanan: string;
  };
  updatedAt?: string;
  updatedBy?: string;
}

export interface HelpdeskTicketDTO {
  id: string;
  ticketNumber: string;
  namaPengirim: string;
  noWhatsapp: string;
  email?: string;
  kategori: KategoriHelpdesk;
  subjek: string;
  pesan: string;
  status: StatusHelpdesk;
  tanggapanPanitia?: string;
  ditanggapiOleh?: string;
  ditanggapiAt?: string;
  createdAt: string;
  updatedAt: string;
}


