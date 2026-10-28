import { ICalonSiswaRepository } from '../../application/ports/ICalonSiswaRepository.js';
import { CalonSiswa, CalonSiswaProps } from '../../domain/entities/CalonSiswa.js';
import { d1Client } from '../../infrastructure/database/d1Client.js';

interface RawD1CalonSiswa {
  id: string;
  user_id: string;
  gelombang_id: number;
  nomor_pendaftaran: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: string;
  email?: string;
  no_hp_siswa?: string;
  status_pendaftaran: string;
  created_at: string;
  updated_at: string;
}

export class D1CalonSiswaRepository implements ICalonSiswaRepository {
  public async findById(id: string): Promise<CalonSiswa | null> {
    const res = await d1Client.query<RawD1CalonSiswa>(
      'SELECT * FROM calon_siswa WHERE id = ? LIMIT 1',
      [id]
    );

    if (res.results.length === 0) return null;

    const row = res.results[0];
    return new CalonSiswa({
      id: row.id,
      userId: row.user_id,
      gelombangId: row.gelombang_id,
      nomorPendaftaran: row.nomor_pendaftaran,
      namaLengkap: row.nama_lengkap,
      email: row.email,
      jenisKelamin: row.jenis_kelamin,
      tempatLahir: row.tempat_lahir,
      tanggalLahir: row.tanggal_lahir,
      agama: row.agama,
      noHpSiswa: row.no_hp_siswa,
      statusPendaftaran: row.status_pendaftaran as any,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  public async findByNomorPendaftaran(nomorPendaftaran: string): Promise<CalonSiswa | null> {
    const res = await d1Client.query<RawD1CalonSiswa>(
      'SELECT * FROM calon_siswa WHERE nomor_pendaftaran = ? LIMIT 1',
      [nomorPendaftaran]
    );

    if (res.results.length === 0) return null;
    const row = res.results[0];

    return new CalonSiswa({
      id: row.id,
      userId: row.user_id,
      gelombangId: row.gelombang_id,
      nomorPendaftaran: row.nomor_pendaftaran,
      namaLengkap: row.nama_lengkap,
      email: row.email,
      jenisKelamin: row.jenis_kelamin,
      tempatLahir: row.tempat_lahir,
      tanggalLahir: row.tanggal_lahir,
      agama: row.agama,
      noHpSiswa: row.no_hp_siswa,
      statusPendaftaran: row.status_pendaftaran as any,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  public async findAll(): Promise<CalonSiswa[]> {
    const res = await d1Client.query<RawD1CalonSiswa>(
      'SELECT * FROM calon_siswa ORDER BY created_at DESC'
    );

    return res.results.map(
      (row) =>
        new CalonSiswa({
          id: row.id,
          userId: row.user_id,
          gelombangId: row.gelombang_id,
          nomorPendaftaran: row.nomor_pendaftaran,
          namaLengkap: row.nama_lengkap,
          email: row.email,
          jenisKelamin: row.jenis_kelamin,
          tempatLahir: row.tempat_lahir,
          tanggalLahir: row.tanggal_lahir,
          agama: row.agama,
          noHpSiswa: row.no_hp_siswa,
          statusPendaftaran: row.status_pendaftaran as any,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })
    );
  }

  public async save(calonSiswa: CalonSiswa): Promise<void> {
    const p = calonSiswa.toJSON();

    // 1. Verifikasi FK user_id: pastikan ID benar-benar terdaftar di tabel `users`
    let validUserId: string | null = null;
    if (p.userId) {
      const userCheck = await d1Client.query<{ id: string }>(
        'SELECT id FROM users WHERE id = ? LIMIT 1',
        [p.userId]
      );
      if (userCheck.results.length > 0) {
        validUserId = p.userId;
      }
    }

    // 2. Verifikasi FK gelombang_id: pastikan ID gelombang valid
    let validGelombangId = p.gelombangId;
    const gelombangCheck = await d1Client.query<{ id: number }>(
      'SELECT id FROM gelombang_pendaftaran WHERE id = ? LIMIT 1',
      [p.gelombangId]
    );
    if (gelombangCheck.results.length === 0) {
      const activeGelombang = await d1Client.query<{ id: number }>(
        'SELECT id FROM gelombang_pendaftaran WHERE is_active = 1 LIMIT 1'
      );
      validGelombangId = activeGelombang.results[0]?.id ?? 1;
    }

    await d1Client.query(
      `INSERT INTO calon_siswa (
        id, user_id, gelombang_id, nomor_pendaftaran, nama_lengkap, email,
        jenis_kelamin, tempat_lahir, tanggal_lahir, agama, no_hp_siswa,
        status_pendaftaran, jalur_pendaftaran, nomor_kip_sktm, pdp_consent,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        validUserId,
        validGelombangId,
        p.nomorPendaftaran,
        p.namaLengkap,
        p.email ?? null,
        p.jenisKelamin,
        p.tempatLahir,
        p.tanggalLahir,
        p.agama,
        p.noHpSiswa ?? null,
        p.statusPendaftaran,
        p.jalurPendaftaran ?? 'REGULER',
        p.nomorKipSktm ?? null,
        p.pdpConsent ? 1 : 0,
        p.createdAt,
        p.updatedAt,
      ]
    );
  }

  public async update(calonSiswa: CalonSiswa): Promise<void> {
    const p = calonSiswa.toJSON();
    await d1Client.query(
      `UPDATE calon_siswa SET
        nama_lengkap = ?, jenis_kelamin = ?, status_pendaftaran = ?, updated_at = ?
      WHERE id = ?`,
      [p.namaLengkap, p.jenisKelamin, p.statusPendaftaran, p.updatedAt, p.id]
    );
  }

  public async generateNomorPendaftaran(gelombangId: number): Promise<string> {
    // Lanjutkan dari urutan tertinggi yang pernah terpakai (bukan COUNT),
    // agar nomor tidak ter-issues ulang setelah ada baris yang dihapus.
    const res = await d1Client.query<{ maks: number | null }>(
      `SELECT MAX(CAST(SUBSTR(nomor_pendaftaran, -4) AS INTEGER)) as maks
       FROM calon_siswa WHERE gelombang_id = ?`,
      [gelombangId]
    );

    const next = (res.results[0]?.maks ?? 0) + 1;
    const year = new Date().getFullYear();
    const formattedCount = String(next).padStart(4, '0');
    return `REG-${year}-G${gelombangId}-${formattedCount}`;
  }
}
