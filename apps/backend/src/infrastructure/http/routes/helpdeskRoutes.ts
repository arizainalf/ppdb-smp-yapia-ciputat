import { Hono } from 'hono';
import crypto from 'node:crypto';
import { d1Client } from '../../database/d1Client.js';
import { JSendPresenter } from '../../../interface-adapters/presenters/JSendPresenter.js';
import type { HelpdeskTicketDTO, KategoriHelpdesk, StatusHelpdesk } from '@yapia/shared';

interface RawHelpdeskTicket {
  id: string;
  ticket_number: string;
  nama_pengirim: string;
  no_whatsapp: string;
  email: string | null;
  kategori: KategoriHelpdesk;
  subjek: string;
  pesan: string;
  status: StatusHelpdesk;
  tanggapan_panitia: string | null;
  ditanggapi_oleh: string | null;
  ditanggapi_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapToDTO(row: RawHelpdeskTicket): HelpdeskTicketDTO {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    namaPengirim: row.nama_pengirim,
    noWhatsapp: row.no_whatsapp,
    email: row.email || undefined,
    kategori: row.kategori,
    subjek: row.subjek,
    pesan: row.pesan,
    status: row.status,
    tanggapanPanitia: row.tanggapan_panitia || undefined,
    ditanggapiOleh: row.ditanggapi_oleh || undefined,
    ditanggapiAt: row.ditanggapi_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createHelpdeskRouter(): Hono {
  const router = new Hono();

  // 1. GET ALL TICKETS (Admin with filters)
  router.get('/tickets', async (c) => {
    try {
      const status = c.req.query('status');
      const kategori = c.req.query('kategori');
      const search = c.req.query('search');

      let sql = 'SELECT * FROM helpdesk_tickets WHERE 1=1';
      const params: unknown[] = [];

      if (status) {
        sql += ' AND status = ?';
        params.push(status);
      }

      if (kategori) {
        sql += ' AND kategori = ?';
        params.push(kategori);
      }

      if (search) {
        sql += ' AND (ticket_number LIKE ? OR nama_pengirim LIKE ? OR no_whatsapp LIKE ? OR subjek LIKE ?)';
        const term = `%${search}%`;
        params.push(term, term, term, term);
      }

      sql += ' ORDER BY created_at DESC';

      const res = await d1Client.query<RawHelpdeskTicket>(sql, params);
      const data = res.results.map(mapToDTO);

      return c.json(JSendPresenter.success(data, 'Daftar tiket helpdesk berhasil diambil'), 200);
    } catch (err: any) {
      console.error('Error fetching helpdesk tickets:', err);
      return c.json(JSendPresenter.error(err.message || 'Gagal mengambil data tiket helpdesk'), 500);
    }
  });

  // 2. CREATE NEW TICKET (Public for parents & visitors)
  router.post('/tickets', async (c) => {
    try {
      const body = await c.req.json();
      const { namaPengirim, noWhatsapp, email, kategori, subjek, pesan } = body;

      if (!namaPengirim?.trim() || !noWhatsapp?.trim() || !subjek?.trim() || !pesan?.trim()) {
        return c.json(
          JSendPresenter.fail('Nama pengirim, nomor WhatsApp, subjek, dan pesan wajib diisi'),
          400
        );
      }

      const id = crypto.randomUUID();

      // Hitung total tiket untuk format nomor unik: TKT-2026-XXXX
      const countRes = await d1Client.query<{ total: number }>(
        'SELECT COUNT(*) as total FROM helpdesk_tickets'
      );
      const nextNum = (countRes.results[0]?.total ?? 0) + 1;
      const ticketNumber = `TKT-2026-${String(nextNum).padStart(4, '0')}`;

      const nowIso = new Date().toISOString();

      await d1Client.query(
        `INSERT INTO helpdesk_tickets (
          id, ticket_number, nama_pengirim, no_whatsapp, email, kategori, subjek, pesan, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MENUNGGU_RESPON', ?, ?)`,
        [
          id,
          ticketNumber,
          namaPengirim.trim(),
          noWhatsapp.trim(),
          email?.trim() || null,
          kategori || 'INFO_PENDAFTARAN',
          subjek.trim(),
          pesan.trim(),
          nowIso,
          nowIso,
        ]
      );

      const createdTicket: HelpdeskTicketDTO = {
        id,
        ticketNumber,
        namaPengirim: namaPengirim.trim(),
        noWhatsapp: noWhatsapp.trim(),
        email: email?.trim(),
        kategori: kategori || 'INFO_PENDAFTARAN',
        subjek: subjek.trim(),
        pesan: pesan.trim(),
        status: 'MENUNGGU_RESPON',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      return c.json(
        JSendPresenter.success(
          createdTicket,
          `Tiket bantuan #${ticketNumber} berhasil dibuat. Panitia PPDB akan segera merespons.`
        ),
        201
      );
    } catch (err: any) {
      console.error('Error creating helpdesk ticket:', err);
      return c.json(JSendPresenter.error(err.message || 'Gagal membuat tiket bantuan'), 500);
    }
  });

  // 3. TRACK TICKET BY TICKET NUMBER OR WHATSAPP (Public)
  router.get('/track', async (c) => {
    try {
      const q = c.req.query('q')?.trim();
      if (!q) {
        return c.json(JSendPresenter.fail('Nomor tiket atau nomor WhatsApp wajib diisi'), 400);
      }

      const res = await d1Client.query<RawHelpdeskTicket>(
        `SELECT * FROM helpdesk_tickets 
         WHERE ticket_number = ? OR no_whatsapp = ? 
         ORDER BY created_at DESC`,
        [q.toUpperCase(), q]
      );

      const data = res.results.map(mapToDTO);
      return c.json(
        JSendPresenter.success(data, `Ditemukan ${data.length} riwayat tiket bantuan`),
        200
      );
    } catch (err: any) {
      console.error('Error tracking helpdesk ticket:', err);
      return c.json(JSendPresenter.error('Gagal melacak tiket bantuan'), 500);
    }
  });

  // 4. UPDATE TICKET RESPONSE & STATUS (Admin panitia)
  router.put('/tickets/:id', async (c) => {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      const { status, tanggapanPanitia, ditanggapiOleh } = body;

      const check = await d1Client.query<RawHelpdeskTicket>(
        'SELECT * FROM helpdesk_tickets WHERE id = ? LIMIT 1',
        [id]
      );

      if (!check.results || check.results.length === 0) {
        return c.json(JSendPresenter.fail('Tiket bantuan tidak ditemukan'), 404);
      }

      const existing = check.results[0];
      const newStatus = status || existing.status;
      const newTanggapan = tanggapanPanitia !== undefined ? tanggapanPanitia : existing.tanggapan_panitia;
      const responder = ditanggapiOleh || 'Panitia PPDB';
      const nowIso = new Date().toISOString();

      await d1Client.query(
        `UPDATE helpdesk_tickets SET
           status = ?,
           tanggapan_panitia = ?,
           ditanggapi_oleh = ?,
           ditanggapi_at = ?,
           updated_at = ?
         WHERE id = ?`,
        [newStatus, newTanggapan, responder, nowIso, nowIso, id]
      );

      const updated = await d1Client.query<RawHelpdeskTicket>(
        'SELECT * FROM helpdesk_tickets WHERE id = ? LIMIT 1',
        [id]
      );

      return c.json(
        JSendPresenter.success(
          mapToDTO(updated.results[0]),
          'Tiket bantuan berhasil ditanggapi dan diperbarui'
        ),
        200
      );
    } catch (err: any) {
      console.error('Error updating helpdesk ticket:', err);
      return c.json(JSendPresenter.error(err.message || 'Gagal memperbarui tiket bantuan'), 500);
    }
  });

  return router;
}
