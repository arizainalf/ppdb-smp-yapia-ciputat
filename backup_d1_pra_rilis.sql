PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
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
INSERT INTO "users" ("id","nama_lengkap","no_hp","email","password_hash","role","is_active","created_at","updated_at") VALUES('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11','Administrator SPMB','081200000001','admin@yapia.sch.id','password123','ADMIN',1,'2026-10-24T04:13:40.470Z','2026-10-24T04:13:40.470Z');
INSERT INTO "users" ("id","nama_lengkap","no_hp","email","password_hash","role","is_active","created_at","updated_at") VALUES('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22','Ruslan Setiawan (Operator Dapodik)','081200000002','ruslan@yapia.sch.id','password123','OPERATOR',1,'2026-10-24T04:13:40.470Z','2026-10-24T04:13:40.470Z');
INSERT INTO "users" ("id","nama_lengkap","no_hp","email","password_hash","role","is_active","created_at","updated_at") VALUES('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33','Aila Syifa (Staf Tata Usaha)','081200000003','aila@yapia.sch.id','password123','OPERATOR',1,'2026-10-24T04:13:40.470Z','2026-10-24T04:13:40.470Z');
INSERT INTO "users" ("id","nama_lengkap","no_hp","email","password_hash","role","is_active","created_at","updated_at") VALUES('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44','Via Aprilian Safitri Nur, S.Kom (Kepala Sekolah)','081200000004','kepsek@yapia.sch.id','password123','KEPSEK',1,'2026-10-24T04:13:40.470Z','2026-10-24T04:13:40.470Z');
INSERT INTO "users" ("id","nama_lengkap","no_hp","email","password_hash","role","is_active","created_at","updated_at") VALUES('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55','Bendahara PPDB SMP YAPIA','081200000005','bendahara@yapia.sch.id','password123','BENDAHARA',1,'2026-10-24T04:13:40.470Z','2026-10-24T04:13:40.470Z');
CREATE TABLE gelombang_pendaftaran (
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
INSERT INTO "gelombang_pendaftaran" ("id","nama_gelombang","tahun_ajaran","tanggal_buka","tanggal_tutup","kuota_maksimal","biaya_pendaftaran","is_active","created_at") VALUES(1,'Gelombang 1 (Jalur Reguler & Afirmasi)','2026/2027','2026-10-01','2026-12-31',120,2235000,1,'2026-10-24T04:13:40.470Z');
INSERT INTO "gelombang_pendaftaran" ("id","nama_gelombang","tahun_ajaran","tanggal_buka","tanggal_tutup","kuota_maksimal","biaya_pendaftaran","is_active","created_at") VALUES(2,'Gelombang 2 (Reguler Lanjutan)','2026/2027','2027-01-02','2027-03-31',60,350000,0,'2026-10-24T04:13:40.470Z');
CREATE TABLE calon_siswa (
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
INSERT INTO "calon_siswa" ("id","user_id","gelombang_id","nomor_pendaftaran","nama_lengkap","email","jenis_kelamin","tempat_lahir","tanggal_lahir","agama","no_hp_siswa","status_pendaftaran","jalur_pendaftaran","nomor_kip_sktm","pdp_consent","pdp_consent_at","verifikasi_fisik","verifikasi_fisik_by","verifikasi_fisik_at","verifikasi_fisik_notes","kemampuan_quran","catatan_pendampingan","catatan_wawancara","created_at","updated_at") VALUES('10000000-0000-4000-8000-000000000001',NULL,1,'REG-2026-G1-0001','ALKA ALHABSY','pendaftar@yapia.sch.id','L','Tangerang Selatan','2013-05-12','Islam','081299887766','LOLOS_SELEKSI','AFIRMASI','2026-992138',1,'2026-10-15T08:00:00Z',1,'Aila Syifa (Staf TU)','2026-10-16T09:00:00Z','Dokumen fisik KIP dan KK asli valid.','LANCAR_ALQURAN','Mandiri / Rombel 7A',NULL,'2026-10-24T04:13:40.470Z','2026-10-24T04:13:40.470Z');
INSERT INTO "calon_siswa" ("id","user_id","gelombang_id","nomor_pendaftaran","nama_lengkap","email","jenis_kelamin","tempat_lahir","tanggal_lahir","agama","no_hp_siswa","status_pendaftaran","jalur_pendaftaran","nomor_kip_sktm","pdp_consent","pdp_consent_at","verifikasi_fisik","verifikasi_fisik_by","verifikasi_fisik_at","verifikasi_fisik_notes","kemampuan_quran","catatan_pendampingan","catatan_wawancara","created_at","updated_at") VALUES('20000000-0000-4000-8000-000000000002',NULL,1,'REG-2026-G1-0002','SITI AISYAH AZZAHRA','aisyah@gmail.com','P','Tangerang Selatan','2013-08-20','Islam','081311223344','VERIFIED','REGULER',NULL,1,'2026-10-15T09:30:00Z',1,'Aila Syifa (Staf TU)','2026-10-16T10:15:00Z','Dokumen fisik lengkap.','BELUM_LANCAR','Perlu Pendampingan BTQ',NULL,'2026-10-24T04:13:40.470Z','2026-10-24T04:13:40.470Z');
INSERT INTO "calon_siswa" ("id","user_id","gelombang_id","nomor_pendaftaran","nama_lengkap","email","jenis_kelamin","tempat_lahir","tanggal_lahir","agama","no_hp_siswa","status_pendaftaran","jalur_pendaftaran","nomor_kip_sktm","pdp_consent","pdp_consent_at","verifikasi_fisik","verifikasi_fisik_by","verifikasi_fisik_at","verifikasi_fisik_notes","kemampuan_quran","catatan_pendampingan","catatan_wawancara","created_at","updated_at") VALUES('30000000-0000-4000-8000-000000000003',NULL,1,'REG-2026-G1-0003','MUHAMMAD FATHAN ATHALLAH','fathan@gmail.com','L','Jakarta','2013-02-14','Islam','085799887766','REVISI','AFIRMASI','470/12/SKTM/2026',1,'2026-10-15T11:00:00Z',0,NULL,NULL,'Fotokopi KK terpotong tanda tangan kepala dinas dukcapil.',NULL,NULL,NULL,'2026-10-24T04:13:40.470Z','2026-10-24T04:13:40.470Z');
INSERT INTO "calon_siswa" ("id","user_id","gelombang_id","nomor_pendaftaran","nama_lengkap","email","jenis_kelamin","tempat_lahir","tanggal_lahir","agama","no_hp_siswa","status_pendaftaran","jalur_pendaftaran","nomor_kip_sktm","pdp_consent","pdp_consent_at","verifikasi_fisik","verifikasi_fisik_by","verifikasi_fisik_at","verifikasi_fisik_notes","kemampuan_quran","catatan_pendampingan","catatan_wawancara","created_at","updated_at") VALUES('915ffa42-462a-4d25-8a0f-063021dc9005',NULL,1,'REG-2026-G1-0004','Eko Endriyono',NULL,'L','Semarang','1990-05-11','Islam','','DRAFT','REGULER','',1,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-27T10:04:44.598Z','2026-10-27T10:04:44.598Z');
INSERT INTO "calon_siswa" ("id","user_id","gelombang_id","nomor_pendaftaran","nama_lengkap","email","jenis_kelamin","tempat_lahir","tanggal_lahir","agama","no_hp_siswa","status_pendaftaran","jalur_pendaftaran","nomor_kip_sktm","pdp_consent","pdp_consent_at","verifikasi_fisik","verifikasi_fisik_by","verifikasi_fisik_at","verifikasi_fisik_notes","kemampuan_quran","catatan_pendampingan","catatan_wawancara","created_at","updated_at") VALUES('41bd6d64-2823-4a9a-ade7-c0891fa10e99',NULL,1,'REG-2026-G1-0005','Eko Endriyono','emailayah@gmail.com','L','Semarang','1990-05-11','Islam','083028103810','DRAFT','REGULER','',1,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-27T10:07:21.551Z','2026-10-27T10:07:21.551Z');
INSERT INTO "calon_siswa" ("id","user_id","gelombang_id","nomor_pendaftaran","nama_lengkap","email","jenis_kelamin","tempat_lahir","tanggal_lahir","agama","no_hp_siswa","status_pendaftaran","jalur_pendaftaran","nomor_kip_sktm","pdp_consent","pdp_consent_at","verifikasi_fisik","verifikasi_fisik_by","verifikasi_fisik_at","verifikasi_fisik_notes","kemampuan_quran","catatan_pendampingan","catatan_wawancara","created_at","updated_at") VALUES('51536fd4-cdac-48ed-986d-aa915b0525a7',NULL,1,'REG-2026-G1-0006','Adib GT',NULL,'L','Tangerang','2010-10-05','Islam','','DRAFT','REGULER','',1,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28T07:05:42.248Z','2026-10-28T07:05:42.248Z');
INSERT INTO "calon_siswa" ("id","user_id","gelombang_id","nomor_pendaftaran","nama_lengkap","email","jenis_kelamin","tempat_lahir","tanggal_lahir","agama","no_hp_siswa","status_pendaftaran","jalur_pendaftaran","nomor_kip_sktm","pdp_consent","pdp_consent_at","verifikasi_fisik","verifikasi_fisik_by","verifikasi_fisik_at","verifikasi_fisik_notes","kemampuan_quran","catatan_pendampingan","catatan_wawancara","created_at","updated_at") VALUES('2bcf8d05-1cfe-4502-88df-9c09c627cbf0',NULL,1,'REG-2026-G1-0007','Ruslan',NULL,'L','Jkaarta','2012-10-28','Islam','','DRAFT','REGULER','',1,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28T07:28:38.748Z','2026-10-28T07:28:38.748Z');
INSERT INTO "calon_siswa" ("id","user_id","gelombang_id","nomor_pendaftaran","nama_lengkap","email","jenis_kelamin","tempat_lahir","tanggal_lahir","agama","no_hp_siswa","status_pendaftaran","jalur_pendaftaran","nomor_kip_sktm","pdp_consent","pdp_consent_at","verifikasi_fisik","verifikasi_fisik_by","verifikasi_fisik_at","verifikasi_fisik_notes","kemampuan_quran","catatan_pendampingan","catatan_wawancara","created_at","updated_at") VALUES('62c6d49f-8fd4-46eb-b0e6-2ab5756c6a2a',NULL,1,'REG-2026-G1-0008','Ruslan',NULL,'L','Jkaarta','2012-10-28','Islam','','DRAFT','REGULER','',1,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28T07:29:30.100Z','2026-10-28T07:29:30.100Z');
INSERT INTO "calon_siswa" ("id","user_id","gelombang_id","nomor_pendaftaran","nama_lengkap","email","jenis_kelamin","tempat_lahir","tanggal_lahir","agama","no_hp_siswa","status_pendaftaran","jalur_pendaftaran","nomor_kip_sktm","pdp_consent","pdp_consent_at","verifikasi_fisik","verifikasi_fisik_by","verifikasi_fisik_at","verifikasi_fisik_notes","kemampuan_quran","catatan_pendampingan","catatan_wawancara","created_at","updated_at") VALUES('99f8d956-79bb-4741-be28-3bbadab1933a',NULL,1,'REG-2026-G1-0009','Ruslan','rusl@gmail.com','L','Jkaarta','2012-10-28','Islam','089685858082','DRAFT','REGULER','',1,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28T07:31:51.812Z','2026-10-28T07:31:51.812Z');
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    calon_siswa_id TEXT REFERENCES calon_siswa(id) ON DELETE CASCADE,
    actor_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE sekolah_asal (
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
INSERT INTO "sekolah_asal" ("id","calon_siswa_id","nama_sekolah","npsn","alamat_sekolah","nisn","no_peserta_ujian","no_ijazah","no_skhun","tinggi_badan","berat_badan","golongan_darah","penyakit_berat","created_at") VALUES('c1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','SD Negeri Pondok Cabe Ilir 02','20603123',NULL,'0123456789',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-24T04:13:40.470Z');
INSERT INTO "sekolah_asal" ("id","calon_siswa_id","nama_sekolah","npsn","alamat_sekolah","nisn","no_peserta_ujian","no_ijazah","no_skhun","tinggi_badan","berat_badan","golongan_darah","penyakit_berat","created_at") VALUES('c2000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','SD Islam Terpadu Insan Mandiri','69901234',NULL,'0123456790',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-24T04:13:40.470Z');
INSERT INTO "sekolah_asal" ("id","calon_siswa_id","nama_sekolah","npsn","alamat_sekolah","nisn","no_peserta_ujian","no_ijazah","no_skhun","tinggi_badan","berat_badan","golongan_darah","penyakit_berat","created_at") VALUES('c3000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000003','SD Negeri Cipayung 01','20603456',NULL,'0123456791',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-24T04:13:40.470Z');
INSERT INTO "sekolah_asal" ("id","calon_siswa_id","nama_sekolah","npsn","alamat_sekolah","nisn","no_peserta_ujian","no_ijazah","no_skhun","tinggi_badan","berat_badan","golongan_darah","penyakit_berat","created_at") VALUES('c94bb0a7-c0ce-4fe5-9e08-705f3e759890','41bd6d64-2823-4a9a-ade7-c0891fa10e99','SD Negeri 1 Indonesia','',NULL,'0023312313',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-27T10:07:21.752Z');
INSERT INTO "sekolah_asal" ("id","calon_siswa_id","nama_sekolah","npsn","alamat_sekolah","nisn","no_peserta_ujian","no_ijazah","no_skhun","tinggi_badan","berat_badan","golongan_darah","penyakit_berat","created_at") VALUES('811b869f-0a02-4169-8d3d-acd2accf3116','99f8d956-79bb-4741-be28-3bbadab1933a','Sdn 03 cipayung','',NULL,'0987654321',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-28T07:31:51.897Z');
CREATE TABLE alamat_siswa (
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
CREATE TABLE orang_tua_wali (
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
INSERT INTO "orang_tua_wali" ("id","calon_siswa_id","hubungan","nama_lengkap","status_hidup","nik","tempat_lahir","tanggal_lahir","pendidikan_terakhir","pekerjaan","penghasilan_bulanan","no_hp","alamat","created_at") VALUES('a1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','AYAH','Bpk. Hendra','HIDUP','3274011205800001',NULL,NULL,'SMA/SMK','Karyawan Swasta',NULL,'081299887766',NULL,'2026-10-24T04:13:40.470Z');
INSERT INTO "orang_tua_wali" ("id","calon_siswa_id","hubungan","nama_lengkap","status_hidup","nik","tempat_lahir","tanggal_lahir","pendidikan_terakhir","pekerjaan","penghasilan_bulanan","no_hp","alamat","created_at") VALUES('b1000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','IBU','Ibu Nurhayati','HIDUP','3274011205840002',NULL,NULL,'SMA/SMK','Ibu Rumah Tangga',NULL,'081299887767',NULL,'2026-10-24T04:13:40.470Z');
INSERT INTO "orang_tua_wali" ("id","calon_siswa_id","hubungan","nama_lengkap","status_hidup","nik","tempat_lahir","tanggal_lahir","pendidikan_terakhir","pekerjaan","penghasilan_bulanan","no_hp","alamat","created_at") VALUES('a2000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','AYAH','Bpk. Rahmat Hidayat','HIDUP','3674021008810003',NULL,NULL,'S1','Wiraswasta',NULL,'081311223344',NULL,'2026-10-24T04:13:40.470Z');
INSERT INTO "orang_tua_wali" ("id","calon_siswa_id","hubungan","nama_lengkap","status_hidup","nik","tempat_lahir","tanggal_lahir","pendidikan_terakhir","pekerjaan","penghasilan_bulanan","no_hp","alamat","created_at") VALUES('b3000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000003','IBU','Ibu Dewi Lestari','HIDUP','3274021402830005',NULL,NULL,'SMA/SMK','Pedagang',NULL,'085799887766',NULL,'2026-10-24T04:13:40.470Z');
CREATE TABLE berkas_pendaftaran (
    id TEXT PRIMARY KEY,
    calon_siswa_id TEXT NOT NULL REFERENCES calon_siswa(id) ON DELETE CASCADE,
    jenis_berkas TEXT NOT NULL CHECK(jenis_berkas IN ('IJAZAH_SKL', 'KARTU_KELUARGA', 'AKTA_KELAHIRAN', 'FOTO', 'KIP_PIP', 'LAINNYA')),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    status_verifikasi TEXT NOT NULL DEFAULT 'PENDING' CHECK(status_verifikasi IN ('PENDING', 'VALID', 'INVALID')),
    catatan_verifikasi TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE pembayaran_pendaftaran (
    id TEXT PRIMARY KEY,
    calon_siswa_id TEXT NOT NULL REFERENCES calon_siswa(id) ON DELETE CASCADE,
    kode_transaksi TEXT UNIQUE NOT NULL,
    jumlah_bayar INTEGER NOT NULL,
    metode_pembayaran TEXT NOT NULL,
    status_pembayaran TEXT NOT NULL DEFAULT 'UNPAID' CHECK(status_pembayaran IN ('UNPAID', 'PENDING', 'PAID', 'EXPIRED', 'FAILED')),
    bukti_bayar_url TEXT,
    tanggal_bayar TEXT,
    diverifikasi_oleh TEXT REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE verifikasi_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calon_siswa_id TEXT NOT NULL REFERENCES calon_siswa(id) ON DELETE CASCADE,
    admin_id TEXT NOT NULL REFERENCES users(id),
    status_sebelumnya TEXT,
    status_baru TEXT NOT NULL,
    catatan TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE TABLE site_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_by TEXT
);
INSERT INTO "site_content" ("key","value","updated_at","updated_by") VALUES('landing_page','{"hero":{"badgeText":"PENDAFTARAN RESMI DIBUKA: TAHUN AJARAN 2026/2027","heroTitle":"Mewujudkan Generasi Islami, Cerdas & Berakhlak Mulia","heroHighlight":"Cerdas","heroSubtitle":"Selamat datang di Portal Resmi Sistem Informasi Penerimaan Murid Baru (SIPMB) SMP YAPIA Ciputat. Proses pendaftaran mudah, transparan, dan terverifikasi secara online.","heroDaftarBtn":"Daftar Sekarang","heroCekStatusBtn":"Cek Status Pendaftaran"},"metrics":{"metric1Title":"Akreditasi A","metric1Subtitle":"Kemendikbudristek","metric2Title":"100% Online","metric2Subtitle":"Tanpa Antre di Sekolah","metric3Title":"24 Jam","metric3Subtitle":"Daftar Kapanpun Dimanapun","metric4Title":"WhatsApp Notif","metric4Subtitle":"Update Status Realtime"},"syarat":{"syaratBadge":"Persyaratan PPDB","syaratTitle":"Dokumen Persyaratan yang Perlu Disiapkan","syaratSubtitle":"Pastikan Anda telah menyiapkan foto atau scan berkas dokumen berikut sebelum mengisi formulir:","syarat1Title":"Ijazah SD / Surat Keterangan Lulus (SKL)","syarat1Desc":"Scan asli atau fotokopi legalisir yang memuat nama siswa dan NISN yang jelas.","syarat2Title":"Kartu Keluarga (KK)","syarat2Desc":"Scan Kartu Keluarga yang mencantumkan nama orang tua/wali serta Nomor Induk Kependudukan (NIK).","syarat3Title":"Akta Kelahiran Calon Siswa","syarat3Desc":"Scan Akta Kelahiran resmi dari Dukcapil untuk verifikasi tanggal lahir dan usia anak."},"panduan":{"panduanBadge":"Panduan Pendaftaran","panduanTitle":"4 Langkah Mudah Pendaftaran Online","step1Title":"Isi Biodata Lengkap","step1Desc":"Isi data calon siswa, riwayat SD asal, alamat domisili, dan data orang tua/wali.","step2Title":"Unggah Scan Dokumen","step2Desc":"Upload dokumen Ijazah/SKL, KK, dan Akta Kelahiran langsung dari ponsel/laptop.","step3Title":"Verifikasi Panitia","step3Desc":"Panitia PPDB memverifikasi keabsahan berkas Anda dalam waktu 1x24 jam kerja.","step4Title":"Cetak Bukti Pendaftaran","step4Desc":"Dapatkan lembar bukti pendaftaran ber-QR Code untuk registrasi ulang di sekolah."},"cta":{"ctaBadge":"PPDB ONLINE T.A 2026/2027 • KUOTA GELOMBANG TERBATAS","ctaTitle":"Siap Mendaftarkan Putra/Putri Anda di SMP YAPIA Ciputat?","ctaSubtitle":"Pengisian formulir praktis dalam 5 tahap, berkas diunggah langsung melalui ponsel, dan nomor registrasi resmi diterbitkan secara instan.","ctaPrimaryBtn":"Mulai Pengisian Formulir Sekarang","ctaSecondaryBtn":"Sudah Mendaftar? Cek Status & SK","ctaChip1":"Pengisian 5 Menit Selesai","ctaChip2":"Kepatuhan UU PDP No. 27/2022","ctaChip3":"Helpdesk WhatsApp 24 Jam"},"kontak":{"namaSekolah":"SMP YAPIA CIPUTAT","deskripsiSekolah":"Membentuk generasi berakhlak mulia, berprestasi akademik, dan siap menghadapi tantangan era digital dengan nilai-nilai Islam.","npsn":"20603210","akreditasi":"Akreditasi A","alamatSekolah":"Jl. KH. Dewantara No. 12, Ciputat, Kota Tangerang Selatan, Banten 15411","telepon":"(021) 749-XXXX","whatsapp":"0812-3456-7890","email":"ppdb@smp-yapia.sch.id","jadwalPelayanan":"Senin – Jumat: 08.00 – 15.00 WIB | Sabtu: 08.00 – 12.00 WIB (Helpdesk Offline)"}}','2026-10-28T03:33:21.868Z','Super Admin');
CREATE TABLE helpdesk_tickets (
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
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('gelombang_pendaftaran',2);
CREATE INDEX idx_calon_siswa_user_id ON calon_siswa(user_id);
CREATE INDEX idx_calon_siswa_nomor_pendaftaran ON calon_siswa(nomor_pendaftaran);
CREATE INDEX idx_calon_siswa_status ON calon_siswa(status_pendaftaran);
CREATE INDEX idx_sekolah_asal_nisn ON sekolah_asal(nisn);
CREATE INDEX idx_orang_tua_calon_siswa ON orang_tua_wali(calon_siswa_id);
CREATE INDEX idx_berkas_calon_siswa ON berkas_pendaftaran(calon_siswa_id);
CREATE INDEX idx_pembayaran_status ON pembayaran_pendaftaran(status_pembayaran);
CREATE INDEX idx_helpdesk_status ON helpdesk_tickets(status);
CREATE INDEX idx_helpdesk_no_whatsapp ON helpdesk_tickets(no_whatsapp);
CREATE INDEX idx_helpdesk_ticket_number ON helpdesk_tickets(ticket_number);
