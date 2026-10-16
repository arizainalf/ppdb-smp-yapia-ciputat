# Test Plan & User Acceptance Testing (UAT)
## Sistem Informasi Penerimaan Murid Baru (SIPMB)
### SMP YAPIA Ciputat

---

| Informasi Dokumen | Keterangan |
|---|---|
| **Dokumen** | Rencana Pengujian Sistem & Skenario UAT |
| **Versi** | 1.0.0 |
| **Status** | Siap untuk Validasi Mutu Perangkat Lunak |
| **Penulis** | Tim Quality Assurance (QA) & Penguji Sistem |

---

## 1. Strategi Pengujian (Testing Strategy)

Untuk menjamin keandalan sistem selama periode sibuk pendaftaran PPDB, pengujian dilakukan pada beberapa tingkatan:

1. **Unit Testing**: Menguji validasi logika murni (misal: format NISN 10 digit, kalkulasi umur calon siswa, rumus biaya pendaftaran).
2. **Integration Testing**: Menguji interaksi antara API Controller, Basis Data PostgreSQL, dan Object Storage MinIO.
3. **End-to-End (E2E) Testing**: Mensimulasikan alur penuh pendaftaran pengguna dari pembuatan akun hingga unduh kartu bukti pendaftaran menggunakan Playwright.
4. **Security Testing (Penetration Test Ringan)**: Menguji pencegahan *SQL Injection*, manipulasi ekstensi file (*file upload bypass*), dan kebocoran data pribadi (IDOR pada endpoint berkas).
5. **User Acceptance Testing (UAT)**: Pengujian langsung bersama perwakilan Panitia PPDB SMP YAPIA Ciputat dan calon orang tua siswa.

---

## 2. Matriks Kasus Uji Fungsional (Test Cases Matrix)

| Test Case ID | Modul / Fitur | Skenario Pengujian | Input Data | Ekspektasi Hasil | Status Target |
|---|---|---|---|---|---|
| **TC-VAL-01** | Form Calon Siswa | Pengisian NISN kurang dari 10 digit | `31219741` (8 digit) | Sistem menolak dengan pesan "NISN harus tepat 10 digit numerik" | PASS |
| **TC-VAL-02** | Form Calon Siswa | Pengisian NISN valid 10 digit | `3121974130` (Sesuai contoh Alka) | Sistem menerima dan menandai field valid | PASS |
| **TC-VAL-03** | Form Calon Siswa | Pendaftaran dengan NISN ganda | NISN yang sudah terdaftar di gelombang aktif | Sistem menolak dengan pesan "NISN sudah terdaftar" | PASS |
| **TC-VAL-04** | Form Usia Siswa | Pendaftar berusia di atas 16 tahun | Tanggal lahir: 2005-01-01 | Sistem menampilkan peringatan usia melebihi batas regulasi SMP | PASS |
| **TC-UPL-01** | Berkas Dokumen | Unggah file melebihi 2 MB | File PDF berukuran 3.5 MB | Sistem menolak sebelum upload dan menampilkan peringatan batas ukuran | PASS |
| **TC-UPL-02** | Berkas Dokumen | Unggah file berekstensi berbahaya | `script.php` / `malware.exe` | Sistem memblokir upload (hanya izinkan `.pdf`, `.jpg`, `.jpeg`, `.png`) | PASS |
| **TC-UPL-03** | Berkas Dokumen | Unggah file valid dokumen resmi | `ijazah_sd.pdf` (1.2 MB) | File berhasil disimpan ke S3 dan status berubah menjadi PENDING | PASS |
| **TC-SUB-01** | Submit Final | Submit formulir tanpa upload Kartu Keluarga | Berkas KK belum diunggah | Tombol Submit terkunci, muncul pesan "Lengkapi dokumen wajib KK" | PASS |
| **TC-SUB-02** | Submit Final | Submit dengan seluruh data & berkas lengkap | Data lengkap Alka Alhabsy + 3 Berkas | Nomor pendaftaran diterbitkan (`REG-2026-G1-XXXX`), status SUBMITTED | PASS |
| **TC-VER-01** | Panitia Verifikasi | Panitia meminta revisi foto berkas buram | Berkas Akte ditandai REVISI dengan catatan "Foto buram" | Status siswa berubah menjadi REVISI, pendaftar menerima info catatan revisi | PASS |
| **TC-EXP-01** | Ekspor Dapodik | Ekspor data siswa berstatus Lulus Seleksi | Klik tombol "Ekspor ke Excel Dapodik" | File `.xlsx` terunduh dengan kolom standar NISN, TTL, Ortu lengkap | PASS |

---

## 3. Skenario User Acceptance Testing (UAT Script)

### Skenario 1: Pendaftaran Mandiri Calon Siswa oleh Orang Tua
- **Aktor**: Orang Tua Siswa (Ibu Tria).
- **Langkah-langkah**:
  1. Buka browser ponsel dan akses `https://ppdb.smp-yapia.sch.id`.
  2. Klik tombol "Daftar Akun Baru". Masukkan Nama, Nomor WhatsApp, dan Password.
  3. Lakukan pengisian Formulir Langkah 1 (Nama: *Alka alhabsy*, TTL: *Jakarta, 01 Juni 2012*, Agama: *Islam*, JK: *Laki-Laki*).
  4. Lakukan pengisian Formulir Langkah 2 (Sekolah Asal: *SD Negeri Pondok Cabe Ilir 02*, NISN: *3121974130*, BB: *45*, TB: *145*, Gol. Darah: *O*).
  5. Lakukan pengisian Formulir Langkah 3 (Alamat: *Jl. Talas II*, RT *06*, RW *01*, No *19*, Kel: *Pondok Cabe Ilir*, Kec: *Pamulang*, Kode Pos: *15418*).
  6. Lakukan pengisian Formulir Langkah 4 (Ayah: *Syamsudin*, SMA, 1980, Karyawan Swasta; Ibu: *Tria*, SMP, 1984, IRT).
  7. Unggah foto Ijazah SD, Kartu Keluarga, dan Akta Kelahiran.
  8. Klik "Final Submit Pendaftaran".
- **Kriteria Penerimaan (Acceptance Criteria)**:
  - Orang tua langsung mendapatkan Nomor Registrasi resmi.
  - Tanda Bukti Pendaftaran PDF dapat diunduh dan dibuka dengan tata letak rapi.

---

### Skenario 2: Pemeriksaan & Verifikasi Berkas oleh Panitia PPDB
- **Aktor**: Operator Panitia PPDB (Pak Asep).
- **Langkah-langkah**:
  1. Login ke panel Admin PPDB SMP YAPIA Ciputat.
  2. Buka menu "Verifikasi Berkas Pendaftar".
  3. Pilih pendaftar atas nama **Alka alhabsy** (`REG-2026-G1-0003`).
  4. Periksa kecocokan data nama di formulir dengan dokumen scan Ijazah SD.
  5. Klik tombol "Setujui Berkas & Verifikasi".
- **Kriteria Penerimaan (Acceptance Criteria)**:
  - Status pendaftaran calon siswa berubah menjadi `TERVERIFIKASI`.
  - Pendaftar menerima update status secara instan pada dasbor akun masing-masing.

---

### Skenario 3: Penanganan Berkas Buram / Permintaan Perbaikan
- **Aktor**: Panitia PPDB dan Orang Tua Siswa.
- **Langkah-langkah**:
  1. Panitia menemukan scan Kartu Keluarga terpotong nomor NIK-nya.
  2. Panitia memilih aksi "Minta Revisi", memilih jenis berkas `KARTU_KELUARGA`, dan menuliskan catatan: *"Mohon foto ulang Kartu Keluarga dengan seluruh halaman terlihat jelas"*.
  3. Orang tua membuka dashboard, melihat badge kuning bertuliskan `REVISI BERKAS` dan membaca catatan panitia.
  4. Orang tua mengunggah ulang foto KK baru dan menekan tombol "Kirim Ulang Dokumen".
- **Kriteria Penerimaan (Acceptance Criteria)**:
  - Hanya berkas yang direvisi yang dibuka kembali kuncinya untuk diedit.
  - Riwayat revisi tercatat di tabel log verifikasi sistem.

---

### Skenario 4: Rekapitulasi & Ekspor Data ke Dapodik
- **Aktor**: Operator Sekolah / Admin Dapodik.
- **Langkah-langkah**:
  1. Buka menu "Laporan & Ekspor Dapodik".
  2. Pilih Gelombang 1 TA 2026/2027 dan filter status "Diterima / Lulus Seleksi".
  3. Klik tombol "Unduh Format Dapodik".
- **Kriteria Penerimaan (Acceptance Criteria)**:
  - File Excel yang dihasilkan memiliki struktur kolom, penamaan header, dan format tanggal yang langsung diterima oleh formulir impor aplikasi Dapodik tanpa perlu diedit ulang secara manual.
