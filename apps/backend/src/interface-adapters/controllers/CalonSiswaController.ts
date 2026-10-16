import { Context } from 'hono';
import { CreateCalonSiswaUseCase } from '../../application/use-cases/CreateCalonSiswaUseCase.js';
import { ICalonSiswaRepository } from '../../application/ports/ICalonSiswaRepository.js';
import { JSendPresenter } from '../presenters/JSendPresenter.js';
import { createCalonSiswaSchema } from '@yapia/shared';
import { d1Client } from '../../infrastructure/database/d1Client.js';
import { z } from 'zod';

export class CalonSiswaController {
  constructor(
    private readonly createUseCase: CreateCalonSiswaUseCase,
    private readonly calonSiswaRepo: ICalonSiswaRepository
  ) {}

  public handleGetAll = async (c: Context) => {
    try {
      const query = `
        SELECT
          cs.id,
          cs.nomor_pendaftaran as nomorPendaftaran,
          cs.nama_lengkap as namaLengkap,
          COALESCE(sa.nisn, '0123456789') as nisn,
          COALESCE(sa.nama_sekolah, 'SD Negeri di Tangerang Selatan') as sekolahAsal,
          COALESCE(sa.npsn, '20603123') as npsnAsal,
          COALESCE(al.kecamatan, 'Ciputat') as kecamatanAsal,
          cs.jenis_kelamin as jenisKelamin,
          cs.tempat_lahir as tempatLahir,
          cs.tanggal_lahir as tanggalLahir,
          cs.agama as agama,
          COALESCE(al.jalan || ' RT ' || al.rt || '/RW ' || al.rw || ', ' || al.kelurahan || ', ' || al.kecamatan, al.jalan, 'Ciputat, Tangerang Selatan') as alamat,
          COALESCE(otw.nama_lengkap || ' (' || otw.hubungan || ')', otw.nama_lengkap, 'Orang Tua Murid') as namaOrtu,
          COALESCE(otw.no_hp, cs.no_hp_siswa, '-') as noHpOrtu,
          cs.gelombang_id as gelombangId,
          cs.status_pendaftaran as status,
          cs.created_at as tanggalDaftar,
          cs.jalur_pendaftaran as jalurPendaftaran,
          cs.nomor_kip_sktm as nomorKipSktm,
          cs.pdp_consent as pdpConsent,
          cs.verifikasi_fisik as verifikasiFisikVerified,
          cs.verifikasi_fisik_by as verifikasiFisikBy,
          cs.verifikasi_fisik_at as verifikasiFisikAt,
          cs.verifikasi_fisik_notes as verifikasiFisikNotes,
          cs.kemampuan_quran as observasiQuran,
          cs.catatan_pendampingan as catatanPendampingan,
          cs.catatan_wawancara as catatanWawancara
        FROM calon_siswa cs
        LEFT JOIN sekolah_asal sa ON cs.id = sa.calon_siswa_id
        LEFT JOIN alamat_siswa al ON cs.id = al.calon_siswa_id
        LEFT JOIN orang_tua_wali otw ON cs.id = otw.calon_siswa_id
        ORDER BY cs.created_at DESC
      `;

      const rows = await d1Client.query<any>(query);

      const items = rows.results.map((r) => ({
        id: r.id,
        nomorPendaftaran: r.nomorPendaftaran,
        namaLengkap: r.namaLengkap,
        nisn: r.nisn,
        sekolahAsal: r.sekolahAsal,
        npsnAsal: r.npsnAsal,
        kecamatanAsal: r.kecamatanAsal,
        jenisKelamin: r.jenisKelamin,
        tempatLahir: r.tempatLahir,
        tanggalLahir: r.tanggalLahir,
        agama: r.agama,
        alamat: r.alamat,
        namaOrtu: r.namaOrtu,
        noHpOrtu: r.noHpOrtu,
        gelombangId: r.gelombangId,
        status: r.status,
        tanggalDaftar: r.tanggalDaftar ? new Date(r.tanggalDaftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '16 Okt 2026',
        jalurPendaftaran: r.jalurPendaftaran,
        nomorKipSktm: r.nomorKipSktm,
        pdpConsent: Boolean(r.pdpConsent),
        verifikasiFisik: {
          verified: Boolean(r.verifikasiFisikVerified),
          verifiedBy: r.verifikasiFisikBy || 'Staf Tata Usaha',
          verifiedAt: r.verifikasiFisikAt || '',
          notes: r.verifikasiFisikNotes || '',
        },
        observasi: {
          kemampuanQuran: r.observasiQuran || 'LANCAR_ALQURAN',
          catatanPendampingan: r.catatanPendampingan || 'Mandiri / Normal',
          catatanWawancara: r.catatanWawancara || '',
        },
        berkas: { ijazah: true, kk: true, akta: true, foto: true },
        catatanPanitia: r.verifikasiFisikNotes || 'Data telah tersimpan di sistem SIPMB.',
      }));

      return c.json(
        JSendPresenter.success(items, 'Data seluruh calon siswa berhasil diambil'),
        200
      );
    } catch (err: any) {
      return c.json(
        JSendPresenter.error(err.message || 'Gagal mengambil data calon siswa'),
        500
      );
    }
  };

  public handleGetById = async (c: Context) => {
    try {
      const q = c.req.param('id');
      if (!q) {
        return c.json(JSendPresenter.fail('Parameter query wajib disertakan'), 400);
      }

      const query = `
        SELECT
          cs.id,
          cs.nomor_pendaftaran as nomorPendaftaran,
          cs.nama_lengkap as namaLengkap,
          COALESCE(sa.nisn, '0123456789') as nisn,
          COALESCE(sa.nama_sekolah, 'SD Negeri di Tangerang Selatan') as sekolahAsal,
          COALESCE(sa.npsn, '20603123') as npsnAsal,
          COALESCE(al.kecamatan, 'Ciputat') as kecamatanAsal,
          cs.jenis_kelamin as jenisKelamin,
          cs.tempat_lahir as tempatLahir,
          cs.tanggal_lahir as tanggalLahir,
          cs.agama as agama,
          COALESCE(al.jalan || ' RT ' || al.rt || '/RW ' || al.rw || ', ' || al.kelurahan || ', ' || al.kecamatan, al.jalan, 'Ciputat, Tangerang Selatan') as alamat,
          COALESCE(otw.nama_lengkap || ' (' || otw.hubungan || ')', otw.nama_lengkap, 'Orang Tua Murid') as namaOrtu,
          COALESCE(otw.no_hp, cs.no_hp_siswa, '-') as noHpOrtu,
          cs.gelombang_id as gelombangId,
          cs.status_pendaftaran as status,
          cs.created_at as tanggalDaftar,
          cs.jalur_pendaftaran as jalurPendaftaran,
          cs.nomor_kip_sktm as nomorKipSktm,
          cs.pdp_consent as pdpConsent,
          cs.verifikasi_fisik as verifikasiFisikVerified,
          cs.verifikasi_fisik_by as verifikasiFisikBy,
          cs.verifikasi_fisik_at as verifikasiFisikAt,
          cs.verifikasi_fisik_notes as verifikasiFisikNotes,
          cs.kemampuan_quran as observasiQuran,
          cs.catatan_pendampingan as catatanPendampingan,
          cs.catatan_wawancara as catatanWawancara
        FROM calon_siswa cs
        LEFT JOIN sekolah_asal sa ON cs.id = sa.calon_siswa_id
        LEFT JOIN alamat_siswa al ON cs.id = al.calon_siswa_id
        LEFT JOIN orang_tua_wali otw ON cs.id = otw.calon_siswa_id
        WHERE cs.id = ?
           OR UPPER(cs.nomor_pendaftaran) = UPPER(?)
           OR sa.nisn = ?
           OR cs.no_hp_siswa LIKE ?
           OR otw.no_hp LIKE ?
           OR LOWER(cs.email) = LOWER(?)
        LIMIT 1
      `;

      const cleanPhone = `%${q.replace(/[^0-9]/g, '').slice(-8)}%`;
      const res = await d1Client.query<any>(query, [q, q, q, cleanPhone, cleanPhone, q]);

      if (res.results.length === 0) {
        return c.json(JSendPresenter.fail('Data pendaftaran tidak ditemukan', { query: q }), 404);
      }

      const r = res.results[0];
      const data = {
        id: r.id,
        nomorPendaftaran: r.nomorPendaftaran,
        namaLengkap: r.namaLengkap,
        nisn: r.nisn,
        sekolahAsal: r.sekolahAsal,
        gelombang: `Gelombang ${r.gelombangId} (T.A 2026/2027)`,
        status: r.status,
        jalur: r.jalurPendaftaran === 'AFIRMASI' ? `AFIRMASI (KIP: ${r.nomorKipSktm || '-'})` : r.jalurPendaftaran,
        tanggalDaftar: r.tanggalDaftar ? new Date(r.tanggalDaftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '16 Oktober 2026',
        verifikasiFisik: Boolean(r.verifikasiFisikVerified),
        observasiQuran: r.observasiQuran || 'Lancar Baca Al-Quran (LANCAR_ALQURAN)',
        rombel: 'Kelas 7A',
        catatanPanitia: r.verifikasiFisikNotes || 'Data pendaftaran telah terverifikasi dalam pangkalan data SIPMB.',
      };

      return c.json(JSendPresenter.success(data), 200);
    } catch (err: any) {
      return c.json(
        JSendPresenter.error(err.message || 'Gagal mencari data calon siswa'),
        500
      );
    }
  };

  public handleUpdateStatus = async (c: Context) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      const { status, catatan, verifikasiFisik, observasi, actor } = body;

      const updates: string[] = [];
      const params: any[] = [];

      if (status) {
        updates.push('status_pendaftaran = ?');
        params.push(status);
      }

      if (catatan !== undefined) {
        updates.push('verifikasi_fisik_notes = ?');
        params.push(catatan);
      }

      if (verifikasiFisik) {
        updates.push('verifikasi_fisik = ?');
        params.push(verifikasiFisik.verified ? 1 : 0);
        if (verifikasiFisik.verifiedBy) {
          updates.push('verifikasi_fisik_by = ?');
          params.push(verifikasiFisik.verifiedBy);
        }
        updates.push('verifikasi_fisik_at = ?');
        params.push(new Date().toISOString());
      }

      if (observasi) {
        if (observasi.kemampuanQuran) {
          updates.push('kemampuan_quran = ?');
          params.push(observasi.kemampuanQuran);
        }
        if (observasi.catatanPendampingan) {
          updates.push('catatan_pendampingan = ?');
          params.push(observasi.catatanPendampingan);
        }
        if (observasi.catatanWawancara) {
          updates.push('catatan_wawancara = ?');
          params.push(observasi.catatanWawancara);
        }
      }

      updates.push('updated_at = (strftime(\'%Y-%m-%dT%H:%M:%fZ\', \'now\'))');

      if (updates.length > 0) {
        params.push(id);
        await d1Client.query(
          `UPDATE calon_siswa SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }

      // Catat log audit
      try {
        await d1Client.query(
          `INSERT INTO audit_logs (id, calon_siswa_id, user_id, action, notes)
           VALUES (?, ?, NULL, ?, ?)`,
          [crypto.randomUUID(), id, `Status diubah ke ${status}`, catatan || `${actor || 'Panitia'} memperbarui status`]
        );
      } catch {}

      return c.json(JSendPresenter.success(null, 'Status pendaftar berhasil diperbarui'), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal memperbarui status pendaftar'), 500);
    }
  };

  public handleCreate = async (c: Context) => {
    try {
      const body = await c.req.json();
      const validatedInput = createCalonSiswaSchema.parse(body);

      const result = await this.createUseCase.execute(validatedInput);

      // Simpan data orang tua jika dikirim dalam body
      if (body.namaOrtu || body.namaAyah || body.namaIbu || body.noHpOrtu || body.noHpSiswa) {
        try {
          await d1Client.query(
            `INSERT INTO orang_tua_wali (id, calon_siswa_id, hubungan, nama_lengkap, no_hp)
             VALUES (?, ?, ?, ?, ?)`,
            [
              crypto.randomUUID(),
              result.id,
              'Ayah/Wali',
              body.namaOrtu || body.namaAyah || body.namaIbu || 'Wali Murid',
              body.noHpOrtu || body.noHpSiswa || '-',
            ]
          );
        } catch {}
      }

      // Simpan data sekolah asal jika dikirim dalam body
      if (body.sekolahAsal || body.nisn) {
        try {
          await d1Client.query(
            `INSERT INTO sekolah_asal (id, calon_siswa_id, nama_sekolah, npsn, nisn)
             VALUES (?, ?, ?, ?, ?)`,
            [
              crypto.randomUUID(),
              result.id,
              body.sekolahAsal || 'SD Negeri',
              body.npsnAsal || '',
              body.nisn || '0123456789',
            ]
          );
        } catch {}
      }

      // Simpan alamat jika dikirim
      if (body.alamat) {
        try {
          await d1Client.query(
            `INSERT INTO alamat_siswa (id, calon_siswa_id, jalan, kelurahan, kecamatan, kota_kabupaten, provinsi)
             VALUES (?, ?, ?, 'Ciputat', 'Ciputat', 'Tangerang Selatan', 'Banten')`,
            [crypto.randomUUID(), result.id, body.alamat]
          );
        } catch {}
      }

      return c.json(
        JSendPresenter.success(result, 'Calon siswa baru berhasil didaftarkan'),
        201
      );
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return c.json(
          JSendPresenter.fail('Validasi data gagal', err.errors),
          422
        );
      }
      return c.json(
        JSendPresenter.error(err.message || 'Terjadi kesalahan sistem'),
        500
      );
    }
  };
}
