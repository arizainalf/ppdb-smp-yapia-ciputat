export interface CreateCalonSiswaInputDTO {
  userId?: string;
  gelombangId: number;
  namaLengkap: string;
  email?: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  noHpSiswa?: string;
  jalurPendaftaran?: 'REGULER' | 'AFIRMASI' | 'PRESTASI';
  nomorKipSktm?: string;
  pdpConsent?: boolean;
}

export interface CreateCalonSiswaOutputDTO {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  status: string;
  createdAt: string;
}
