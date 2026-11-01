-- ==============================================================================
-- MIGRASI 0007: Indeks performa D1 (audit lonjakan rows read)
-- Jalankan: npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/migrations/0007_index_performa_d1.sql --remote
-- ==============================================================================

-- Mengubah COUNT(*) per gelombang (endpoint publik /api/v1/gelombang) dari
-- full table scan menjadi index lookup.
CREATE INDEX IF NOT EXISTS idx_calon_siswa_gelombang_id ON calon_siswa(gelombang_id);

-- Mempercepat join/pencarian pembayaran terakhir per pendaftar (dashboard admin
-- dan pencarian transaksi) tanpa memindai seluruh tabel pembayaran.
CREATE INDEX IF NOT EXISTS idx_pembayaran_calon_siswa
  ON pembayaran_pendaftaran(calon_siswa_id, created_at DESC);
