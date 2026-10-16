-- ==============================================================================
-- SEED DATA SQLITE / CLOUDFLARE D1 (UUID FORMAT)
-- Sistem Informasi Penerimaan Murid Baru (SIPMB) - SMP YAPIA Ciputat
-- ==============================================================================

-- 1. DATA MASTER PENGGUNA PANITIA (USERS - UUID PK)
-- Password default demo: 'password123'
INSERT OR REPLACE INTO users (id, nama_lengkap, no_hp, email, password_hash, role, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Administrator SPMB', '081200000001', 'admin@yapia.sch.id', 'password123', 'ADMIN', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Ruslan Setiawan (Operator Dapodik)', '081200000002', 'ruslan@yapia.sch.id', 'password123', 'OPERATOR', 1),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Aila Syifa (Staf Tata Usaha)', '081200000003', 'aila@yapia.sch.id', 'password123', 'OPERATOR', 1),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Via Aprilian Safitri Nur, S.Kom (Kepala Sekolah)', '081200000004', 'kepsek@yapia.sch.id', 'password123', 'KEPSEK', 1),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Bendahara PPDB SMP YAPIA', '081200000005', 'bendahara@yapia.sch.id', 'password123', 'BENDAHARA', 1);

-- 2. GELOMBANG PENDAFTARAN AKTIF
INSERT OR REPLACE INTO gelombang_pendaftaran (id, nama_gelombang, tahun_ajaran, tanggal_buka, tanggal_tutup, kuota_maksimal, biaya_pendaftaran, is_active) VALUES
(1, 'Gelombang 1 (Jalur Reguler & Afirmasi)', '2026/2027', '2026-10-01', '2026-12-31', 120, 250000, 1),
(2, 'Gelombang 2 (Reguler Lanjutan)', '2026/2027', '2027-01-02', '2027-03-31', 60, 250000, 0);

-- 3. DATA PENDAFTAR CALON SISWA (UUID PK)
-- Autentikasi Orang Tua: Dicocokkan dari nomor_pendaftaran, email calon siswa, dan no_hp orang tua di tabel orang_tua_wali
INSERT OR REPLACE INTO calon_siswa (
    id, gelombang_id, nomor_pendaftaran, nama_lengkap, email, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, no_hp_siswa, status_pendaftaran, jalur_pendaftaran, nomor_kip_sktm, pdp_consent, pdp_consent_at, verifikasi_fisik, verifikasi_fisik_by, verifikasi_fisik_at, verifikasi_fisik_notes, kemampuan_quran, catatan_pendampingan
) VALUES
(
    '10000000-0000-4000-8000-000000000001', 1, 'REG-2026-G1-0001', 'ALKA ALHABSY', 'pendaftar@yapia.sch.id', 'L', 'Tangerang Selatan', '2013-05-12', 'Islam', '081299887766',
    'LOLOS_SELEKSI', 'AFIRMASI', '2026-992138', 1, '2026-10-15T08:00:00Z', 1, 'Aila Syifa (Staf TU)', '2026-10-16T09:00:00Z', 'Dokumen fisik KIP dan KK asli valid.', 'LANCAR_ALQURAN', 'Mandiri / Rombel 7A'
),
(
    '20000000-0000-4000-8000-000000000002', 1, 'REG-2026-G1-0002', 'SITI AISYAH AZZAHRA', 'aisyah@gmail.com', 'P', 'Tangerang Selatan', '2013-08-20', 'Islam', '081311223344',
    'VERIFIED', 'REGULER', NULL, 1, '2026-10-15T09:30:00Z', 1, 'Aila Syifa (Staf TU)', '2026-10-16T10:15:00Z', 'Dokumen fisik lengkap.', 'BELUM_LANCAR', 'Perlu Pendampingan BTQ'
),
(
    '30000000-0000-4000-8000-000000000003', 1, 'REG-2026-G1-0003', 'MUHAMMAD FATHAN ATHALLAH', 'fathan@gmail.com', 'L', 'Jakarta', '2013-02-14', 'Islam', '085799887766',
    'REVISI', 'AFIRMASI', '470/12/SKTM/2026', 1, '2026-10-15T11:00:00Z', 0, NULL, NULL, 'Fotokopi KK terpotong tanda tangan kepala dinas dukcapil.', NULL, NULL
);

-- 4. DATA ORANG TUA / WALI PENDAFTAR (UUID PK)
INSERT OR REPLACE INTO orang_tua_wali (
    id, calon_siswa_id, hubungan, nama_lengkap, status_hidup, nik, pendidikan_terakhir, pekerjaan, no_hp
) VALUES
('a1000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'AYAH', 'Bpk. Hendra', 'HIDUP', '3274011205800001', 'SMA/SMK', 'Karyawan Swasta', '081299887766'),
('b1000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'IBU', 'Ibu Nurhayati', 'HIDUP', '3274011205840002', 'SMA/SMK', 'Ibu Rumah Tangga', '081299887767'),
('a2000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'AYAH', 'Bpk. Rahmat Hidayat', 'HIDUP', '3674021008810003', 'S1', 'Wiraswasta', '081311223344'),
('b3000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 'IBU', 'Ibu Dewi Lestari', 'HIDUP', '3274021402830005', 'SMA/SMK', 'Pedagang', '085799887766');

-- 5. DATA SEKOLAH ASAL (UUID PK)
INSERT OR REPLACE INTO sekolah_asal (
    id, calon_siswa_id, nama_sekolah, npsn, nisn
) VALUES
('c1000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'SD Negeri Pondok Cabe Ilir 02', '20603123', '0123456789'),
('c2000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'SD Islam Terpadu Insan Mandiri', '69901234', '0123456790'),
('c3000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 'SD Negeri Cipayung 01', '20603456', '0123456791');
