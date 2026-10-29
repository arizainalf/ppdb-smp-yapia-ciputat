import { Hono } from 'hono';
import { Context } from 'hono';
import { d1Client } from '../../database/d1Client.js';
import { JSendPresenter } from '../../../interface-adapters/presenters/JSendPresenter.js';
import { STATUS_PEMBAYARAN, METODE_PEMBAYARAN, hitungBiayaPendaftaran, RincianBiayaPendaftaran } from '@yapia/shared';
import { requireAuth, requirePermission } from '../middlewares/authMiddleware.js';

// =====================================================================
// Konfigurasi Tripay & transfer manual (env: Cloudflare / process.env)
// =====================================================================
interface PaymentEnv {
  tripayBaseUrl: string;
  merchantCode: string;
  apiKey: string;
  privateKey: string;
  bank: { nama: string; nomor: string; atasNama: string };
}

function getEnv(c: Context, key: string): string | undefined {
  return ((c.env as any)?.[key] as string | undefined) || process.env?.[key];
}

function getPaymentEnv(c: Context): PaymentEnv {
  return {
    tripayBaseUrl: getEnv(c, 'TRIPAY_BASE_URL') || 'https://tripay.co.id/api-sandbox',
    merchantCode: getEnv(c, 'TRIPAY_MERCHANT_CODE') || '',
    apiKey: getEnv(c, 'TRIPAY_API_KEY') || '',
    privateKey: getEnv(c, 'TRIPAY_PRIVATE_KEY') || '',
    bank: {
      nama: getEnv(c, 'MANUAL_BANK_NAMA') || 'Bank Syariah Indonesia (BSI)',
      nomor: getEnv(c, 'MANUAL_BANK_NOMOR') || '7211 8922 13',
      atasNama: getEnv(c, 'MANUAL_BANK_ATAS_NAMA') || 'PANITIA PPDB SMP YAPIA CIPUTAT',
    },
  };
}

// HMAC-SHA256 hex (kompatibel Workers & Node 18+)
async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface CalonSiswaRow {
  id: string;
  nomorPendaftaran: string;
  namaLengkap: string;
  email: string | null;
  noHpSiswa: string | null;
  noHpOrtu: string | null;
  gelombangId: number;
  namaGelombang: string;
  /** Rincian biaya: normal - potongan gelombang - bantuan Pemkot Tangsel (domisili) */
  rincianBiaya: RincianBiayaPendaftaran;
}

async function findPendaftar(nomorPendaftaran: string): Promise<CalonSiswaRow | null> {
  const res = await d1Client.query<any>(
    `SELECT cs.id, cs.nomor_pendaftaran as nomorPendaftaran, cs.nama_lengkap as namaLengkap,
            cs.email, cs.no_hp_siswa as noHpSiswa, cs.gelombang_id as gelombangId,
            g.nama_gelombang as namaGelombang, g.biaya_pendaftaran as biayaNormal,
            g.potongan_biaya as potonganGelombang, al.kota_kabupaten as kotaKabupaten
     FROM calon_siswa cs
     LEFT JOIN gelombang_pendaftaran g ON g.id = cs.gelombang_id
     LEFT JOIN alamat_siswa al ON al.calon_siswa_id = cs.id
     WHERE UPPER(cs.nomor_pendaftaran) = UPPER(?)
     LIMIT 1`,
    [nomorPendaftaran]
  );
  const r = res.results[0];
  if (!r) return null;
  // Ambil no HP ortu dari tabel orang_tua_wali (fallback)
  let noHpOrtu: string | null = null;
  try {
    const otw = await d1Client.query<{ no_hp: string }>(
      'SELECT no_hp FROM orang_tua_wali WHERE calon_siswa_id = ? LIMIT 1',
      [r.id]
    );
    noHpOrtu = otw.results[0]?.no_hp || null;
  } catch {}
  const rincianBiaya = hitungBiayaPendaftaran(
    Number(r.biayaNormal) || 0,
    Number(r.potonganGelombang) || 0,
    r.kotaKabupaten || undefined
  );
  return { ...r, noHpOrtu, rincianBiaya };
}

interface PembayaranRow {
  id: string;
  calon_siswa_id: string;
  kode_transaksi: string;
  metode_pembayaran: string;
  status_pembayaran: string;
  jumlah_bayar: number;
  checkout_url: string | null;
  pay_code: string | null;
  expired_at: string | null;
  bukti_bayar_url: string | null;
  catatan: string | null;
}

function toPaymentInfo(row: PembayaranRow, bank?: PaymentEnv['bank']) {
  return {
    kodeTransaksi: row.kode_transaksi,
    metode: row.metode_pembayaran,
    status: row.status_pembayaran,
    jumlahBayar: row.jumlah_bayar,
    checkoutUrl: row.checkout_url,
    payCode: row.pay_code,
    expiredAt: row.expired_at,
    buktiBayarUrl: row.bukti_bayar_url,
    catatan: row.catatan,
    bank: row.metode_pembayaran === METODE_PEMBAYARAN.MANUAL ? bank : undefined,
  };
}

async function getPembayaranByPendaftar(calonSiswaId: string): Promise<PembayaranRow | null> {
  const res = await d1Client.query<PembayaranRow>(
    `SELECT * FROM pembayaran_pendaftaran WHERE calon_siswa_id = ?
     ORDER BY created_at DESC LIMIT 1`,
    [calonSiswaId]
  );
  return res.results[0] || null;
}

interface RekeningRow {
  id: string;
  nama_bank: string;
  nomor_rekening: string;
  atas_nama: string;
  is_active: number;
}

async function findRekening(rekeningId?: string): Promise<RekeningRow | null> {
  if (!rekeningId) return null;
  const res = await d1Client.query<RekeningRow>(
    'SELECT id, nama_bank, nomor_rekening, atas_nama, is_active FROM rekening_bank WHERE id = ? AND is_active = 1 LIMIT 1',
    [rekeningId]
  );
  return res.results[0] || null;
}

// =====================================================================
// Routes
// =====================================================================
export function createPembayaranRouter(): Hono {
  const router = new Hono();

  // ---------------------------------------------------------------
  // 1. BUAT TRANSAKSI PEMBAYARAN (TRIPAY / MANUAL)
  //    Tagihan = biaya gelombang - potongan gelombang - bantuan
  //    Pemkot Tangsel (otomatis bagi domisili Kota Tangerang Selatan).
  // ---------------------------------------------------------------
  router.post('/create', async (c) => {
    try {
      const { nomorPendaftaran, metode, rekeningId } = await c.req.json();

      if (!nomorPendaftaran || ![METODE_PEMBAYARAN.TRIPAY, METODE_PEMBAYARAN.MANUAL].includes(metode)) {
        return c.json(JSendPresenter.fail('nomorPendaftaran dan metode (TRIPAY/MANUAL) wajib diisi'), 400);
      }

      const pendaftar = await findPendaftar(nomorPendaftaran);
      if (!pendaftar) {
        return c.json(JSendPresenter.fail('Nomor pendaftaran tidak ditemukan'), 404);
      }

      const env = getPaymentEnv(c);
      const existing = await getPembayaranByPendaftar(pendaftar.id);

      // Sudah lunas — jangan buat transaksi baru
      if (existing?.status_pembayaran === STATUS_PEMBAYARAN.PAID) {
        return c.json(
          JSendPresenter.success({ ...toPaymentInfo(existing, env.bank), rincianBiaya: pendaftar.rincianBiaya }, 'Pembayaran sudah lunas'),
          200
        );
      }

      // Invoice Tripay aktif — pakai ulang
      if (
        metode === METODE_PEMBAYARAN.TRIPAY &&
        existing?.metode_pembayaran === METODE_PEMBAYARAN.TRIPAY &&
        existing.status_pembayaran === STATUS_PEMBAYARAN.PENDING &&
        existing.checkout_url
      ) {
        return c.json(
          JSendPresenter.success({ ...toPaymentInfo(existing, env.bank), rincianBiaya: pendaftar.rincianBiaya }, 'Invoice Tripay sudah tersedia'),
          200
        );
      }

      const kodeTransaksi = `PAY-${pendaftar.nomorPendaftaran}`;
      // Tagihan akhir = biaya normal - potongan gelombang - bantuan Pemkot Tangsel (jika domisili memenuhi syarat)
      const jumlah = pendaftar.rincianBiaya.biayaAkhir;

      if (metode === METODE_PEMBAYARAN.TRIPAY) {
        if (!env.merchantCode || !env.apiKey || !env.privateKey) {
          return c.json(
            JSendPresenter.error('Konfigurasi Tripay belum lengkap (TRIPAY_MERCHANT_CODE, TRIPAY_API_KEY, TRIPAY_PRIVATE_KEY)'),
            500
          );
        }

        const signature = await hmacSha256Hex(
          env.privateKey,
          `${env.merchantCode}${kodeTransaksi}${jumlah}`
        );

        const expiredTime = Math.floor(Date.now() / 1000) + 24 * 3600; // 24 jam
        const payload = {
          method: 'QRIS',
          merchant_ref: kodeTransaksi,
          amount: jumlah,
          customer_name: pendaftar.namaLengkap,
          customer_email: pendaftar.email || 'ppdb@smp-yapia.sch.id',
          customer_phone: pendaftar.noHpSiswa || pendaftar.noHpOrtu || '',
          order_items: [
            {
              sku: kodeTransaksi,
              name: `Biaya Administrasi PPDB ${pendaftar.namaGelombang || ''}`.trim(),
              price: jumlah,
              quantity: 1,
            },
          ],
          expired_time: expiredTime,
          signature,
        };

        const tripayRes = await fetch(`${env.tripayBaseUrl}/transaction/create`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const tripayJson: any = await tripayRes.json().catch(() => null);

        if (!tripayRes.ok || !tripayJson?.success) {
          return c.json(
            JSendPresenter.error(tripayJson?.message || `Tripay gagal membuat transaksi (HTTP ${tripayRes.status})`),
            502
          );
        }

        const d = tripayJson.data;
        const expiredAt = new Date((d.expired_time || expiredTime) * 1000).toISOString();

        const row: PembayaranRow = {
          id: crypto.randomUUID(),
          calon_siswa_id: pendaftar.id,
          kode_transaksi: kodeTransaksi,
          metode_pembayaran: METODE_PEMBAYARAN.TRIPAY,
          status_pembayaran: STATUS_PEMBAYARAN.PENDING,
          jumlah_bayar: jumlah,
          checkout_url: d.checkout_url || null,
          pay_code: d.pay_code || d.qr_url || null,
          expired_at: expiredAt,
          bukti_bayar_url: null,
          catatan: `Tripay ref: ${d.reference || '-'}`,
        };

        if (existing) {
          await d1Client.query(
            `UPDATE pembayaran_pendaftaran SET metode_pembayaran = ?, status_pembayaran = ?, jumlah_bayar = ?,
             checkout_url = ?, pay_code = ?, expired_at = ?, pay_reference = ?, catatan = ?
             WHERE id = ?`,
            [row.metode_pembayaran, row.status_pembayaran, row.jumlah_bayar, row.checkout_url, row.pay_code,
             row.expired_at, d.reference || null, row.catatan, existing.id]
          );
        } else {
          await d1Client.query(
            `INSERT INTO pembayaran_pendaftaran (id, calon_siswa_id, kode_transaksi, jumlah_bayar,
             metode_pembayaran, status_pembayaran, checkout_url, pay_code, expired_at, pay_reference, catatan)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [row.id, pendaftar.id, row.kode_transaksi, row.jumlah_bayar, row.metode_pembayaran,
             row.status_pembayaran, row.checkout_url, row.pay_code, row.expired_at, d.reference || null, row.catatan]
          );
        }

        return c.json(
          JSendPresenter.success(
            { ...toPaymentInfo(row, env.bank), tripayReference: d.reference, rincianBiaya: pendaftar.rincianBiaya },
            'Invoice Tripay berhasil dibuat'
          ),
          201
        );
      }

      // ---------- MANUAL TRANSFER ----------
      // Rekening tujuan dari master data rekening_bank (fallback: env)
      const rekening = await findRekening(rekeningId);
      const bankTujuan = rekening
        ? { nama: rekening.nama_bank, nomor: rekening.nomor_rekening, atasNama: rekening.atas_nama }
        : env.bank;

      const row: PembayaranRow = {
        id: existing?.id || crypto.randomUUID(),
        calon_siswa_id: pendaftar.id,
        kode_transaksi: kodeTransaksi,
        metode_pembayaran: METODE_PEMBAYARAN.MANUAL,
        status_pembayaran: STATUS_PEMBAYARAN.UNPAID,
        jumlah_bayar: jumlah,
        checkout_url: null,
        pay_code: null,
        expired_at: null,
        bukti_bayar_url: null,
        catatan: null,
      };

      if (existing) {
        await d1Client.query(
          `UPDATE pembayaran_pendaftaran SET metode_pembayaran = ?, status_pembayaran = ?, jumlah_bayar = ?, rekening_id = ?
           WHERE id = ?`,
          [row.metode_pembayaran, row.status_pembayaran, row.jumlah_bayar, rekening?.id || null, existing.id]
        );
      } else {
        await d1Client.query(
          `INSERT INTO pembayaran_pendaftaran (id, calon_siswa_id, kode_transaksi, jumlah_bayar,
           metode_pembayaran, status_pembayaran, rekening_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [row.id, pendaftar.id, row.kode_transaksi, row.jumlah_bayar, row.metode_pembayaran, row.status_pembayaran, rekening?.id || null]
        );
      }

      return c.json(
        JSendPresenter.success(
          { ...toPaymentInfo(row, bankTujuan), rincianBiaya: pendaftar.rincianBiaya },
          'Instruksi transfer manual berhasil dibuat'
        ),
        201
      );
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal membuat transaksi pembayaran'), 500);
    }
  });

  // ---------------------------------------------------------------
  // 2. STATUS PEMBAYARAN (untuk polling modal & halaman cek status)
  // ---------------------------------------------------------------
  router.get('/status/:nomorPendaftaran', async (c) => {
    try {
      const pendaftar = await findPendaftar(c.req.param('nomorPendaftaran'));
      if (!pendaftar) {
        return c.json(JSendPresenter.fail('Nomor pendaftaran tidak ditemukan'), 404);
      }
      const existing = await getPembayaranByPendaftar(pendaftar.id);
      if (!existing) {
        return c.json(JSendPresenter.fail('Belum ada transaksi pembayaran'), 404);
      }
      return c.json(
        JSendPresenter.success({ ...toPaymentInfo(existing, getPaymentEnv(c).bank), rincianBiaya: pendaftar.rincianBiaya }),
        200
      );
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal mengambil status pembayaran'), 500);
    }
  });

  // ---------------------------------------------------------------
  // 3. KONFIRMASI TRANSFER MANUAL (oleh pendaftar)
  //    Set status PENDING, menunggu verifikasi Bendahara.
  // ---------------------------------------------------------------
  router.post('/manual/konfirmasi', async (c) => {
    try {
      const { nomorPendaftaran, namaPengirim, buktiBayarUrl, rekeningId } = await c.req.json();
      if (!nomorPendaftaran || !namaPengirim) {
        return c.json(JSendPresenter.fail('nomorPendaftaran dan namaPengirim wajib diisi'), 400);
      }

      const pendaftar = await findPendaftar(nomorPendaftaran);
      if (!pendaftar) {
        return c.json(JSendPresenter.fail('Nomor pendaftaran tidak ditemukan'), 404);
      }
      const existing = await getPembayaranByPendaftar(pendaftar.id);
      if (!existing) {
        return c.json(JSendPresenter.fail('Belum ada transaksi pembayaran manual'), 404);
      }
      if (existing.status_pembayaran === STATUS_PEMBAYARAN.PAID) {
        return c.json(JSendPresenter.success(toPaymentInfo(existing), 'Pembayaran sudah lunas'), 200);
      }

      const rekening = await findRekening(rekeningId);

      await d1Client.query(
        `UPDATE pembayaran_pendaftaran SET status_pembayaran = ?, bukti_bayar_url = ?,
         catatan = ?, rekening_id = COALESCE(?, rekening_id) WHERE id = ?`,
        [STATUS_PEMBAYARAN.PENDING, buktiBayarUrl || null, `Konfirmasi manual oleh: ${namaPengirim}`, rekening?.id || null, existing.id]
      );

      return c.json(
        JSendPresenter.success(
          { ...toPaymentInfo(existing), status: STATUS_PEMBAYARAN.PENDING, buktiBayarUrl: buktiBayarUrl || null },
          'Konfirmasi terkirim. Menunggu verifikasi Bendahara (maks. 1x24 jam).'
        ),
        200
      );
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal mengonfirmasi pembayaran manual'), 500);
    }
  });

  // ---------------------------------------------------------------
  // 4. WEBHOOK CALLBACK TRIPAY
  //    Signature = HMAC-SHA256(raw body, privateKey). Daftarkan URL ini
  //    di dashboard Tripay (Settings > Callback URL).
  // ---------------------------------------------------------------
  router.post('/tripay/callback', async (c) => {
    try {
      const rawBody = await c.req.text();
      const json: any = JSON.parse(rawBody);
      const privateKey = getPaymentEnv(c).privateKey;

      if (!privateKey) {
        return c.json({ success: false, message: 'Private key Tripay belum dikonfigurasi' }, 500);
      }

      const expected = await hmacSha256Hex(privateKey, rawBody);
      if (json.signature !== expected) {
        return c.json({ success: false, message: 'Signature callback tidak valid' }, 401);
      }

      // Tripay mengirim merchant_ref = kode transaksi kita
      const kode = json.merchant_ref;
      const statusMap: Record<string, string> = {
        PAID: STATUS_PEMBAYARAN.PAID,
        EXPIRED: STATUS_PEMBAYARAN.EXPIRED,
        FAILED: STATUS_PEMBAYARAN.FAILED,
        UNPAID: STATUS_PEMBAYARAN.PENDING,
      };
      const newStatus = statusMap[json.status];
      if (!newStatus) {
        return c.json({ success: false, message: `Status tidak dikenal: ${json.status}` }, 400);
      }

      if (newStatus === STATUS_PEMBAYARAN.PAID) {
        await d1Client.query(
          `UPDATE pembayaran_pendaftaran SET status_pembayaran = ?, tanggal_bayar = ?
           WHERE kode_transaksi = ?`,
          [newStatus, new Date().toISOString(), kode]
        );
      } else {
        await d1Client.query(
          'UPDATE pembayaran_pendaftaran SET status_pembayaran = ? WHERE kode_transaksi = ?',
          [newStatus, kode]
        );
      }

      return c.json({ success: true });
    } catch (err: any) {
      return c.json({ success: false, message: err.message || 'Callback error' }, 500);
    }
  });

  // ---------------------------------------------------------------
  // 5. VERIFIKASI MANUAL (Bendahara / Admin)
  //    POST /:kodeTransaksi/verifikasi { status: 'PAID' | 'FAILED', actor }
  // ---------------------------------------------------------------
  router.post('/:kodeTransaksi/verifikasi', requireAuth(), requirePermission('VERIFY_PAYMENT'), async (c) => {
    try {
      const kode = c.req.param('kodeTransaksi');
      const body = await c.req.json();
      const status = body.status;
      // actor diambil dari klaim JWT (bukan dari body)
      const actor = ((c.get as (k: string) => unknown)('userName') as string) || 'Bendahara PPDB';

      if (![STATUS_PEMBAYARAN.PAID, STATUS_PEMBAYARAN.FAILED].includes(status)) {
        return c.json(JSendPresenter.fail("status harus 'PAID' atau 'FAILED'"), 400);
      }

      const res = await d1Client.query<PembayaranRow>(
        'SELECT * FROM pembayaran_pendaftaran WHERE kode_transaksi = ? LIMIT 1',
        [kode]
      );
      const existing = res.results[0];
      if (!existing) {
        return c.json(JSendPresenter.fail('Transaksi tidak ditemukan'), 404);
      }

      const isActorUserId =
        typeof actor === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(actor);
      const verifikatorId = isActorUserId ? actor : null;
      const catatanVerifikasi = isActorUserId ? existing.catatan : `Diverifikasi: ${actor || 'Bendahara PPDB'}`;

      await d1Client.query(
        `UPDATE pembayaran_pendaftaran SET status_pembayaran = ?, tanggal_bayar = ?, diverifikasi_oleh = ?, catatan = ?
         WHERE id = ?`,
        [status, status === STATUS_PEMBAYARAN.PAID ? new Date().toISOString() : null, verifikatorId, catatanVerifikasi, existing.id]
      );

      // Catat log audit
      try {
        await d1Client.query(
          'INSERT INTO audit_logs (id, calon_siswa_id, actor_id, action, details) VALUES (?, ?, ?, ?, ?)',
          [crypto.randomUUID(), existing.calon_siswa_id, verifikatorId, 'VERIFY_PAYMENT', `Pembayaran ${kode} diverifikasi: ${status}`]
        );
      } catch {}

      return c.json(JSendPresenter.success(null, `Pembayaran ${kode} diverifikasi: ${status}`), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal memverifikasi pembayaran'), 500);
    }
  });

  // ---------------------------------------------------------------
  // 6. MASTER DATA REKENING BANK
  //    GET  /rekening          — publik (hanya rekening aktif)
  //    POST /rekening          — admin (MANAGE_MASTER_DATA)
  //    PUT  /rekening/:id      — admin
  //    DELETE /rekening/:id    — admin (hapus permanen)
  // ---------------------------------------------------------------
  router.get('/rekening', async (c) => {
    try {
      const includeInactive = c.req.query('all') === '1';
      const res = includeInactive
        ? await d1Client.query<RekeningRow>('SELECT * FROM rekening_bank ORDER BY created_at ASC')
        : await d1Client.query<RekeningRow>('SELECT * FROM rekening_bank WHERE is_active = 1 ORDER BY created_at ASC');

      const items = res.results.map((r) => ({
        id: r.id,
        namaBank: r.nama_bank,
        nomorRekening: r.nomor_rekening,
        atasNama: r.atas_nama,
        isActive: Boolean(r.is_active),
      }));

      return c.json(JSendPresenter.success(items), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal mengambil data rekening'), 500);
    }
  });

  router.post('/rekening', requireAuth(), requirePermission('MANAGE_MASTER_DATA'), async (c) => {
    try {
      const { namaBank, nomorRekening, atasNama, isActive } = await c.req.json();
      if (!namaBank || !nomorRekening || !atasNama) {
        return c.json(JSendPresenter.fail('namaBank, nomorRekening, dan atasNama wajib diisi'), 400);
      }

      const id = crypto.randomUUID();
      await d1Client.query(
        `INSERT INTO rekening_bank (id, nama_bank, nomor_rekening, atas_nama, is_active) VALUES (?, ?, ?, ?, ?)`,
        [id, namaBank, nomorRekening, atasNama, isActive === false ? 0 : 1]
      );

      return c.json(JSendPresenter.success({ id }, 'Rekening bank berhasil ditambahkan'), 201);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal menambah rekening bank'), 500);
    }
  });

  router.put('/rekening/:id', requireAuth(), requirePermission('MANAGE_MASTER_DATA'), async (c) => {
    try {
      const id = c.req.param('id');
      const { namaBank, nomorRekening, atasNama, isActive } = await c.req.json();

      await d1Client.query(
        `UPDATE rekening_bank SET nama_bank = ?, nomor_rekening = ?, atas_nama = ?, is_active = ? WHERE id = ?`,
        [namaBank, nomorRekening, atasNama, isActive ? 1 : 0, id]
      );

      return c.json(JSendPresenter.success(null, 'Data rekening bank berhasil diperbarui'), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal memperbarui rekening bank'), 500);
    }
  });

  router.delete('/rekening/:id', requireAuth(), requirePermission('MANAGE_MASTER_DATA'), async (c) => {
    try {
      const id = c.req.param('id');
      await d1Client.query('DELETE FROM rekening_bank WHERE id = ?', [id]);
      return c.json(JSendPresenter.success(null, 'Rekening bank berhasil dihapus'), 200);
    } catch (err: any) {
      return c.json(JSendPresenter.error(err.message || 'Gagal menghapus rekening bank'), 500);
    }
  });

  return router;
}
