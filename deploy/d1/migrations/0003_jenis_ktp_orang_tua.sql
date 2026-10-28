-- ==============================================================================
-- MIGRASI 0003: Tambah jenis berkas KTP_ORANG_TUA pada berkas_pendaftaran
-- SQLite tidak bisa mengubah CHECK constraint via ALTER TABLE, sehingga tabel
-- dibangun ulang. Aman untuk data eksisting (seluruh baris disalin utuh).
-- Jalankan: npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/migrations/0003_jenis_ktp_orang_tua.sql --remote
-- ==============================================================================

PRAGMA foreign_keys = OFF;

CREATE TABLE berkas_pendaftaran_new (
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

INSERT INTO berkas_pendaftaran_new
SELECT id, calon_siswa_id, jenis_berkas, file_url, file_name, file_size_bytes, mime_type, status_verifikasi, catatan_verifikasi, created_at
FROM berkas_pendaftaran;

DROP TABLE berkas_pendaftaran;
ALTER TABLE berkas_pendaftaran_new RENAME TO berkas_pendaftaran;

PRAGMA foreign_keys = ON;
