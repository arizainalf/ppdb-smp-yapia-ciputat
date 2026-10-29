-- ==============================================================================
-- MIGRASI 0005: Potongan Biaya per Gelombang + Bantuan Pemkot Tangsel
-- Jalankan: npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/migrations/0005_potongan_biaya_gelombang.sql --remote
-- ==============================================================================

-- Kolom potongan harga khusus gelombang pada master gelombang.
-- Tagihan pendaftar = biaya_pendaftaran (normal) - potongan_biaya (gelombang)
--                     - Bantuan Biaya Pendidikan Pemkot Tangsel Rp 1.800.000
--                     (otomatis dipotong untuk domisili Kota Tangerang Selatan).
ALTER TABLE gelombang_pendaftaran ADD COLUMN potongan_biaya INTEGER NOT NULL DEFAULT 0;

-- Opsional: selaraskan tarif gelombang lama (nilai dummy Rp 250.000) dengan
-- kebijakan baru. Hapus tanda komentar bila baris gelombang di produksi masih
-- memakai nilai dummy dan belum diubah manual melalui Master Gelombang admin.
--
-- UPDATE gelombang_pendaftaran
-- SET nama_gelombang = 'Gelombang 1 (1 Januari - 30 April)',
--     tanggal_buka = '2027-01-01', tanggal_tutup = '2027-04-30',
--     biaya_pendaftaran = 2000000, potongan_biaya = 800000
-- WHERE id = 1;
--
-- UPDATE gelombang_pendaftaran
-- SET nama_gelombang = 'Gelombang 2 (1 Mei - 31 Juli)',
--     tanggal_buka = '2027-05-01', tanggal_tutup = '2027-07-31',
--     biaya_pendaftaran = 2000000, potongan_biaya = 200000
-- WHERE id = 2;
