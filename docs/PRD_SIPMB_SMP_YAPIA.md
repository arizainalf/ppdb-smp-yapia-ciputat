# Product Requirements Document (PRD)
## Sistem Informasi Penerimaan Murid Baru (SIPMB)
### SMP YAPIA Ciputat

---

| Informasi Dokumen | Keterangan |
|---|---|
| **Produk** | SIPMB SMP YAPIA Ciputat (Web Platform) |
| **Versi Dokumen** | 1.0.0 |
| **Target Rilis** | Semester Ganjil TA 2026/2027 |
| **Target Platform** | Responsive Web (Mobile-First & Desktop) |
| **Penulis** | Tim Analis Produk & UI/UX |

---

## 1. Ikhtisar Produk (Product Overview)

SIPMB SMP YAPIA Ciputat adalah platform perangkat lunak berbasis web yang dirancang khusus untuk mengelola seluruh siklus penerimaan peserta didik baru di SMP YAPIA Ciputat. Aplikasi ini menggantikan formulir fisik konvensional menjadi formulir online interaktif dengan validasi cerdas, dasbor verifikasi berkas terpadu untuk panitia, serta mekanisme pelacakan status transparan bagi calon peserta didik dan orang tua/wali.

---

## 2. User Personas

### 2.1 Persona 1: Calon Siswa / Orang Tua (Pendaftar)
- **Nama Archetype**: Ibu Tria (38 tahun, Ibu dari calon siswa Alka Alhabsy).
- **Karakteristik**: Mengakses internet mayoritas via ponsel cerdas (Android/iOS), terbiasa dengan WhatsApp, menginginkan alur yang cepat tanpa harus bolak-balik ke sekolah saat jam kerja.
- **Tujuan**:
  - Mendaftarkan anaknya dengan memasukkan data ijazah SD dan KK tanpa salah ketik.
  - Mengunggah foto dokumen dengan mudah langsung dari kamera ponsel.
  - Mendapatkan kepastian bahwa formulir telah diterima dan diverifikasi sekolah.
  - Mencetak tanda bukti pendaftaran resmi ber-barcode untuk dibawa saat orientasi/daftar ulang.

### 2.2 Persona 2: Panitia PPDB / Verifikator Berkas
- **Nama Archetype**: Pak Asep (32 tahun, Guru & Panitia PPDB).
- **Karakteristik**: Menggunakan laptop/desktop di ruang panitia, bertugas memverifikasi ratusan formulir dalam waktu terbatas.
- **Tujuan**:
  - Melihat perbandingan langsung antara isian form pendaftar dengan dokumen asli (Ijazah SD, KK, Akta) secara berdampingan (*split screen*).
  - Memberikan feedback revisi berkas secara spesifik jika ada lampiran yang buram atau tidak terbaca.
  - Mencatat status verifikasi dan mencetak rekap pendaftaran harian.

### 2.3 Persona 3: Kepala Sekolah & Pimpinan Yayasan
- **Nama Archetype**: Drs. H. Suryadi (54 tahun, Kepala Sekolah SMP YAPIA Ciputat).
- **Karakteristik**: Memerlukan laporan agregat tanpa perlu menyelami detail teknis satu per satu.
- **Tujuan**:
  - Memantau progres keterisian kuota siswa per gelombang pendaftaran secara *real-time*.
  - Melihat sebaran asal sekolah pendaftar (wilayah Pamulang, Ciputat, dsk).
  - Mengesahkan keputusan kelulusan seleksi calon siswa.

---

## 3. Pemetaan Field Formulir Fisik ke Field Digital (Form Field Mapping)

Dokumen ini mengadopsi 100% item yang tertera pada Formulir Pendaftaran Fisik SMP YAPIA Ciputat:

| Bagian Formulir | Label Formulir Fisik | Field ID Teknis | Tipe Komponen UI | Validasi & Format | Keterangan |
|---|---|---|---|---|---|
| **Header** | No. Formulir (di gambar: "3") | `nomor_pendaftaran` | Auto-generated Badge | Format: `REG-YYYY-GX-XXXX` | Dibuat otomatis saat submit |
| **A. Calon** | 1. NAMA LENGKAP (SESUAI IJAZAH SD) | `nama_lengkap` | Text Input | Max 150 char, Alphabet + Spasi | Wajib (Mandatory) |
| **A. Calon** | 2. TEMPAT LAHIR | `tempat_lahir` | Text Input | Max 50 char, Alphabet | Wajib |
| **A. Calon** | 2. TANGGAL LAHIR | `tanggal_lahir` | Datepicker | Format: `YYYY-MM-DD`, Usia 10-16 th | Wajib |
| **A. Calon** | 3. AGAMA | `agama` | Radio / Select | ISLAM, KATOLIK, PROTESTAN, BUDHA, HINDU, LAINNYA | Wajib |
| **A. Calon** | 4. JENIS KELAMIN | `jenis_kelamin` | Radio Button | LAKI-LAKI, PEREMPUAN | Wajib |
| **A. Calon** | 5. NOMOR HANDPHONE | `no_hp` | Number / Tel Input | 10-14 digit angka, awalan 08/+62 | Wajib (terhubung WhatsApp) |
| **B. Sekolah** | 1. NAMA SEKOLAH ASAL | `nama_sekolah_asal` | Autocomplete / Text | Max 100 char | Wajib (Contoh: SDN Pondok Cabe Ilir 02) |
| **B. Sekolah** | 2. ALAMAT SEKOLAH ASAL | `alamat_sekolah_asal`| Textarea | Max 255 char | Wajib |
| **B. Sekolah** | 3. NISN | `nisn` | Number Input (10 box) | Tepat 10 digit angka numerik | Wajib & Unique |
| **B. Sekolah** | 4. BERAT BADAN | `berat_badan` | Number Input (Kg) | Integer 20 - 150 kg | Wajib |
| **B. Sekolah** | 4. TINGGI BADAN | `tinggi_badan` | Number Input (Cm) | Integer 100 - 220 cm | Wajib |
| **B. Sekolah** | 4. GOLONGAN DARAH | `golongan_darah` | Select / Radio | A, B, AB, O, LAINNYA, TIDAK_TAHU | Opsional |
| **C. Tempat Tinggal**| 1. ALAMAT TEMPAT TINGGAL | `alamat_jalan` | Text Input | Max 255 char (Nama Jalan/Gang) | Wajib |
| **C. Tempat Tinggal**| RT | `rt` | Number Input (2 box) | 1-3 digit numerik (contoh: 06) | Wajib |
| **C. Tempat Tinggal**| RW | `rw` | Number Input (2 box) | 1-3 digit numerik (contoh: 01) | Wajib |
| **C. Tempat Tinggal**| NO. | `no_rumah` | Text Input | Max 10 char (contoh: 19) | Wajib |
| **C. Tempat Tinggal**| KELURAHAN | `kelurahan` | Text Input / Select | Max 100 char (contoh: Pondok Cabe Ilir)| Wajib |
| **C. Tempat Tinggal**| KECAMATAN | `kecamatan` | Text Input / Select | Max 100 char (contoh: Pamulang) | Wajib |
| **C. Tempat Tinggal**| KODE POS | `kode_pos` | Number Input (5 box) | Tepat 5 digit numerik (contoh: 15418) | Wajib |
| **C. Tempat Tinggal**| NO. TELP RUMAH | `no_telp_rumah` | Tel Input (12 box) | Max 15 digit numerik | Opsional |
| **C. Tempat Tinggal**| 2. TINGGAL DENGAN | `tinggal_dengan` | Radio Button | ORANG_TUA, WALI, ASRAMA, LAINNYA | Wajib |
| **D. Orang Tua** | 1. NAMA AYAH (SESUAI IJAZAH) | `nama_ayah` | Text Input | Max 150 char | Wajib |
| **D. Orang Tua** | PENDIDIKAN AYAH | `pendidikan_ayah` | Select Dropdown | SD, SMP, SMA, D1-D3, S1, S2, S3, TIDAK_SEKOLAH | Wajib |
| **D. Orang Tua** | TAHUN LAHIR AYAH | `tahun_lahir_ayah` | Number Input (4 box) | 4 digit tahun (1940 - sekarang) | Wajib |
| **D. Orang Tua** | PEKERJAAN AYAH | `pekerjaan_ayah` | Select / Text | PNS, TNI/Polri, Karyawan Swasta, Wiraswasta, Buruh, Petani, Lainnya | Wajib |
| **D. Orang Tua** | PENGHASILAN BULANAN AYAH | `penghasilan_ayah` | Select Range / Text | < 1 Jt, 1-3 Jt, 3-5 Jt, 5-10 Jt, > 10 Jt | Wajib |
| **D. Orang Tua** | 2. NAMA IBU (SESUAI IJAZAH) | `nama_ibu` | Text Input | Max 150 char | Wajib |
| **D. Orang Tua** | PENDIDIKAN IBU | `pendidikan_ibu` | Select Dropdown | SD, SMP, SMA, D1-D3, S1, S2, S3, TIDAK_SEKOLAH | Wajib |
| **D. Orang Tua** | TAHUN LAHIR IBU | `tahun_lahir_ibu` | Number Input (4 box) | 4 digit tahun (1940 - sekarang) | Wajib |
| **D. Orang Tua** | PEKERJAAN IBU | `pekerjaan_ibu` | Select / Text | IRT, PNS, TNI/Polri, Karyawan Swasta, Wiraswasta, Lainnya | Wajib |
| **D. Orang Tua** | PENGHASILAN BULANAN IBU | `penghasilan_ibu` | Select Range / Text | Tidak Ada / Range Rupiah | Wajib |
| **D. Wali** | 3. NAMA WALI | `nama_wali` | Text Input | Max 150 char | Kondisional (Wajib jika tinggal dg wali)|
| **D. Wali** | PENDIDIKAN WALI | `pendidikan_wali` | Select Dropdown | SD, SMP, SMA, D1-D3, S1, S2, S3 | Kondisional |
| **D. Wali** | TAHUN LAHIR WALI | `tahun_lahir_wali` | Number Input (4 box) | 4 digit tahun | Kondisional |
| **D. Wali** | PEKERJAAN WALI | `pekerjaan_wali` | Select / Text | Max 100 char | Kondisional |
| **D. Wali** | PENGHASILAN BULANAN WALI | `penghasilan_wali` | Select Range / Text | Range Rupiah | Kondisional |
| **D. Wali** | ALAMAT LENGKAP WALI | `alamat_wali` | Form Nested | RT/RW/No/Kel/Kec/Kode Pos/Telp | Kondisional |
| **Catatan Berkas**| 1. SCAN/FOTO IJAZAH SD / SKL | `file_ijazah` | File Upload Picker | JPG/PNG/PDF, Max 2MB | Wajib |
| **Catatan Berkas**| 2. SCAN/FOTO KARTU KELUARGA | `file_kk` | File Upload Picker | JPG/PNG/PDF, Max 2MB | Wajib |
| **Catatan Berkas**| 3. SCAN/FOTO AKTA KELAHIRAN | `file_akta` | File Upload Picker | JPG/PNG/PDF, Max 2MB | Wajib |
| **Catatan Berkas**| 4. PAS FOTO CALON SISWA | `file_pas_foto` | File Upload Picker | JPG/PNG, Max 2MB (3x4 background biru/merah) | Opsional / Disarankan |

---

## 4. Kebutuhan Fungsional (Functional Requirements)

### FR-01: Autentikasi & Akun Pendaftar
- **Deskripsi**: Pendaftar membuat akun menggunakan No. WhatsApp & Password. Sistem mengirim kode OTP / verifikasi login.
- **User Story**: Sebagai orang tua calon siswa, saya ingin mendaftar akun SIPMB agar saya dapat melanjutkan pengisian formulir kapan saja secara aman.
- **Acceptance Criteria**:
  - *Given* pengguna berada di halaman registrasi,
  - *When* pengguna memasukkan Nama, No. WhatsApp, dan Password yang valid (min 8 karakter),
  - *Then* akun berhasil dibuat, pengguna diarahkan ke dasbor pengisian formulir pendaftaran.

### FR-02: Pengisian Formulir Multi-Langkah (Multi-Step Wizard)
- **Deskripsi**: Pengisian data dibagi dalam 5 tahapan logis:
  1. *Langkah 1*: Biodata Calon Siswa (Bagian A).
  2. *Langkah 2*: Data Sekolah Sebelumnya & Fisik (Bagian B).
  3. *Langkah 3*: Data Tempat Tinggal & Domisili (Bagian C).
  4. *Langkah 4*: Data Orang Tua & Wali (Bagian D).
  5. *Langkah 5*: Unggah Dokumen Persyaratan & Review Akhir.
- **Acceptance Criteria**:
  - Terdapat fitur *Auto-Save Draft* sehingga pendaftar tidak kehilangan data jika koneksi terputus.
  - Setiap langkah memiliki validasi *client-side* real-time (contoh: NISN harus 10 digit sebelum bisa klik 'Lanjut').

### FR-03: Unggah & Preview Dokumen Persyaratan
- **Deskripsi**: Fasilitas unggah Ijazah SD/SKL, Kartu Keluarga, dan Akta Kelahiran.
- **Acceptance Criteria**:
  - Mendukung format `.pdf`, `.jpg`, `.jpeg`, `.png`.
  - Sistem memvalidasi ukuran file (maksimal 2 MB per file).
  - Pendaftar dapat melihat pratinjau (*preview*) dokumen yang baru saja diunggah untuk memastikan gambar tidak terpotong atau buram.

### FR-04: Pelacakan Status & Notifikasi Real-time
- **Deskripsi**: Pendaftar dapat melihat *timeline badge* status pendaftaran:
  `DRAFT` ➔ `SUBMITTED (MENUNGGU VERIFIKASI)` ➔ `REVISI BERKAS` ➔ `TERVERIFIKASI` ➔ `DITERIMA / CADANGAN / DITOLAK` ➔ `DAFTAR ULANG`.
- **Acceptance Criteria**:
  - Jika panitia menandai berkas butuh revisi, pendaftar menerima catatan spesifik (misal: "Foto Akta Kelahiran buram, mohon foto ulang").
  - Form unggah berkas otomatis terbuka kembali untuk lampiran yang direvisi.

### FR-05: Unduh Bukti Pendaftaran Resmi (PDF)
- **Deskripsi**: Menghasilkan dokumen cetak resmi PDF Formulir Pendaftaran dan Kartu Tanda Peserta PPDB SMP YAPIA Ciputat.
- **Acceptance Criteria**:
  - Dokumen mencantumkan Nomor Pendaftaran resmi, QR Code verifikasi keaslian, biodata lengkap, dan kolom tanda tangan (Ketua Panitia PPDB, Orang Tua/Wali, dan Calon Siswa).
  - Ketika QR Code dipindai panitia, mengarahkan ke halaman verifikasi online sistem.

### FR-06: Dasbor Verifikasi Panitia PPDB (Back-Office)
- **Deskripsi**: Panitia dapat menyaring pendaftar berdasarkan gelombang, status verifikasi, dan tanggal pendaftaran.
- **Acceptance Criteria**:
  - Layar verifikasi menyediakan tampilan terpisah (*side-by-side view*): data inputan formulir di sisi kiri, dan viewer dokumen foto/PDF di sisi kanan.
  - Tombol aksi cepat: `Setujui Semua Berkas`, `Minta Perbaikan Berkas`, atau `Tolak Pendaftaran`.

### FR-07: Manajemen Gelombang & Kuota PPDB
- **Deskripsi**: Administrator dapat menambah dan mengonfigurasi gelombang pendaftaran (contoh: Gelombang 1, Gelombang 2, Gelombang Khusus).
- **Acceptance Criteria**:
  - Administrator dapat menetapkan tanggal buka, tanggal tutup, dan batas maksimal kuota pendaftar.
  - Jika kuota gelombang penuh atau melewati tanggal penutupan, sistem secara otomatis menolak pendaftaran baru untuk gelombang tersebut dan mengarahkan ke gelombang berikutnya.

### FR-08: Ekspor Data Sesuai Standar Dapodik
- **Deskripsi**: Fitur ekspor data siswa baru yang telah berstatus `DITERIMA` ke format Microsoft Excel (.xlsx) / CSV.
- **Acceptance Criteria**:
  - Kolom ekspor disesuaikan dengan template resmi Dapodik: NISN, Nama Siswa, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Agama, Nama Ibu Kandung, Nama Ayah, dsb.

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Keamanan Data Pribadi (Compliance UU PDP No. 27/2022)**:
   - Data anak di bawah umur dan data kependudukan (NIK, KK) dienkripsi pada database (*Encryption at Rest* - AES-256).
   - Akses API dilindungi oleh autentikasi berbasis Bearer Token / HTTP-only Secure Cookie.
   - Hak akses data dibatasi secara ketat (*Role-Based Access Control* - RBAC).
2. **Performa & Skalabilitas**:
   - Waktu respons API rata-rata < 300 ms untuk transaksi standar.
   - Beban unggah dokumen didistribusikan ke Object Storage mandiri dengan *pre-signed upload URL*.
   - Mampu menangani hingga 500 pengguna konkuren tanpa degradasi performa pada hari pertama pembukaan gelombang.
3. **Kompatibilitas & Responsivitas**:
   - Tampilan wajib responsif 100% pada resolusi mobile (360px) hingga layar desktop (1920px).
   - Kompatibel dengan peramban modern: Google Chrome, Mozilla Firefox, Safari, Microsoft Edge.
4. **Keandalan & Backup**:
   - Mekanisme *automated daily backup* untuk basis data dan berkas dokumen pendaftar.
   - Target *Disaster Recovery Time Objective (RTO)* < 2 jam dan *Recovery Point Objective (RPO)* < 24 jam.
