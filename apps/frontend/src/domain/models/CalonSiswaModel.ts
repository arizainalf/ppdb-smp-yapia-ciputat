export interface CalonSiswaModel {
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
  statusPendaftaran:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'VERIFIED'
    | 'LOLOS_SELEKSI'
    | 'MENGIKUTI_MPLS'
    | 'DITERIMA_RESMI'
    | 'REVISI'
    | 'REJECTED'
    | 'CADANGAN'
    | 'ACCEPTED';
  jalurPendaftaran?: 'REGULER' | 'AFIRMASI' | 'PRESTASI';
  nomorKipSktm?: string;
  pdpConsent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationFormData {
  // Bagian A: Calon Siswa & Jalur
  gelombangId: number;
  jalurPendaftaran: 'REGULER' | 'AFIRMASI' | 'PRESTASI';
  nomorKipSktm?: string;
  namaLengkap: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  noHpSiswa?: string;

  // Bagian B: Pendidikan Sebelumnya & Fisik
  namaSekolahAsal: string;
  alamatSekolahAsal: string;
  nisn: string;
  tinggiBadan: number | string;
  beratBadan: number | string;
  golonganDarah: string;
  penyakitBerat?: string;

  // Bagian C: Alamat Tempat Tinggal
  alamatLengkap: string;
  rt: string;
  rw: string;
  noRumah: string;
  kelurahan: string;
  kecamatan: string;
  kotaKabupaten: string;
  provinsi: string;
  kodePos: string;
  tinggalBersama: 'Orang Tua' | 'Wali' | 'Asrama' | 'Lainnya';

  // Bagian D: Orang Tua & Wali
  // Ayah
  namaAyah: string;
  statusAyah: 'HIDUP' | 'MENINGGAL';
  pendidikanAyah: string;
  tahunLahirAyah: string;
  pekerjaanAyah: string;
  penghasilanAyah: string;
  noHpAyah: string;

  // Ibu
  namaIbu: string;
  statusIbu: 'HIDUP' | 'MENINGGAL';
  pendidikanIbu: string;
  tahunLahirIbu: string;
  pekerjaanIbu: string;
  penghasilanIbu: string;
  noHpIbu: string;

  // Wali (opsional/kondisional)
  namaWali?: string;
  hubunganWali?: string;
  pekerjaanWali?: string;
  noHpWali?: string;

  // Akun & Notifikasi Orang Tua
  emailOrtu?: string;
  email?: string;

  // Bagian E: Unggah Berkas & Pernyataan
  ijazahUploaded: boolean;
  kkUploaded: boolean;
  aktaUploaded: boolean;
  fotoUploaded: boolean;
  ktpOrtuUploaded?: boolean;
  kipUploaded?: boolean;
  pernyataanKebenaran: boolean;
  pdpConsent: boolean;
  pdpConsentAt?: string;

  // Hasil Submit
  nomorPendaftaran?: string;
}
