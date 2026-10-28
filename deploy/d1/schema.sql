-- ==============================================================================
-- DDL SKEMA SQLITE UNTUK CLOUDFLARE D1
-- Sistem Informasi Penerimaan Murid Baru (SIPMB) - SMP YAPIA Ciputat
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. TABEL PENGGUNA PANITIA (USERS - UUID PK)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Format UUID v4 (contoh: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)
    nama_lengkap TEXT NOT NULL,
    no_hp TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('ADMIN', 'OPERATOR', 'BENDAHARA', 'KEPSEK')),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 2. TABEL GELOMBANG PENDAFTARAN
CREATE TABLE IF NOT EXISTS gelombang_pendaftaran (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_gelombang TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    tanggal_buka TEXT NOT NULL,
    tanggal_tutup TEXT NOT NULL,
    kuota_maksimal INTEGER NOT NULL DEFAULT 100,
    biaya_pendaftaran INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 3. TABEL DATA UTAMA CALON SISWA
CREATE TABLE IF NOT EXISTS calon_siswa (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- Opsional: ID staf/panitia jika diinput secara offline oleh TU
    gelombang_id INTEGER NOT NULL REFERENCES gelombang_pendaftaran(id),
    nomor_pendaftaran TEXT UNIQUE NOT NULL,
    nama_lengkap TEXT NOT NULL,
    email TEXT, -- Email aktif untuk notifikasi & autentikasi orang tua
    jenis_kelamin TEXT NOT NULL CHECK(jenis_kelamin IN ('L', 'P')),
    tempat_lahir TEXT NOT NULL,
    tanggal_lahir TEXT NOT NULL,
    agama TEXT NOT NULL,
    no_hp_siswa TEXT,
    status_pendaftaran TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status_pendaftaran IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'LOLOS_SELEKSI', 'MENGIKUTI_MPLS', 'DITERIMA_RESMI', 'REVISI', 'REJECTED', 'CADANGAN', 'ACCEPTED')),
    
    -- Tata Kelola Afirmasi & KIP / SKTM
    jalur_pendaftaran TEXT NOT NULL DEFAULT 'REGULER' CHECK(jalur_pendaftaran IN ('REGULER', 'AFIRMASI', 'PRESTASI')),
    nomor_kip_sktm TEXT,

    -- Kepatuhan UU PDP No. 27/2022
    pdp_consent INTEGER NOT NULL DEFAULT 1,
    pdp_consent_at TEXT,

    -- Verifikasi Berkas Fisik TU (Golden Record)
    verifikasi_fisik INTEGER NOT NULL DEFAULT 0,
    verifikasi_fisik_by TEXT,
    verifikasi_fisik_at TEXT,
    verifikasi_fisik_notes TEXT,

    -- Asesmen & Observasi Khusus Rombel (Waka Kesiswaan & Guru PAI)
    kemampuan_quran TEXT,
    catatan_pendampingan TEXT,
    catatan_wawancara TEXT,

    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 3b. TABEL LOG AUDIT AKTIVITAS OPERASIONAL
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    calon_siswa_id TEXT REFERENCES calon_siswa(id) ON DELETE CASCADE,
    actor_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 4. TABEL RIWAYAT SEKOLAH ASAL
CREATE TABLE IF NOT EXISTS sekolah_asal (
    id TEXT PRIMARY KEY,
    calon_siswa_id TEXT NOT NULL UNIQUE REFERENCES calon_siswa(id) ON DELETE CASCADE,
    nama_sekolah TEXT NOT NULL,
    npsn TEXT,
    alamat_sekolah TEXT,
    nisn TEXT NOT NULL,
    no_peserta_ujian TEXT,
    no_ijazah TEXT,
    no_skhun TEXT,
    tinggi_badan INTEGER,
    berat_badan INTEGER,
    golongan_darah TEXT,
    penyakit_berat TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 5. TABEL ALAMAT TEMPAT TINGGAL SISWA
CREATE TABLE IF NOT EXISTS alamat_siswa (
    id TEXT PRIMARY KEY,
    calon_siswa_id TEXT NOT NULL UNIQUE REFERENCES calon_siswa(id) ON DELETE CASCADE,
    jalan TEXT NOT NULL,
    rt TEXT,
    rw TEXT,
    no_rumah TEXT,
    kelurahan TEXT NOT NULL,
    kecamatan TEXT NOT NULL,
    kota_kabupaten TEXT NOT NULL,
    provinsi TEXT NOT NULL,
    kode_pos TEXT,
    tinggal_bersama TEXT NOT NULL,
    jarak_ke_sekolah_km REAL,
    transportasi TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 6. TABEL ORANG TUA / WALI
CREATE TABLE IF NOT EXISTS orang_tua_wali (
    id TEXT PRIMARY KEY,
    calon_siswa_id TEXT NOT NULL REFERENCES calon_siswa(id) ON DELETE CASCADE,
    hubungan TEXT NOT NULL CHECK(hubungan IN ('AYAH', 'IBU', 'WALI')),
    nama_lengkap TEXT NOT NULL,
    status_hidup TEXT NOT NULL DEFAULT 'HIDUP' CHECK(status_hidup IN ('HIDUP', 'MENINGGAL')),
    nik TEXT,
    tempat_lahir TEXT,
    tanggal_lahir TEXT,
    pendidikan_terakhir TEXT,
    pekerjaan TEXT,
    penghasilan_bulanan TEXT,
    no_hp TEXT,
    alamat TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 7. TABEL BERKAS PERSYARATAN & DOKUMEN DIGITAL
CREATE TABLE IF NOT EXISTS berkas_pendaftaran (
    id TEXT PRIMARY KEY,
    calon_siswa_id TEXT NOT NULL REFERENCES calon_siswa(id) ON DELETE CASCADE,
    jenis_berkas TEXT NOT NULL CHECK(jenis_berkas IN ('IJAZAH_SKL', 'KARTU_KELUARGA', 'AKTA_KELAHIRAN', 'KTP_ORANG_TUA', 'FOTO', 'KIP_PIP', 'LAINNYA')),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    status_verifikasi TEXT NOT NULL DEFAULT 'PENDING' CHECK(status_verifikasi IN ('PENDING', 'VALID', 'INVALID')),
    catatan_verifikasi TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 8. TABEL TRANSAKSI PEMBAYARAN PENDAFTARAN
-- metode_pembayaran: 'TRIPAY' (payment gateway) atau 'MANUAL' (transfer bank + konfirmasi Bendahara)
CREATE TABLE IF NOT EXISTS pembayaran_pendaftaran (
    id TEXT PRIMARY KEY,
    calon_siswa_id TEXT NOT NULL REFERENCES calon_siswa(id) ON DELETE CASCADE,
    kode_transaksi TEXT UNIQUE NOT NULL,
    jumlah_bayar INTEGER NOT NULL,
    metode_pembayaran TEXT NOT NULL,
    status_pembayaran TEXT NOT NULL DEFAULT 'UNPAID' CHECK(status_pembayaran IN ('UNPAID', 'PENDING', 'PAID', 'EXPIRED', 'FAILED')),
    bukti_bayar_url TEXT,
    tanggal_bayar TEXT,
    diverifikasi_oleh TEXT REFERENCES users(id),
    pay_reference TEXT,
    checkout_url TEXT,
    pay_code TEXT,
    expired_at TEXT,
    catatan TEXT,
    rekening_id TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 8b. MASTER DATA REKENING BANK (tujuan transfer manual, bisa banyak)
CREATE TABLE IF NOT EXISTS rekening_bank (
    id TEXT PRIMARY KEY,
    nama_bank TEXT NOT NULL,
    nomor_rekening TEXT NOT NULL,
    atas_nama TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 9. TABEL RIWAYAT VERIFIKASI (VERIFICATION AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS verifikasi_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calon_siswa_id TEXT NOT NULL REFERENCES calon_siswa(id) ON DELETE CASCADE,
    admin_id TEXT NOT NULL REFERENCES users(id),
    status_sebelumnya TEXT,
    status_baru TEXT NOT NULL,
    catatan TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 10. TABEL AUDIT LOGS SISTEM
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT REFERENCES users(id),
    aksi TEXT NOT NULL,
    entitas TEXT NOT NULL,
    entitas_id TEXT,
    data_sebelumnya TEXT,
    data_baru TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 11. TABEL MANAJEMEN KONTEN BERANDA & PENGATURAN SITUS
CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_by TEXT
);

-- 12. TABEL HELPDESK & LAYANAN PENGADUAN PPDB
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    nama_pengirim TEXT NOT NULL,
    no_whatsapp TEXT NOT NULL,
    email TEXT,
    kategori TEXT NOT NULL CHECK(kategori IN ('INFO_PENDAFTARAN', 'SYARAT_BERKAS', 'BIAYA_INFAK', 'JALUR_AFIRMASI_KIP', 'KENDALA_TEKNIS', 'LAINNYA')),
    subjek TEXT NOT NULL,
    pesan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'MENUNGGU_RESPON' CHECK(status IN ('MENUNGGU_RESPON', 'SEDANG_DIPROSES', 'SELESAI')),
    tanggapan_panitia TEXT,
    ditanggapi_oleh TEXT,
    ditanggapi_at TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ==============================================================================
-- INDEKS PERFORMA UNTUK PENCARIAN CEPAT
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_calon_siswa_user_id ON calon_siswa(user_id);
CREATE INDEX IF NOT EXISTS idx_calon_siswa_nomor_pendaftaran ON calon_siswa(nomor_pendaftaran);
CREATE INDEX IF NOT EXISTS idx_calon_siswa_status ON calon_siswa(status_pendaftaran);
CREATE INDEX IF NOT EXISTS idx_sekolah_asal_nisn ON sekolah_asal(nisn);
CREATE INDEX IF NOT EXISTS idx_orang_tua_calon_siswa ON orang_tua_wali(calon_siswa_id);
CREATE INDEX IF NOT EXISTS idx_berkas_calon_siswa ON berkas_pendaftaran(calon_siswa_id);
CREATE INDEX IF NOT EXISTS idx_pembayaran_status ON pembayaran_pendaftaran(status_pembayaran);
CREATE INDEX IF NOT EXISTS idx_helpdesk_status ON helpdesk_tickets(status);
CREATE INDEX IF NOT EXISTS idx_helpdesk_no_whatsapp ON helpdesk_tickets(no_whatsapp);
CREATE INDEX IF NOT EXISTS idx_helpdesk_ticket_number ON helpdesk_tickets(ticket_number);
