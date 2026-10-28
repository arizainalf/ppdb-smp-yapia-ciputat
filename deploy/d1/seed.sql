-- ==============================================================================
-- SEED DATA SQLITE / CLOUDFLARE D1 (UUID FORMAT)
-- Sistem Informasi Penerimaan Murid Baru (SIPMB) - SMP YAPIA Ciputat
-- ==============================================================================

-- 1. DATA MASTER PENGGUNA PANITIA (USERS - UUID PK)
-- Password default demo: 'password123' (disimpan sebagai PBKDF2-SHA256, 100k iterasi)
INSERT OR REPLACE INTO users (id, nama_lengkap, no_hp, email, password_hash, role, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Administrator SPMB', '081200000001', 'admin@yapia.sch.id', 'pbkdf2$100000$abababababababababababababababab$02382a6b8320c858a6a4e92f62deb23710eeb151395c22de97fe2f1381ca4037', 'ADMIN', 1),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Ruslan Setiawan (Operator Dapodik)', '081200000002', 'ruslan@yapia.sch.id', 'pbkdf2$100000$abababababababababababababababab$02382a6b8320c858a6a4e92f62deb23710eeb151395c22de97fe2f1381ca4037', 'OPERATOR', 1),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Aila Syifa (Staf Tata Usaha)', '081200000003', 'aila@yapia.sch.id', 'pbkdf2$100000$abababababababababababababababab$02382a6b8320c858a6a4e92f62deb23710eeb151395c22de97fe2f1381ca4037', 'OPERATOR', 1),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Via Aprilian Safitri Nur, S.Kom (Kepala Sekolah)', '081200000004', 'kepsek@yapia.sch.id', 'pbkdf2$100000$abababababababababababababababab$02382a6b8320c858a6a4e92f62deb23710eeb151395c22de97fe2f1381ca4037', 'KEPSEK', 1),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Bendahara PPDB SMP YAPIA', '081200000005', 'bendahara@yapia.sch.id', 'pbkdf2$100000$abababababababababababababababab$02382a6b8320c858a6a4e92f62deb23710eeb151395c22de97fe2f1381ca4037', 'BENDAHARA', 1);

-- 2. GELOMBANG PENDAFTARAN AKTIF
INSERT OR REPLACE INTO gelombang_pendaftaran (id, nama_gelombang, tahun_ajaran, tanggal_buka, tanggal_tutup, kuota_maksimal, biaya_pendaftaran, is_active) VALUES
(1, 'Gelombang 1 (Jalur Reguler & Afirmasi)', '2026/2027', '2026-10-01', '2026-12-31', 120, 250000, 1),
(2, 'Gelombang 2 (Reguler Lanjutan)', '2026/2027', '2027-01-02', '2027-03-31', 60, 250000, 0);

-- CATATAN: Data calon siswa TIDAK di-seed. Seluruh data pendaftar harus berasal
-- dari formulir pendaftaran asli agar hasil pencarian status selalu data nyata.
-- Rekening bank bawaan untuk transfer manual di-seed otomatis oleh backend
-- (tabel rekening_bank) bila masih kosong.
