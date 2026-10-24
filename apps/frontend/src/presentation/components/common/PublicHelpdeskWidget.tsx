import React, { useState } from 'react';
import {
  Headphones,
  X,
  MessageSquare,
  HelpCircle,
  FileQuestion,
  Search,
  Send,
  PhoneCall,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import type { HelpdeskTicketDTO, KategoriHelpdesk } from '@yapia/shared';

const FAQ_LIST = [
  {
    q: 'Kapan pendaftaran Gelombang 1 dibuka dan ditutup?',
    a: 'Pendaftaran PPDB Gelombang 1 dibuka mulai 1 Oktober hingga 31 Desember 2026. Peserta yang mendaftar pada Gelombang 1 mendapatkan keuntungan potongan biaya infak pengembangan gedung sebesar Rp 500.000.',
    category: 'Jadwal & Gelombang',
  },
  {
    q: 'Berapa rincian biaya formulir dan infak masuk?',
    a: 'Biaya pembelian formulir pendaftaran adalah Rp 150.000. Untuk rincian infak bangunan, seragam 5 stel, modul pembelajaran, dan SPP bulan pertama dapat dilihat pada brosur resmi atau ditanyakan langsung ke Bendahara PPDB.',
    category: 'Biaya & Infak',
  },
  {
    q: 'Bagaimana jika Surat Keterangan Lulus (SKL) belum terbit dari SD?',
    a: 'Calon siswa tetap dapat mendaftar secara online dengan melampirkan Surat Keterangan Siswa Aktif Kelas 6 atau fotokopi Rapor semester ganjil. SKL asli dapat disusulkan saat verifikasi berkas fisik sebelum MPLS.',
    category: 'Syarat Berkas',
  },
  {
    q: 'Apakah ada jalur beasiswa atau afirmasi pemegang KIP/PIP/SKTM?',
    a: 'Ya, SMP YAPIA Ciputat menyediakan Jalur Afirmasi dengan kuota khusus bagi calon siswa pemegang KIP (Kartu Indonesia Pintar), PKH, atau SKTM dari kelurahan dengan potongan infak khusus dan kemudahan cicilan.',
    category: 'Jalur Afirmasi',
  },
  {
    q: 'Berkas fisik apa saja yang harus dibawa saat verifikasi di sekolah?',
    a: 'Berkas yang wajib dibawa: Fotokopi KK, Fotokopi Akta Kelahiran, Fotokopi KTP Orang Tua, Pasfoto 3x4 (3 lembar), Fotokopi KIP/SKTM (jika jalur afirmasi), serta membawa dokumen asli untuk pencocokan.',
    category: 'Syarat Berkas',
  },
  {
    q: 'Bagaimana alur seleksi observasi Al-Qur’an (BTQ)?',
    a: 'Observasi Al-Qur’an bukan untuk menggugurkan, melainkan untuk pemetaan kemampuan membaca (Iqra dasar, juz amma, tartil, atau tahfidz) agar siswa dapat ditempatkan dalam kelas pendampingan intensif yang sesuai.',
    category: 'Alur Seleksi',
  },
];

const CONTACT_HOTLINES = [
  {
    role: 'Panitia Admisi & Pendaftaran',
    name: 'Bpk. Ridwan Fauzi',
    phone: '6281298765432',
    displayPhone: '0812-9876-5432',
    desc: 'Informasi formulir, alur seleksi, dan status kelulusan',
    badge: 'Fast Response',
  },
  {
    role: 'Bendahara PPDB & Keuangan',
    name: 'Ibu Hj. Siti Masitoh',
    phone: '6281311223344',
    displayPhone: '0813-1122-3344',
    desc: 'Konfirmasi transfer biaya formulir, seragam, dan infak',
    badge: 'Jam Kerja',
  },
  {
    role: 'Waka Kesiswaan & Verifikasi',
    name: 'Ust. Ahmad Dahlan, S.Pd.I',
    phone: '6285712345678',
    displayPhone: '0857-1234-5678',
    desc: 'Konsultasi berkas fisik, jalur afirmasi KIP, dan tes BTQ',
    badge: 'Konsultasi Khusus',
  },
];

const KATEGORI_LABELS: Record<KategoriHelpdesk, string> = {
  INFO_PENDAFTARAN: 'Info & Alur Pendaftaran',
  SYARAT_BERKAS: 'Syarat & Verifikasi Berkas',
  BIAYA_INFAK: 'Biaya Formulir & Infak',
  JALUR_AFIRMASI_KIP: 'Jalur Afirmasi (KIP / PIP / SKTM)',
  KENDALA_TEKNIS: 'Kendala Teknis Website',
  LAINNYA: 'Lainnya',
};

export const PublicHelpdeskWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'hotline' | 'faq' | 'ticket'>('hotline');
  const [ticketSubTab, setTicketSubTab] = useState<'create' | 'track'>('create');

  // FAQ Search & Accordion
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Ticket Form States
  const [ticketForm, setTicketForm] = useState<{
    namaPengirim: string;
    noWhatsapp: string;
    email: string;
    kategori: KategoriHelpdesk;
    subjek: string;
    pesan: string;
  }>({
    namaPengirim: '',
    noWhatsapp: '',
    email: '',
    kategori: 'INFO_PENDAFTARAN',
    subjek: '',
    pesan: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<HelpdeskTicketDTO | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Tracking States
  const [trackQuery, setTrackQuery] = useState('');
  const [tracking, setTracking] = useState(false);
  const [trackResults, setTrackResults] = useState<HelpdeskTicketDTO[] | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  const filteredFaqs = FAQ_LIST.filter(
    (faq) =>
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError(null);

    if (!ticketForm.namaPengirim.trim() || !ticketForm.noWhatsapp.trim() || !ticketForm.pesan.trim()) {
      setTicketError('Nama, nomor WhatsApp aktif, dan pesan wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/helpdesk/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm),
      });

      const json = await res.json();
      if (!res.ok || json.status === 'error' || json.status === 'fail') {
        throw new Error(json.message || 'Gagal mengirim tiket bantuan');
      }

      setTicketSuccess(json.data);
      setTicketForm({
        namaPengirim: '',
        noWhatsapp: '',
        email: '',
        kategori: 'INFO_PENDAFTARAN',
        subjek: '',
        pesan: '',
      });
    } catch (err: any) {
      setTicketError(err.message || 'Terjadi kesalahan saat membuat tiket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackTicket = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery !== undefined ? customQuery : trackQuery;

    if (!query.trim()) {
      setTrackError('Masukkan nomor tiket (contoh: TKT-2026-0001) atau nomor WhatsApp Anda.');
      return;
    }

    try {
      setTracking(true);
      setTrackError(null);
      const res = await fetch(`/api/v1/helpdesk/track?q=${encodeURIComponent(query.trim())}`);
      const json = await res.json();

      if (!res.ok || json.status === 'error' || json.status === 'fail') {
        throw new Error(json.message || 'Tiket tidak ditemukan');
      }

      setTrackResults(json.data || []);
      if (json.data?.length === 0) {
        setTrackError('Tidak ditemukan tiket dengan nomor atau kontak tersebut.');
      }
    } catch (err: any) {
      setTrackError(err.message || 'Gagal melacak tiket');
      setTrackResults(null);
    } finally {
      setTracking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 bg-emerald-700 hover:bg-emerald-800 text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-emerald-500/30"
            title="Buka Pusat Bantuan & Layanan Tanya Panitia"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <Headphones className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 absolute top-0 right-0 border-2 border-emerald-800 animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-emerald-100 uppercase tracking-wider">Pusat Bantuan</p>
              <p className="text-sm font-bold leading-tight">Tanya Panitia PPDB</p>
            </div>
          </button>
        ) : null}
      </div>

      {/* Helpdesk Modal / Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 shrink-0 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Headphones className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Helpdesk & Layanan PPDB</h3>
                  <p className="text-xs text-emerald-100">SMP YAPIA Ciputat TA 2026/2027</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Tutup Panel Bantuan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-black/20 p-1 rounded-xl mt-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('hotline')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'hotline'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" /> Hotline WA
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'faq'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" /> FAQ Cepat
              </button>
              <button
                onClick={() => setActiveTab('ticket')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'ticket'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                <FileQuestion className="w-3.5 h-3.5" /> Tiket Bantuan
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-700 max-h-[58vh]">
            {/* TAB 1: HOTLINE WHATSAPP */}
            {activeTab === 'hotline' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900">Jam Operasional Layanan</p>
                    <p className="text-emerald-700">Senin - Sabtu: 08:00 - 15:00 WIB</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {CONTACT_HOTLINES.map((hotline, idx) => {
                    const waText = encodeURIComponent(
                      `Halo Panitia PPDB SMP YAPIA Ciputat (${hotline.role}), saya ingin menanyakan informasi terkait pendaftaran calon siswa.`
                    );
                    const waUrl = `https://wa.me/${hotline.phone}?text=${waText}`;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              {hotline.role}
                            </span>
                            <h4 className="font-bold text-slate-800 text-sm mt-1">{hotline.name}</h4>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full shrink-0">
                            {hotline.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 leading-relaxed">{hotline.desc}</p>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Chat via WhatsApp ({hotline.displayPhone})
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE SEARCHABLE FAQ */}
            {activeTab === 'faq' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Cari pertanyaan (cth: SKL, infak, berkas)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  {faqSearch && (
                    <button
                      onClick={() => setFaqSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* FAQ Accordion List */}
                <div className="space-y-2">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, idx) => {
                      const isExpanded = expandedFaqIndex === idx;
                      return (
                        <div
                          key={idx}
                          className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white"
                        >
                          <button
                            onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                            className="w-full text-left p-3 flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <span className="font-bold text-xs text-slate-800 leading-snug">{faq.q}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="p-3 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                              {faq.a}
                              <div className="mt-2 text-[10px] text-emerald-700 font-semibold uppercase">
                                Kategori: {faq.category}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500">
                      Tidak ada pertanyaan yang sesuai dengan "{faqSearch}".
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            setActiveTab('ticket');
                            setTicketSubTab('create');
                          }}
                          className="text-emerald-700 font-bold underline cursor-pointer"
                        >
                          Ajukan pertanyaan melalui Tiket Bantuan →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: TIKET BANTUAN & LACAK */}
            {activeTab === 'ticket' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {/* Sub-tab Switcher */}
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => {
                      setTicketSubTab('create');
                      setTicketSuccess(null);
                    }}
                    className={`flex-1 pb-2 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                      ticketSubTab === 'create'
                        ? 'border-emerald-600 text-emerald-800'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Kirim Pertanyaan
                  </button>
                  <button
                    onClick={() => setTicketSubTab('track')}
                    className={`flex-1 pb-2 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                      ticketSubTab === 'track'
                        ? 'border-emerald-600 text-emerald-800'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Lacak Status Tiket
                  </button>
                </div>

                {/* Sub-view: CREATE TICKET */}
                {ticketSubTab === 'create' && (
                  <div>
                    {ticketSuccess ? (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">Tiket Berhasil Terkirim!</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Panitia PPDB SMP YAPIA Ciputat akan segera meninjau dan merespons pertanyaan Anda.
                          </p>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                          <div className="text-left">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                              Nomor Tiket Anda
                            </span>
                            <p className="text-base font-black text-emerald-800 font-mono">
                              {ticketSuccess.ticketNumber}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(ticketSuccess.ticketNumber)}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-xs font-bold"
                            title="Salin Nomor Tiket"
                          >
                            {copiedTicket ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Salin
                              </>
                            )}
                          </button>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              setTicketSubTab('track');
                              setTrackQuery(ticketSuccess.ticketNumber);
                              handleTrackTicket(undefined, ticketSuccess.ticketNumber);
                            }}
                            className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Pantau Respon Tiket Ini
                          </button>
                          <button
                            onClick={() => setTicketSuccess(null)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Kirim Lagi
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleCreateTicket} className="space-y-3">
                        {ticketError && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{ticketError}</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Nama Lengkap Pengirim <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Bpk. Bambang / Siti"
                            value={ticketForm.namaPengirim}
                            onChange={(e) => setTicketForm({ ...ticketForm, namaPengirim: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              No. WhatsApp <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="0812xxxxxxxx"
                              value={ticketForm.noWhatsapp}
                              onChange={(e) => setTicketForm({ ...ticketForm, noWhatsapp: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Email (Opsional)</label>
                            <input
                              type="email"
                              placeholder="nama@email.com"
                              value={ticketForm.email}
                              onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori Pertanyaan</label>
                          <select
                            value={ticketForm.kategori}
                            onChange={(e) =>
                              setTicketForm({ ...ticketForm, kategori: e.target.value as KategoriHelpdesk })
                            }
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          >
                            {Object.entries(KATEGORI_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Subjek Singkat <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Konfirmasi Jadwal Verifikasi Fisik"
                            value={ticketForm.subjek}
                            onChange={(e) => setTicketForm({ ...ticketForm, subjek: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Pesan / Pertanyaan Detail <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Tuliskan kendala atau pertanyaan Anda secara rinci..."
                            value={ticketForm.pesan}
                            onChange={(e) => setTicketForm({ ...ticketForm, pesan: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {submitting ? (
                            'Mengirim Tiket...'
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Kirim Tiket ke Panitia PPDB
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Sub-view: TRACK TICKET */}
                {ticketSubTab === 'track' && (
                  <div className="space-y-3">
                    <form onSubmit={(e) => handleTrackTicket(e)} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nomor tiket (TKT-2026-XXXX) / No. WA..."
                          value={trackQuery}
                          onChange={(e) => setTrackQuery(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                        />
                        <button
                          type="submit"
                          disabled={tracking}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                          {tracking ? 'Mencari...' : 'Lacak'}
                        </button>
                      </div>
                    </form>

                    {trackError && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{trackError}</span>
                      </div>
                    )}

                    {trackResults && trackResults.length > 0 && (
                      <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                        <p className="text-[11px] text-slate-500 font-semibold">
                          Ditemukan {trackResults.length} riwayat tiket:
                        </p>
                        {trackResults.map((tkt) => {
                          const statusBg =
                            tkt.status === 'SELESAI'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : tkt.status === 'SEDANG_DIPROSES'
                              ? 'bg-sky-100 text-sky-800 border-sky-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200';

                          const statusLabel =
                            tkt.status === 'SELESAI'
                              ? 'Selesai Dijawab'
                              : tkt.status === 'SEDANG_DIPROSES'
                              ? 'Sedang Ditinjau'
                              : 'Menunggu Respon';

                          return (
                            <div
                              key={tkt.id}
                              className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-slate-800">{tkt.ticketNumber}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBg}`}
                                >
                                  {statusLabel}
                                </span>
                              </div>

                              <div>
                                <p className="font-bold text-slate-800">{tkt.subjek}</p>
                                <p className="text-slate-600 mt-1 text-[11px] leading-relaxed bg-white p-2 rounded-lg border border-slate-100">
                                  {tkt.pesan}
                                </p>
                              </div>

                              {tkt.tanggapanPanitia ? (
                                <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 mt-2 space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold">
                                    <span>Tanggapan Resmi Panitia:</span>
                                    <span>{tkt.ditanggapiOleh || 'Panitia PPDB'}</span>
                                  </div>
                                  <p className="text-slate-800 text-xs leading-relaxed">
                                    {tkt.tanggapanPanitia}
                                  </p>
                                </div>
                              ) : (
                                <div className="text-[11px] text-amber-700 italic flex items-center gap-1.5 mt-1">
                                  <Clock className="w-3.5 h-3.5" /> Menunggu tanggapan dari panitia PPDB.
                                </div>
                              )}

                              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 flex justify-between">
                                <span>Diajukan: {tkt.createdAt}</span>
                                <span>{KATEGORI_LABELS[tkt.kategori]}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
            SMP YAPIA Ciputat • Jl. KH. Dewantara No. 45, Ciputat
          </div>
        </div>
      )}
    </>
  );
};
