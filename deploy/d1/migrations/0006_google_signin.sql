-- ==============================================================================
-- MIGRASI 0006: Kolom users.google_sub untuk Sign in with Google
-- Jalankan: npx wrangler d1 execute yapia_sipmb_db --file=deploy/d1/migrations/0006_google_signin.sql --remote
-- ==============================================================================

-- ID unik akun Google (claim "sub" dari ID Token). NULL = akun panitia belum
-- ter-link ke akun Google. Link dilakukan otomatis saat login Google pertama.
-- Catatan: SQLite/D1 tidak mengizinkan UNIQUE inline pada ALTER TABLE ADD COLUMN,
-- maka keunikan dijamin lewat unique index terpisah (sama seperti di schema.sql).
ALTER TABLE users ADD COLUMN google_sub TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);
