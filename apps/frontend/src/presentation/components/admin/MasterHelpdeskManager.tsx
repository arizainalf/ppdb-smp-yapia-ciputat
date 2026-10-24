import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Phone,
  Mail,
  Send,
  X,
  User,
  Filter,
  ExternalLink,
  Check,
  FileQuestion,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { useAuth } from '../../../application/contexts/AuthContext.js';
import type { HelpdeskTicketDTO, KategoriHelpdesk, StatusHelpdesk } from '@yapia/shared';

const KATEGORI_LABELS: Record<KategoriHelpdesk, string> = {
  INFO_PENDAFTARAN: 'Info & Alur Pendaftaran',
  SYARAT_BERKAS: 'Syarat & Verifikasi Berkas',
  BIAYA_INFAK: 'Biaya Formulir & Infak',
  JALUR_AFIRMASI_KIP: 'Jalur Afirmasi (KIP/PIP)',
  KENDALA_TEKNIS: 'Kendala Teknis Website',
  LAINNYA: 'Lainnya',
};

const TEMPLATE_REPLIES = [
  {
    label: 'Syarat Berkas Fisik',
    text: 'Waalaikumsalam wr wb / Selamat pagi. Untuk verifikasi berkas fisik, silakan membawa fotokopi KK, Akta Kelahiran, dan Surat Keterangan Siswa Aktif / Raport dari SD asal ke Ruang TU SMP YAPIA Ciputat pada hari kerja (08.00 - 14.00 WIB). Terima kasih.',
  },
  {
    label: 'Potongan Infak Gelombang 1',
    text: 'Halo Bpk/Ibu. Betul, calon siswa yang mendaftar dan melunasi formulir di Gelombang 1 berhak mendapatkan potongan infak pembangunan sebesar Rp 500.000. Untuk konfirmasi pembayaran dapat mengirim bukti transfer ke Bendahara PPDB. Terima kasih.',
  },
  {
    label: 'Jalur Afirmasi KIP / PIP',
    text: 'Waalaikumsalam wr wb. Calon siswa pemegang kartu KIP/PIP/SKTM dapat mendaftar melalui Jalur Afirmasi dengan melampirkan fotokopi kartu KIP yang dilegalisir kepala SD. Kuota afirmasi kami sediakan dengan kemudahan cicilan infak. Terima kasih.',
  },
];

export const MasterHelpdeskManager: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<HelpdeskTicketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusHelpdesk | 'ALL'>('ALL');
  const [kategoriFilter, setKategoriFilter] = useState<KategoriHelpdesk | 'ALL'>('ALL');

  // Selected Ticket & Drawer State
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicketDTO | null>(null);
  const [responseStatus, setResponseStatus] = useState<StatusHelpdesk>('SELESAI');
  const [responseTanggapan, setResponseTanggapan] = useState('');
  const [responseDitanggapiOleh, setResponseDitanggapiOleh] = useState(user?.name || 'Panitia PPDB');
  const [savingResponse, setSavingResponse] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/helpdesk/tickets');
      const json = await res.json();
      if (!res.ok || json.status === 'error') {
        throw new Error(json.message || 'Gagal memuat daftar tiket');
      }
      setTickets(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memuat data tiket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // When opening ticket drawer, populate fields
  const handleOpenTicket = (ticket: HelpdeskTicketDTO) => {
    setSelectedTicket(ticket);
    setResponseStatus(ticket.status === 'MENUNGGU_RESPON' ? 'SEDANG_DIPROSES' : ticket.status);
    setResponseTanggapan(ticket.tanggapanPanitia || '');
    setResponseDitanggapiOleh(ticket.ditanggapiOleh || user?.name || 'Panitia PPDB');
    setSaveSuccessMsg(null);
  };

  const handleSaveResponse = async () => {
    if (!selectedTicket) return;
    try {
      setSavingResponse(true);
      setSaveSuccessMsg(null);

      const res = await fetch(`/api/v1/helpdesk/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: responseStatus,
          tanggapanPanitia: responseTanggapan,
          ditanggapiOleh: responseDitanggapiOleh,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.status === 'error' || json.status === 'fail') {
        throw new Error(json.message || 'Gagal menyimpan tanggapan');
      }

      const updatedTicket: HelpdeskTicketDTO = json.data;
      setSelectedTicket(updatedTicket);
      setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
      setSaveSuccessMsg('Tanggapan dan status tiket berhasil disimpan.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setSavingResponse(false);
    }
  };

  const handleSendWhatsAppWeb = () => {
    if (!selectedTicket) return;
    // Format nomor HP ke 62xxxx
    let cleanPhone = selectedTicket.noWhatsapp.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const message = `*SMP YAPIA CIPUTAT - LAYANAN HELPDESK PPDB*\n\nYth. Bpk/Ibu ${selectedTicket.namaPengirim},\nMenindaklanjuti tiket bantuan #${selectedTicket.ticketNumber} perihal "${selectedTicket.subjek}":\n\n${responseTanggapan || 'Terima kasih telah menghubungi Panitia PPDB SMP YAPIA Ciputat. Pertanyaan Anda sedang kami proses.'}\n\nJika masih ada hal yang ingin dikonsultasikan, Bpk/Ibu dapat membalas pesan ini atau mengunjungi Sekretariat PPDB SMP YAPIA Ciputat pada jam kerja.\n\nHormat kami,\n*Panitia PPDB SMP YAPIA Ciputat*`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Metrics
  const totalCount = tickets.length;
  const menungguCount = tickets.filter((t) => t.status === 'MENUNGGU_RESPON').length;
  const prosesCount = tickets.filter((t) => t.status === 'SEDANG_DIPROSES').length;
  const selesaiCount = tickets.filter((t) => t.status === 'SELESAI').length;

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchKategori = kategoriFilter === 'ALL' || t.kategori === kategoriFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      t.ticketNumber.toLowerCase().includes(q) ||
      t.namaPengirim.toLowerCase().includes(q) ||
      t.noWhatsapp.includes(q) ||
      t.subjek.toLowerCase().includes(q) ||
      t.pesan.toLowerCase().includes(q);

    return matchStatus && matchKategori && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tiket Masuk</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{totalCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Headphones className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Menunggu Respon</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{menungguCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sky-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">Sedang Diproses</p>
            <h3 className="text-2xl sm:text-3xl font-black text-sky-600 mt-1">{prosesCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Selesai Ditangani</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{selesaiCount}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Toolbar & Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor tiket, nama wali, WhatsApp, atau kata kunci..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU_RESPON">Menunggu Respon ({menungguCount})</option>
              <option value="SEDANG_DIPROSES">Sedang Diproses ({prosesCount})</option>
              <option value="SELESAI">Selesai ({selesaiCount})</option>
            </select>

            <select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Kategori</option>
              {Object.entries(KATEGORI_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>

            <button
              onClick={fetchTickets}
              disabled={loading}
              title="Refresh Data"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4 sm:px-6">No. Tiket</th>
                <th className="py-3 px-4">Pengirim & Kontak</th>
                <th className="py-3 px-4">Kategori & Subjek</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4 sm:px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Memuat data tiket helpdesk...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileQuestion className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Tidak ada tiket bantuan yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const statusConfig = {
                    MENUNGGU_RESPON: {
                      badge: 'bg-amber-100 text-amber-800 border-amber-200',
                      label: 'Menunggu Respon',
                      dot: 'bg-amber-500',
                    },
                    SEDANG_DIPROSES: {
                      badge: 'bg-sky-100 text-sky-800 border-sky-200',
                      label: 'Sedang Diproses',
                      dot: 'bg-sky-500',
                    },
                    SELESAI: {
                      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                      label: 'Selesai',
                      dot: 'bg-emerald-500',
                    },
                  }[ticket.status];

                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => handleOpenTicket(ticket)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-800">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{ticket.namaPengirim}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono">{ticket.noWhatsapp}</span>
                          {ticket.email && <span className="text-slate-400">• {ticket.email}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {KATEGORI_LABELS[ticket.kategori]}
                        </span>
                        <p className="font-bold text-slate-800 text-xs mt-1 truncate">{ticket.subjek}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{ticket.pesan}</p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusConfig.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {ticket.createdAt}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTicket(ticket);
                          }}
                          className="text-[11px] py-1.5 px-3 border-emerald-600 text-emerald-800 font-bold hover:bg-emerald-50"
                        >
                          Tanggapi <ChevronRight className="w-3.5 h-3.5 ml-1 inline" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail & Response Drawer (Slide-Over from Right) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
            onClick={() => setSelectedTicket(null)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-4 sm:pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full transform transition ease-in-out duration-300 animate-in slide-in-from-right">
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 rounded-lg text-white font-mono font-bold text-xs tracking-wider">
                    {selectedTicket.ticketNumber}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Detail & Tanggapan Tiket Bantuan</h3>
                    <p className="text-xs text-slate-400">Diajukan pada: {selectedTicket.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendWhatsAppWeb}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Kirim pesan balasan via WhatsApp Web langsung ke pengirim"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Balas via WA
                  </button>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
                {saveSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {/* Sender Information Card */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Informasi Pengirim
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {KATEGORI_LABELS[selectedTicket.kategori]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Nama Pengirim:</span>
                      <strong className="text-slate-800 text-sm">{selectedTicket.namaPengirim}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">No. WhatsApp:</span>
                      <a
                        href={`https://wa.me/${selectedTicket.noWhatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 font-mono"
                      >
                        {selectedTicket.noWhatsapp} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {selectedTicket.email && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[11px]">Email:</span>
                        <span className="text-slate-700">{selectedTicket.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subjek & Pertanyaan Detail */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pertanyaan / Kendala Masuk
                  </span>
                  <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm">{selectedTicket.subjek}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.pesan}
                    </p>
                  </div>
                </div>

                {/* Form Tanggapan Panitia PPDB */}
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Formulir Tanggapan Panitia PPDB
                    </span>
                    <span className="text-xs text-slate-500">
                      Petugas: <strong>{responseDitanggapiOleh}</strong>
                    </span>
                  </div>

                  {/* Quick Reply Templates */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 block">Template Balasan Cepat:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {TEMPLATE_REPLIES.map((tpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setResponseTanggapan(tpl.text)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded-lg text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
                        >
                          + {tpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Tiket:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { val: 'MENUNGGU_RESPON', label: 'Menunggu Respon', color: 'amber' },
                          { val: 'SEDANG_DIPROSES', label: 'Sedang Diproses', color: 'sky' },
                          { val: 'SELESAI', label: 'Selesai Dijawab', color: 'emerald' },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setResponseStatus(item.val)}
                          className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                            responseStatus === item.val
                              ? item.val === 'SELESAI'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : item.val === 'SEDANG_DIPROSES'
                                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                : 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Response Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Isi Tanggapan Resmi Panitia:
                    </label>
                    <textarea
                      rows={5}
                      value={responseTanggapan}
                      onChange={(e) => setResponseTanggapan(e.target.value)}
                      placeholder="Ketik tanggapan resmi panitia yang akan dapat dibaca oleh pemohon di widget atau dikirim via WhatsApp..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed"
                    />
                  </div>

                  {/* Previous Response Timestamp if exists */}
                  {selectedTicket.ditanggapiAt && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>
                        Terakhir dijawab oleh: <strong>{selectedTicket.ditanggapiOleh}</strong>
                      </span>
                      <span>{selectedTicket.ditanggapiAt}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTicket(null)}
                  className="py-2.5 px-4 text-xs font-bold"
                >
                  Tutup
                </Button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendWhatsAppWeb}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4" /> Balas via WhatsApp
                  </button>
                  <Button
                    onClick={handleSaveResponse}
                    disabled={savingResponse}
                    className="py-2.5 px-5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold"
                  >
                    {savingResponse ? 'Menyimpan...' : 'Simpan Tanggapan'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
