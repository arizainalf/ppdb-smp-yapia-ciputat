# RESTful API Specification
## Sistem Informasi Penerimaan Murid Baru (SIPMB)
### SMP YAPIA Ciputat

---

| Parameter | Spesifikasi |
|---|---|
| **Base URL** | `https://ppdb.smp-yapia.sch.id/api/v1` |
| **Protokol** | HTTPS / TLS 1.3 |
| **Format Pertukaran Data**| JSON (`application/json`) & Multipart (`multipart/form-data`) |
| **Standar Format Respon** | JSend Specification (status: success, fail, error) |
| **Autentikasi** | HTTP Bearer Token (JWT) / HTTP-Only Session Cookie |

---

## 1. Standar Format Respon (Response Envelope)

### 1.1 Respon Sukses (200 OK / 201 Created)
```json
{
  "status": "success",
  "message": "Operasi berhasil dilakukan",
  "data": {
    "id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "nomorPendaftaran": "REG-2026-G1-0003"
  }
}
```

### 1.2 Respon Validasi Gagal (422 Unprocessable Entity)
```json
{
  "status": "fail",
  "message": "Validasi formulir gagal",
  "errors": [
    {
      "field": "sekolahAsal.nisn",
      "message": "NISN harus terdiri dari tepat 10 digit numerik"
    },
    {
      "field": "berkas.fileIjazah",
      "message": "Dokumen ijazah SD wajib diunggah"
    }
  ]
}
```

### 1.3 Respon Kesalahan Server (500 Internal Server Error)
```json
{
  "status": "error",
  "message": "Terjadi kendala pada sistem backend. Silakan coba kembali nanti.",
  "code": "INTERNAL_SERVER_ERROR"
}
```

---

## 2. Endpoint Autentikasi (`/api/v1/auth`)

### 2.1 Registrasi Akun Pendaftar
- **Endpoint**: `POST /auth/register`
- **Akses**: Publik
- **Payload Request**:
```json
{
  "namaLengkap": "Tria (Orang Tua Alka)",
  "noHp": "082113529348",
  "email": "tria.alka@example.com",
  "password": "PasswordKuat123!"
}
```
- **Respon (201 Created)**:
```json
{
  "status": "success",
  "message": "Akun pendaftar berhasil dibuat",
  "data": {
    "user": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "namaLengkap": "Tria (Orang Tua Alka)",
      "noHp": "082113529348",
      "role": "PENDAFTAR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.2 Login Pengguna (Pendaftar & Panitia)
- **Endpoint**: `POST /auth/login`
- **Akses**: Publik
- **Payload Request**:
```json
{
  "identifier": "082113529348", // Nomor HP atau Email
  "password": "PasswordKuat123!"
}
```
- **Respon (200 OK)**:
```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "namaLengkap": "Tria (Orang Tua Alka)",
      "role": "PENDAFTAR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 3. Endpoint Formulir Pendaftaran (`/api/v1/pendaftaran`)

### 3.1 Mengambil Data Pendaftaran Pengguna Saat Ini
- **Endpoint**: `GET /pendaftaran/my`
- **Akses**: Pendaftar (Bearer Token)
- **Respon (200 OK)**: Mengembalikan seluruh data draft/submitted pendaftaran termasuk Bagian A, B, C, D, dan berkas lampiran.

### 3.2 Simpan / Perbarui Formulir (Draft Auto-Save)
- **Endpoint**: `PUT /pendaftaran/save-draft`
- **Akses**: Pendaftar
- **Payload Request**:
```json
{
  "gelombangId": 1,
  "calonSiswa": {
    "namaLengkap": "Alka alhabsy",
    "tempatLahir": "Jakarta",
    "tanggalLahir": "2012-06-01",
    "agama": "ISLAM",
    "jenisKelamin": "LAKI-LAKI",
    "noHp": "082113529348"
  },
  "sekolahAsal": {
    "namaSekolah": "SD Negeri Pondok Cabe Ilir 02",
    "alamatSekolah": "Jl. Talas II Kel. Pondok Cabe Ilir Kec. Pamulang",
    "nisn": "3121974130",
    "beratBadan": 45,
    "tinggiBadan": 145,
    "golonganDarah": "O"
  },
  "alamatSiswa": {
    "alamatJalan": "Jl. Talas II",
    "rt": "06",
    "rw": "01",
    "noRumah": "19",
    "kelurahan": "Pondok Cabe Ilir",
    "kecamatan": "Pamulang",
    "kodePos": "15418",
    "noTelpRumah": null,
    "tinggalDengan": "ORANG_TUA"
  },
  "orangTuaWali": [
    {
      "hubungan": "AYAH",
      "nama": "Syamsudin",
      "pendidikanTerakhir": "SMA",
      "tahunLahir": 1980,
      "pekerjaan": "Karyawan Swasta",
      "penghasilanBulanan": 3500000
    },
    {
      "hubungan": "IBU",
      "nama": "Tria",
      "pendidikanTerakhir": "SMP",
      "tahunLahir": 1984,
      "pekerjaan": "Ibu Rumah Tangga",
      "penghasilanBulanan": 0
    }
  ]
}
```

### 3.3 Final Submit Pendaftaran
- **Endpoint**: `POST /pendaftaran/submit`
- **Akses**: Pendaftar
- **Deskripsi**: Mengunci data, memvalidasi kelengkapan semua bagian form dan berkas wajib (Ijazah, KK, Akta), membuat nomor pendaftaran resmi.
- **Respon (200 OK)**:
```json
{
  "status": "success",
  "message": "Pendaftaran berhasil dikirim ke Panitia PPDB",
  "data": {
    "nomorPendaftaran": "REG-2026-G1-0003",
    "statusPendaftaran": "SUBMITTED",
    "tanggalSubmit": "2026-10-15T17:07:43+07:00"
  }
}
```

### 3.4 Unduh Tanda Bukti Pendaftaran (PDF)
- **Endpoint**: `GET /pendaftaran/:id/cetak-bukti`
- **Akses**: Pendaftar & Panitia
- **Header Respon**: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="Bukti_Pendaftaran_REG-2026-G1-0003.pdf"`

---

## 4. Endpoint Manajemen Berkas Dokumen (`/api/v1/dokumen`)

### 4.1 Unggah Berkas Persyaratan
- **Endpoint**: `POST /dokumen/upload`
- **Akses**: Pendaftar
- **Content-Type**: `multipart/form-data`
- **Form Body**:
  - `file`: Binary file (Max 2MB, PDF/JPG/PNG)
  - `jenisBerkas`: Enum `IJAZAH_SD` | `KARTU_KELUARGA` | `AKTA_KELAHIRAN` | `PAS_FOTO`
- **Respon (201 Created)**:
```json
{
  "status": "success",
  "message": "Dokumen berhasil diunggah",
  "data": {
    "dokumenId": "c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    "jenisBerkas": "IJAZAH_SD",
    "originalFileName": "ijazah_alka.pdf",
    "fileSizeBytes": 1240500,
    "statusVerifikasi": "PENDING"
  }
}
```

### 4.2 Dapatkan Temporary Presigned URL Berkas (Preview)
- **Endpoint**: `GET /dokumen/:id/view-url`
- **Akses**: Pemilik Berkas atau Panitia PPDB
- **Respon (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "viewUrl": "https://s3.yapia.sch.id/ppdb-private/docs/2026/ijazah_alka.pdf?X-Amz-Signature=...",
    "expiresInSeconds": 900
  }
}
```

---

## 5. Endpoint Panitia & Back-Office (`/api/v1/admin`)

### 5.1 Daftar Calon Siswa (Dengan Filter & Pagination)
- **Endpoint**: `GET /admin/pendaftaran?gelombangId=1&status=SUBMITTED&search=Alka&page=1&limit=20`
- **Akses**: `PANITIA_VERIFIKATOR`, `SUPERADMIN`
- **Respon (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        "nomorPendaftaran": "REG-2026-G1-0003",
        "namaLengkap": "Alka alhabsy",
        "namaSekolahAsal": "SD Negeri Pondok Cabe Ilir 02",
        "nisn": "3121974130",
        "tanggalSubmit": "2026-10-15T17:07:43+07:00",
        "statusPendaftaran": "SUBMITTED"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 142
    }
  }
}
```

### 5.2 Verifikasi Status & Dokumen Calon Siswa
- **Endpoint**: `PATCH /admin/pendaftaran/:id/verifikasi`
- **Akses**: `PANITIA_VERIFIKATOR`
- **Payload Request**:
```json
{
  "statusPendaftaran": "TERVERIFIKASI", // Atau 'REVISI'
  "catatanVerifikasi": "Seluruh berkas fisik & digital telah sesuai dengan data Dapodik",
  "berkasStatus": [
    { "berkasId": "c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", "status": "VALID" },
    { "berkasId": "c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44", "status": "VALID" },
    { "berkasId": "c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a55", "status": "VALID" }
  ]
}
```

### 5.3 Ekspor Data Bersih ke Format Excel Dapodik
- **Endpoint**: `GET /admin/export/dapodik?gelombangId=1&status=LULUS_SELEKSI`
- **Akses**: `SUPERADMIN`, `PANITIA_VERIFIKATOR`
- **Header Respon**: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename="Dapodik_SMP_YAPIA_2026.xlsx"`
