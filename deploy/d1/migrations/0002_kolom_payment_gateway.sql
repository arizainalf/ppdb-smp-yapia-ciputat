-- ==============================================================================
-- MIGRASI 0002: Kolom Payment Gateway (Tripay) pada pembayaran_pendaftaran
-- Jalankan: npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/migrations/0002_kolom_payment_gateway.sql --remote
-- ==============================================================================

ALTER TABLE pembayaran_pendaftaran ADD COLUMN pay_reference TEXT;   -- Reference dari Tripay
ALTER TABLE pembayaran_pendaftaran ADD COLUMN checkout_url TEXT;    -- URL halaman bayar Tripay
ALTER TABLE pembayaran_pendaftaran ADD COLUMN pay_code TEXT;        -- Nomor VA / kode QRIS
ALTER TABLE pembayaran_pendaftaran ADD COLUMN expired_at TEXT;      -- Waktu kedaluwarsa invoice
ALTER TABLE pembayaran_pendaftaran ADD COLUMN catatan TEXT;         -- Catatan (nama pengirim manual, dll.)
