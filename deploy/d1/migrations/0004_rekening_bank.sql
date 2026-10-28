-- ==============================================================================
-- MIGRASI 0004: Master Data Rekening Bank (untuk pembayaran transfer manual)
-- Jalankan: npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/migrations/0004_rekening_bank.sql --remote
-- ==============================================================================

CREATE TABLE IF NOT EXISTS rekening_bank (
    id TEXT PRIMARY KEY,
    nama_bank TEXT NOT NULL,
    nomor_rekening TEXT NOT NULL,
    atas_nama TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Rekening bawaan (ubah/nonaktifkan via master data admin)
INSERT OR IGNORE INTO rekening_bank (id, nama_bank, nomor_rekening, atas_nama, is_active)
VALUES ('rek-bsi-ppdb', 'Bank Syariah Indonesia (BSI)', '7211 8922 13', 'PANITIA PPDB SMP YAPIA CIPUTAT', 1);

-- Pembayaran manual mencatat rekening tujuan yang dipilih pendaftar
ALTER TABLE pembayaran_pendaftaran ADD COLUMN rekening_id TEXT;
