-- ==============================================================================
-- MIGRASI 0005: KOLOM DOKUMEN DAPODIK & POTONGAN GELOMBANG
-- SIPMB SMP YAPIA Ciputat
-- ==============================================================================

-- 1. Tambah kolom potongan_biaya pada tabel gelombang_pendaftaran
ALTER TABLE gelombang_pendaftaran ADD COLUMN potongan_biaya INTEGER NOT NULL DEFAULT 0;

-- 2. Tambah kolom NIK, No KK, dan Anak Ke pada tabel calon_siswa
ALTER TABLE calon_siswa ADD COLUMN nik TEXT;
ALTER TABLE calon_siswa ADD COLUMN no_kk TEXT;
ALTER TABLE calon_siswa ADD COLUMN anak_ke INTEGER;

-- 3. Indeks untuk percepatan pencarian NIK & No KK
CREATE INDEX IF NOT EXISTS idx_calon_siswa_nik ON calon_siswa(nik);
CREATE INDEX IF NOT EXISTS idx_calon_siswa_no_kk ON calon_siswa(no_kk);
