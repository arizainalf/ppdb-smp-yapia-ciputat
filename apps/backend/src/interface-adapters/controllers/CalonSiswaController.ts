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
          sa.nisn,
          sa.nama_sekolah as sekolahAsal,
          sa.npsn as npsnAsal,
          al.kecamatan as kecamatanAsal,
          cs.jenis_kelamin as jenisKelamin,
          cs.tempat_lahir as tempatLahir,
          cs.tanggal_lahir as tanggalLahir,
          cs.agama as agama,
          al.jalan || ' RT ' || al.rt || '/RW ' || al.rw || ', ' || al.kelurahan || ', ' || al.kecamatan as alamat,
          otw.nama_lengkap as namaOrtu,
          COALESCE(otw.no_hp, cs.no_hp_siswa) as noHpOrtu,
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
          cs.catatan_wawancara as catatanWawancara,
          EXISTS(SELECT 1 FROM berkas_pendaftaran b WHERE b.calon_siswa_id = cs.id AND b.jenis_berkas = 'IJAZAH_SKL') as berkasIjazah,
          EXISTS(SELECT 1 FROM berkas_pendaftaran b WHERE b.calon_siswa_id = cs.id AND b.jenis_berkas = 'KARTU_KELUARGA') as berkasKk,
          EXISTS(SELECT 1 FROM berkas_pendaftaran b WHERE b.calon_siswa_id = cs.id AND b.jenis_berkas = 'AKTA_KELAHIRAN') as berkasAkta,
          EXISTS(SELECT 1 FROM berkas_pendaftaran b WHERE b.calon_siswa_id = cs.id AND b.jenis_berkas = 'FOTO') as berkasFoto,
          (SELECT status_pembayaran FROM pembayaran_pendaftaran WHERE calon_siswa_id = cs.id ORDER BY created_at DESC LIMIT 1) as statusPembayaran,
          (SELECT metode_pembayaran FROM pembayaran_pendaftaran WHERE calon_siswa_id = cs.id ORDER BY created_at DESC LIMIT 1) as metodePembayaran
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
        nisn: r.nisn || '-',
        sekolahAsal: r.sekolahAsal || '-',
        npsnAsal: r.npsnAsal || '-',
        kecamatanAsal: r.kecamatanAsal || '-',
        jenisKelamin: r.jenisKelamin,
        tempatLahir: r.tempatLahir,
        tanggalLahir: r.tanggalLahir,
        agama: r.agama,
        alamat: r.alamat || '-',
        namaOrtu: r.namaOrtu || '-',
        noHpOrtu: r.noHpOrtu || '-',
        gelombangId: r.gelombangId,
        status: r.status,
        tanggalDaftar: r.tanggalDaftar ? new Date(r.tanggalDaftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        jalurPendaftaran: r.jalurPendaftaran,
        nomorKipSktm: r.nomorKipSktm || '',
        pdpConsent: Boolean(r.pdpConsent),
        verifikasiFisik: {
          verified: Boolean(r.verifikasiFisikVerified),
          verifiedBy: r.verifikasiFisikBy || '',
          verifiedAt: r.verifikasiFisikAt || '',
          notes: r.verifikasiFisikNotes || '',
        },
        observasi: {
          ...(r.observasiQuran ? { kemampuanQuran: r.observasiQuran } : {}),
          catatanPendampingan: r.catatanPendampingan || '',
          catatanWawancara: r.catatanWawancara || '',
        },
        berkas: {
          ijazah: Boolean(r.berkasIjazah),
          kk: Boolean(r.berkasKk),
          akta: Boolean(r.berkasAkta),
          foto: Boolean(r.berkasFoto),
        },
        catatanPanitia: r.verifikasiFisikNotes || '',
        pembayaran: {
          status: r.statusPembayaran || 'UNPAID',
          metode: r.metodePembayaran || null,
        },
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

      // Pencocokan kondisional: hanya terapkan LIKE email/NISN/HP jika input
      // benar-benar berformat tersebut, agar input acak tidak cocok semua baris.
      const digits = q.replace(/[^0-9]/g, '');
      const conditions: string[] = ['cs.id = ?', 'UPPER(cs.nomor_pendaftaran) = UPPER(?)'];
      const params: any[] = [q, q];

      if (q.includes('@')) {
        conditions.push('LOWER(cs.email) = LOWER(?)');
        params.push(q.trim().toLowerCase());
      }
      if (/^[0-9]{10}$/.test(digits)) {
        conditions.push('sa.nisn = ?');
        params.push(digits);
      }
      if (digits.length >= 8) {
        const phonePart = `%${digits.slice(-8)}%`;
        conditions.push('cs.no_hp_siswa LIKE ?', 'otw.no_hp LIKE ?');
        params.push(phonePart, phonePart);
      }

      const whereSql = conditions.join('\n           OR ');
      const whereParams = params;

      const query = `
        SELECT
          cs.id,
          cs.nomor_pendaftaran as nomorPendaftaran,
          cs.nama_lengkap as namaLengkap,
          sa.nisn,
          sa.nama_sekolah as sekolahAsal,
          sa.npsn as npsnAsal,
          al.kecamatan as kecamatanAsal,
          cs.jenis_kelamin as jenisKelamin,
          cs.tempat_lahir as tempatLahir,
          cs.tanggal_lahir as tanggalLahir,
          cs.agama as agama,
          al.jalan || ' RT ' || al.rt || '/RW ' || al.rw || ', ' || al.kelurahan || ', ' || al.kecamatan as alamat,
          otw.nama_lengkap as namaOrtu,
          COALESCE(otw.no_hp, cs.no_hp_siswa) as noHpOrtu,
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
        WHERE ${whereSql}
        LIMIT 1
      `;

      const res = await d1Client.query<any>(query, whereParams);

      if (res.results.length === 0) {
        return c.json(JSendPresenter.fail('Data pendaftaran tidak ditemukan', { query: q }), 404);
      }

      const r = res.results[0];
      const data = {
        id: r.id,
        nomorPendaftaran: r.nomorPendaftaran,
        namaLengkap: r.namaLengkap,
        nisn: r.nisn || '-',
        sekolahAsal: r.sekolahAsal || '-',
        gelombang: r.gelombangId ? `Gelombang ${r.gelombangId} (T.A 2026/2027)` : '-',
        status: r.status,
        jalur: r.jalurPendaftaran === 'AFIRMASI' ? `AFIRMASI (KIP: ${r.nomorKipSktm || '-'})` : (r.jalurPendaftaran || '-'),
        tanggalDaftar: r.tanggalDaftar ? new Date(r.tanggalDaftar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-',
        verifikasiFisik: Boolean(r.verifikasiFisikVerified),
        observasiQuran: r.observasiQuran || '',
        rombel: '',
        catatanPanitia: r.verifikasiFisikNotes || 'Belum ada catatan panitia.',
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

      // ---- GATE PENDAFTARAN: pengaturan global + periode gelombang ----
      const { getPengaturanMap } = await import('../../infrastructure/http/routes/pengaturanRoutes.js');
      const pengaturan = await getPengaturanMap();
      if (pengaturan['pendaftaran_aktif'] !== '1') {
        return c.json(
          JSendPresenter.fail('Pendaftaran sedang ditutup oleh panitia. Silakan pantau pengumuman beranda.'),
          403
        );
      }

      const gelombangRes = await d1Client.query<any>(
        `SELECT id, is_active, tanggal_buka, tanggal_tutup FROM gelombang_pendaftaran WHERE id = ? LIMIT 1`,
        [body.gelombangId]
      );
      const g = gelombangRes.results[0];
      if (!g || g.is_active !== 1) {
        return c.json(JSendPresenter.fail('Gelombang pendaftaran tidak tersedia atau sudah ditutup.'), 403);
      }
      const today = new Date().toISOString().slice(0, 10);
      if (g.tanggal_buka && today < g.tanggal_buka) {
        return c.json(JSendPresenter.fail(`Pendaftaran gelombang ini belum dibuka (mulai ${g.tanggal_buka}).`), 403);
      }
      if (g.tanggal_tutup && today > g.tanggal_tutup) {
        return c.json(JSendPresenter.fail(`Pendaftaran gelombang ini sudah ditutup sejak ${g.tanggal_tutup}.`), 403);
      }
      // ------------------------------------------------------------------

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
              'AYAH',
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

      // Simpan alamat terstruktur (dipakai untuk menentukan kelayakan
      // Bantuan Biaya Pendidikan Pemkot Tangerang Selatan saat penagihan)
      if (body.alamat || body.kotaKabupaten) {
        try {
          await d1Client.query(
            `INSERT INTO alamat_siswa (
               id, calon_siswa_id, jalan, rt, rw, no_rumah,
               kelurahan, kecamatan, kota_kabupaten, provinsi, kode_pos, tinggal_bersama
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              crypto.randomUUID(),
              result.id,
              body.alamat || '-',
              body.rt || null,
              body.rw || null,
              body.noRumah || null,
              body.kelurahan || 'Ciputat',
              body.kecamatan || 'Ciputat',
              body.kotaKabupaten || 'Tangerang Selatan',
              body.provinsi || 'Banten',
              body.kodePos || null,
              body.tinggalBersama || 'Orang Tua',
            ]
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
