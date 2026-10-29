// ==============================================================================
// MASTER DATA WILAYAH & KODE POS
// SIPMB SMP YAPIA Ciputat
// ==============================================================================

export interface KelurahanKodePos {
  kelurahan: string;
  kodePos: string;
}

export interface KecamatanData {
  kecamatan: string;
  kelurahanList: KelurahanKodePos[];
}

export interface KotaData {
  nama: string;
  isEligibleBantuanTangsel?: boolean;
  kecamatanList?: KecamatanData[];
}

export interface ProvinsiData {
  nama: string;
  kotaList: KotaData[];
}

// ------------------------------------------------------------------------------
// DATA MASTER KHUSUS KOTA TANGERANG SELATAN (7 KECAMATAN & 54 KELURAHAN DENGAN KODE POS)
// ------------------------------------------------------------------------------
export const KECAMATAN_TANGSEL: KecamatanData[] = [
  {
    kecamatan: 'Ciputat',
    kelurahanList: [
      { kelurahan: 'Cipayung', kodePos: '15411' },
      { kelurahan: 'Ciputat', kodePos: '15411' },
      { kelurahan: 'Sawah Baru', kodePos: '15413' },
      { kelurahan: 'Sawah Lama', kodePos: '15413' },
      { kelurahan: 'Serua', kodePos: '15414' },
      { kelurahan: 'Serua Indah', kodePos: '15414' },
      { kelurahan: 'Jombang', kodePos: '15414' },
    ],
  },
  {
    kecamatan: 'Ciputat Timur',
    kelurahanList: [
      { kelurahan: 'Cireundeu', kodePos: '15419' },
      { kelurahan: 'Pisangan', kodePos: '15419' },
      { kelurahan: 'Pondok Ranji', kodePos: '15412' },
      { kelurahan: 'Rempoa', kodePos: '15412' },
      { kelurahan: 'Rengas', kodePos: '15412' },
      { kelurahan: 'Cempaka Putih', kodePos: '15412' },
    ],
  },
  {
    kecamatan: 'Pamulang',
    kelurahanList: [
      { kelurahan: 'Bambu Apus', kodePos: '15415' },
      { kelurahan: 'Benda Baru', kodePos: '15418' },
      { kelurahan: 'Kedaung', kodePos: '15415' },
      { kelurahan: 'Pamulang Barat', kodePos: '15417' },
      { kelurahan: 'Pamulang Timur', kodePos: '15417' },
      { kelurahan: 'Pondok Benda', kodePos: '15416' },
      { kelurahan: 'Pondok Cabe Ilir', kodePos: '15418' },
      { kelurahan: 'Pondok Cabe Udik', kodePos: '15418' },
    ],
  },
  {
    kecamatan: 'Pondok Aren',
    kelurahanList: [
      { kelurahan: 'Jurang Mangu Barat', kodePos: '15223' },
      { kelurahan: 'Jurang Mangu Timur', kodePos: '15222' },
      { kelurahan: 'Pondok Kacang Barat', kodePos: '15226' },
      { kelurahan: 'Pondok Kacang Timur', kodePos: '15226' },
      { kelurahan: 'Perigi Lama', kodePos: '15227' },
      { kelurahan: 'Perigi Baru', kodePos: '15228' },
      { kelurahan: 'Pondok Aren', kodePos: '15224' },
      { kelurahan: 'Pondok Karya', kodePos: '15225' },
      { kelurahan: 'Pondok Jaya', kodePos: '15224' },
      { kelurahan: 'Pondok Betung', kodePos: '15221' },
      { kelurahan: 'Pondok Pucung', kodePos: '15229' },
    ],
  },
  {
    kecamatan: 'Serpong',
    kelurahanList: [
      { kelurahan: 'Buaran', kodePos: '15310' },
      { kelurahan: 'Ciater', kodePos: '15310' },
      { kelurahan: 'Cilenggang', kodePos: '15310' },
      { kelurahan: 'Lengkong Gudang', kodePos: '15321' },
      { kelurahan: 'Lengkong Gudang Timur', kodePos: '15321' },
      { kelurahan: 'Lengkong Wetan', kodePos: '15322' },
      { kelurahan: 'Rawa Buntu', kodePos: '15318' },
      { kelurahan: 'Rawa Mekar Jaya', kodePos: '15310' },
      { kelurahan: 'Serpong', kodePos: '15311' },
    ],
  },
  {
    kecamatan: 'Serpong Utara',
    kelurahanList: [
      { kelurahan: 'Jelupang', kodePos: '15323' },
      { kelurahan: 'Lengkong Karya', kodePos: '15320' },
      { kelurahan: 'Pakualam', kodePos: '15320' },
      { kelurahan: 'Pakulonan', kodePos: '15325' },
      { kelurahan: 'Paku Jaya', kodePos: '15324' },
      { kelurahan: 'Pondok Jagung', kodePos: '15326' },
      { kelurahan: 'Pondok Jagung Timur', kodePos: '15326' },
    ],
  },
  {
    kecamatan: 'Setu',
    kelurahanList: [
      { kelurahan: 'Babakan', kodePos: '15315' },
      { kelurahan: 'Bakti Jaya', kodePos: '15315' },
      { kelurahan: 'Kademangan', kodePos: '15314' },
      { kelurahan: 'Keranggan', kodePos: '15312' },
      { kelurahan: 'Muncul', kodePos: '15314' },
      { kelurahan: 'Setu', kodePos: '15314' },
    ],
  },
];

// ------------------------------------------------------------------------------
// MASTER PROVINSI & KOTA
// ------------------------------------------------------------------------------
export const MASTER_WILAYAH: ProvinsiData[] = [
  {
    nama: 'Banten',
    kotaList: [
      { nama: 'Kota Tangerang Selatan', isEligibleBantuanTangsel: true, kecamatanList: KECAMATAN_TANGSEL },
      { nama: 'Kota Tangerang' },
      { nama: 'Kabupaten Tangerang' },
      { nama: 'Kota Serang' },
      { nama: 'Kabupaten Serang' },
      { nama: 'Kota Cilegon' },
      { nama: 'Kabupaten Lebak' },
      { nama: 'Kabupaten Pandeglang' },
    ],
  },
  {
    nama: 'DKI Jakarta',
    kotaList: [
      { nama: 'Kota Jakarta Selatan' },
      { nama: 'Kota Jakarta Barat' },
      { nama: 'Kota Jakarta Pusat' },
      { nama: 'Kota Jakarta Timur' },
      { nama: 'Kota Jakarta Utara' },
      { nama: 'Kabupaten Kepulauan Seribu' },
    ],
  },
  {
    nama: 'Jawa Barat',
    kotaList: [
      { nama: 'Kota Depok' },
      { nama: 'Kota Bogor' },
      { nama: 'Kabupaten Bogor' },
      { nama: 'Kota Bekasi' },
      { nama: 'Kabupaten Bekasi' },
      { nama: 'Kota Bandung' },
      { nama: 'Kabupaten Bandung' },
      { nama: 'Kota Sukabumi' },
      { nama: 'Kabupaten Sukabumi' },
      { nama: 'Kabupaten Cianjur' },
      { nama: 'Kota Cirebon' },
      { nama: 'Kabupaten Karawang' },
    ],
  },
  {
    nama: 'Jawa Tengah',
    kotaList: [
      { nama: 'Kota Semarang' },
      { nama: 'Kota Surakarta' },
      { nama: 'Kabupaten Banyumas' },
      { nama: 'Kabupaten Magelang' },
      { nama: 'Lainnya di Jawa Tengah' },
    ],
  },
  {
    nama: 'D.I. Yogyakarta',
    kotaList: [
      { nama: 'Kota Yogyakarta' },
      { nama: 'Kabupaten Sleman' },
      { nama: 'Kabupaten Bantul' },
      { nama: 'Kabupaten Gunungkidul' },
      { nama: 'Kabupaten Kulon Progo' },
    ],
  },
  {
    nama: 'Jawa Timur',
    kotaList: [
      { nama: 'Kota Surabaya' },
      { nama: 'Kota Malang' },
      { nama: 'Kabupaten Sidoarjo' },
      { nama: 'Lainnya di Jawa Timur' },
    ],
  },
  {
    nama: 'Lampung',
    kotaList: [
      { nama: 'Kota Bandar Lampung' },
      { nama: 'Kabupaten Lampung Selatan' },
      { nama: 'Lainnya di Lampung' },
    ],
  },
  {
    nama: 'Sumatera Selatan',
    kotaList: [
      { nama: 'Kota Palembang' },
      { nama: 'Lainnya di Sumatera Selatan' },
    ],
  },
  {
    nama: 'Provinsi Lainnya',
    kotaList: [
      { nama: 'Luar Pulau Jawa / Lainnya' },
    ],
  },
];

// ------------------------------------------------------------------------------
// ATURAN BISNIS: BANTUAN BIAYA PENDIDIKAN DARI PEMERINTAH KOTA TANGERANG SELATAN
// ------------------------------------------------------------------------------
// Bukan potongan dari sekolah, melainkan bantuan biaya pendidikan dari
// Pemerintah Kota Tangerang Selatan bagi pendaftar berdomisili di Tangsel.
// Nilai bantuan dipotong langsung dari tagihan biaya pendaftaran.
// ------------------------------------------------------------------------------
export const BANTUAN_TANGSEL_CONFIG = {
  // Nominal bantuan per tahun ajaran dari Pemkot Tangsel
  NOMINAL: 1_800_000,
  TARGET_KOTA: 'Kota Tangerang Selatan',
  LABEL: 'Bantuan Biaya Pendidikan Pemerintah Kota Tangerang Selatan',
  PERIODE_LABEL: 'per tahun ajaran',
};

// Info keringanan pasca-daftar (tidak dihitung dalam tagihan pendaftaran;
// diberlakukan setelah calon siswa resmi menjadi siswa).
export const POTONGAN_SPP_YATIM = {
  NOMINAL_PER_BULAN: 50_000,
  LABEL: 'Potongan SPP Anak Yatim',
};

export const BEASISWA_RANKING = [
  { peringkat: 1, bulanSpp: 3 },
  { peringkat: 2, bulanSpp: 2 },
  { peringkat: 3, bulanSpp: 1 },
] as const;

/**
 * Cek apakah kota/kabupaten memenuhi syarat bantuan biaya pendidikan Tangsel.
 * Toleran terhadap penulisan 'Kota Tangerang Selatan', 'Tangerang Selatan', atau 'Tangsel'.
 */
export function isEligibleBantuanTangsel(kotaKabupaten?: string): boolean {
  if (!kotaKabupaten) return false;
  const clean = kotaKabupaten.toLowerCase().replace(/[^a-z]/g, '');
  return clean.includes('tangerangselatan') || clean === 'tangsel';
}

export interface RincianBiayaPendaftaran {
  /** Biaya normal di luar potongan gelombang (misal Rp 2.000.000) */
  biayaNormal: number;
  /** Potongan harga sesuai gelombang pendaftaran (dari master gelombang) */
  potonganGelombang: number;
  /** Biaya setelah dipotong potongan gelombang */
  biayaSetelahPotongan: number;
  /** Nominal bantuan Pemkot Tangsel yang dipotong dari tagihan (0 bila tidak eligible) */
  bantuanTangsel: number;
  /** Tagihan akhir yang harus dibayar pendaftar */
  biayaAkhir: number;
  isBantuanTangsel: boolean;
  keteranganBantuan?: string;
}

/**
 * Menghitung rincian biaya pendaftaran:
 * biaya normal - potongan gelombang - bantuan Pemkot Tangsel (jika domisili memenuhi syarat).
 * Tagihan tidak menjadi negatif (dibatasi minimal Rp 0).
 */
export function hitungBiayaPendaftaran(
  biayaNormal: number,
  potonganGelombang: number,
  kotaKabupaten?: string
): RincianBiayaPendaftaran {
  const normal = Math.max(0, Number(biayaNormal) || 0);
  const potongan = Math.min(normal, Math.max(0, Number(potonganGelombang) || 0));
  const biayaSetelahPotongan = Math.max(0, normal - potongan);

  const eligible = isEligibleBantuanTangsel(kotaKabupaten);
  const bantuan = eligible
    ? Math.min(BANTUAN_TANGSEL_CONFIG.NOMINAL, biayaSetelahPotongan)
    : 0;
  const biayaAkhir = Math.max(0, biayaSetelahPotongan - bantuan);

  return {
    biayaNormal: normal,
    potonganGelombang: potongan,
    biayaSetelahPotongan,
    bantuanTangsel: bantuan,
    biayaAkhir,
    isBantuanTangsel: eligible,
    keteranganBantuan: eligible
      ? `${BANTUAN_TANGSEL_CONFIG.LABEL} (Rp ${BANTUAN_TANGSEL_CONFIG.NOMINAL.toLocaleString('id-ID')} ${BANTUAN_TANGSEL_CONFIG.PERIODE_LABEL})`
      : undefined,
  };
}

// ------------------------------------------------------------------------------
// FUNGSI BANTU PENCARIAN DATA WILAYAH
// ------------------------------------------------------------------------------
export function getProvinsiList(): string[] {
  return MASTER_WILAYAH.map((p) => p.nama);
}

export function getKotaList(provinsiNama: string): string[] {
  const prov = MASTER_WILAYAH.find((p) => p.nama.toLowerCase() === provinsiNama.toLowerCase());
  return prov ? prov.kotaList.map((k) => k.nama) : [];
}

export function getKecamatanList(kotaNama: string): string[] {
  if (isEligibleBantuanTangsel(kotaNama)) {
    return KECAMATAN_TANGSEL.map((k) => k.kecamatan);
  }
  return [];
}

export function getKelurahanList(kecamatanNama: string): KelurahanKodePos[] {
  const kec = KECAMATAN_TANGSEL.find(
    (k) => k.kecamatan.toLowerCase() === kecamatanNama.toLowerCase()
  );
  return kec ? kec.kelurahanList : [];
}
