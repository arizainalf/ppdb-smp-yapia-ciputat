import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Landmark,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  Wallet,
  Clock,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { apiClient, ApiResponse } from '../../../infrastructure/api/apiClient.js';
import { paymentService, PaymentInfo, RekeningBank } from '../../../infrastructure/api/paymentService.js';
import { METODE_PEMBAYARAN, STATUS_PEMBAYARAN } from '@yapia/shared';

interface GelombangItem {
  id: number;
  biayaPendaftaran: number;
}

interface PaymentModalProps {
  nomorPendaftaran: string;
  gelombangId: number;
  onDone: () => void;
}

type View = 'choose' | 'tripay' | 'manual' | 'done';

const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export const PaymentModal: React.FC<PaymentModalProps> = ({
  nomorPendaftaran,
  gelombangId,
  onDone,
}) => {
  const [view, setView] = useState<View>('choose');
  const [amount, setAmount] = useState<number>(0);
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState<string>(''); // 'tripay' | 'manual-create' | 'manual-confirm' | 'check'
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [namaPengirim, setNamaPengirim] = useState('');
  const [buktiUrl, setBuktiUrl] = useState('');
  const [rekeningList, setRekeningList] = useState<RekeningBank[]>([]);
  const [selectedRekeningId, setSelectedRekeningId] = useState('');

  // Harga mengikuti biaya_pendaftaran gelombang pendaftar
  useEffect(() => {
    apiClient
      .get<GelombangItem[]>('/api/v1/gelombang')
      .then((res: ApiResponse<GelombangItem[]>) => {
        const g = res.data?.find((x) => x.id === gelombangId);
        if (g) setAmount(g.biayaPendaftaran);
      })
      .catch(() => {});
    // Daftar rekening bank tujuan transfer manual (master data)
    paymentService
      .listRekening()
      .then((res) => {
        const list = res.data || [];
        setRekeningList(list);
        if (list.length > 0) setSelectedRekeningId(list[0].id);
      })
      .catch(() => {});
  }, [gelombangId]);

  const handleCreateTripay = async () => {
    setLoading('tripay');
    setError('');
    try {
      const res = await paymentService.create(nomorPendaftaran, METODE_PEMBAYARAN.TRIPAY);
      setInfo(res.data);
      setAmount(res.data.jumlahBayar || amount);
      setView('tripay');
    } catch (e: any) {
      setError(e.message || 'Gagal membuat invoice Tripay');
    } finally {
      setLoading('');
    }
  };

  const handleCreateManual = async (rekeningId?: string) => {
    setLoading('manual-create');
    setError('');
    try {
      const res = await paymentService.create(nomorPendaftaran, METODE_PEMBAYARAN.MANUAL, rekeningId);
      setInfo(res.data);
      setAmount(res.data.jumlahBayar || amount);
      if (rekeningId) setSelectedRekeningId(rekeningId);
      setView('manual');
    } catch (e: any) {
      setError(e.message || 'Gagal membuat instruksi transfer');
    } finally {
      setLoading('');
    }
  };

  const handleCheckTripayStatus = async () => {
    setLoading('check');
    setError('');
    try {
      const res = await paymentService.getStatus(nomorPendaftaran);
      if (res.data.status === STATUS_PEMBAYARAN.PAID) {
        setInfo(res.data);
        setView('done');
      } else {
        setError(
          res.data.status === STATUS_PEMBAYARAN.PENDING
            ? 'Pembayaran belum terkonfirmasi. Selesaikan pembayaran, lalu cek lagi dalam beberapa menit.'
            : `Status pembayaran: ${res.data.status}`
        );
      }
    } catch (e: any) {
      setError(e.message || 'Gagal mengecek status pembayaran');
    } finally {
      setLoading('');
    }
  };

  const handleKonfirmasiManual = async () => {
    if (!namaPengirim.trim()) {
      setError('Nama pengirim wajib diisi');
      return;
    }
    setLoading('manual-confirm');
    setError('');
    try {
      await paymentService.konfirmasiManual(nomorPendaftaran, namaPengirim.trim(), buktiUrl.trim(), selectedRekeningId || undefined);
      setView('done');
    } catch (e: any) {
      setError(e.message || 'Gagal mengirim konfirmasi');
    } finally {
      setLoading('');
    }
  };

  const copyRekening = () => {
    if (info?.bank) {
      navigator.clipboard?.writeText(info.bank.nomor.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-300" />
            <h3 className="font-extrabold text-base tracking-tight">Pembayaran Administrasi</h3>
          </div>
          <button
            onClick={onDone}
            className="p-1 hover:bg-emerald-600 rounded-lg transition-colors text-emerald-100 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Nomor registrasi + nominal */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
              Nomor Registrasi
            </p>
            <p className="text-lg font-black text-emerald-900 font-mono">{nomorPendaftaran}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {amount ? formatRupiah(amount) : 'Memuat nominal...'}
            </p>
            <p className="text-[11px] text-emerald-700">Sesuai tarif Biaya Formulir gelombang pilihan Anda</p>
          </div>

          {/* PILIH METODE */}
          {view === 'choose' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pilih Metode Pembayaran</p>

              <button
                onClick={handleCreateTripay}
                disabled={loading !== ''}
                className="w-full text-left p-4 rounded-xl border-2 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all group disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {loading === 'tripay' ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">Bayar Online via Tripay</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      QRIS, e-wallet, atau Virtual Account. Konfirmasi otomatis & instan.
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      REKOMENDASI
                    </span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleCreateManual()}
                disabled={loading !== ''}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                    {loading === 'manual-create' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Landmark className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">Transfer Bank Manual</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Transfer ke rekening panitia, lalu konfirmasi. Diverifikasi Bendahara maks. 1x24 jam.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={onDone}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 py-1 transition-colors cursor-pointer"
              >
                Lewati dulu, bayar nanti &rarr;
              </button>
            </div>
          )}

          {/* TRIPAY INVOICE */}
          {view === 'tripay' && info && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Metode</span>
                  <span className="font-bold text-emerald-800">QRIS (Tripay)</span>
                </div>
                {info.payCode && (
                  <div className="flex justify-between items-center gap-2 text-xs">
                    <span className="text-slate-500">Kode Bayar</span>
                    <span className="font-mono font-bold text-slate-800 break-all text-right">{info.payCode}</span>
                  </div>
                )}
                {info.expiredAt && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Berlaku hingga</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {new Date(info.expiredAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>

              {info.checkoutUrl && (
                <a href={info.checkoutUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full py-3 font-bold">
                    Buka Halaman Pembayaran <ExternalLink className="w-4 h-4 ml-1" />
                  </Button>
                </a>
              )}

              <Button variant="outline" onClick={handleCheckTripayStatus} disabled={loading !== ''} className="w-full">
                {loading === 'check' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Saya Sudah Bayar — Cek Status
              </Button>
            </div>
          )}

          {/* MANUAL TRANSFER */}
          {view === 'manual' && info?.bank && (
            <div className="space-y-4">
              {/* Pilihan rekening tujuan (master data) */}
              {rekeningList.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pilih Rekening Tujuan</p>
                  <div className="space-y-2">
                    {rekeningList.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          if (r.id !== selectedRekeningId) handleCreateManual(r.id);
                        }}
                        disabled={loading !== ''}
                        className={`w-full text-left p-3 rounded-xl border-2 flex items-center gap-3 transition-all cursor-pointer disabled:opacity-60 ${
                          r.id === selectedRekeningId
                            ? 'border-emerald-500 bg-emerald-50/60'
                            : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                            r.id === selectedRekeningId ? 'border-emerald-600 bg-emerald-600 ring-2 ring-emerald-200' : 'border-slate-300'
                          }`}
                        />
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-slate-800">{r.namaBank}</span>
                          <span className="block text-[11px] text-slate-500 font-mono truncate">
                            {r.nomorRekening} • {r.atasNama}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Bank</span>
                  <span className="font-bold text-slate-800">{info.bank.nama}</span>
                </div>
                <div className="flex justify-between items-center gap-2 text-xs">
                  <span className="text-slate-500">No. Rekening</span>
                  <button onClick={copyRekening} className="flex items-center gap-1.5 font-mono font-black text-base text-emerald-800 hover:text-emerald-600 transition-colors cursor-pointer">
                    {info.bank.nomor}
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Atas Nama</span>
                  <span className="font-bold text-slate-800">{info.bank.atasNama}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Nominal Transfer</span>
                  <span className="font-black text-emerald-700">{formatRupiah(info.jumlahBayar || amount)}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Konfirmasi Transfer</p>
                <input
                  value={namaPengirim}
                  onChange={(e) => setNamaPengirim(e.target.value)}
                  placeholder="Nama pengirim (sesuai rekening)"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <input
                  value={buktiUrl}
                  onChange={(e) => setBuktiUrl(e.target.value)}
                  placeholder="Link bukti transfer (opsional, mis. Google Drive)"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <Button onClick={handleKonfirmasiManual} disabled={loading !== ''} className="w-full py-3 font-bold">
                  {loading === 'manual-confirm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Kirim Konfirmasi Pembayaran
                </Button>
              </div>
            </div>
          )}

          {/* SELESAI */}
          {view === 'done' && (
            <div className="text-center space-y-3 py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <p className="font-black text-slate-900">Terima Kasih!</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {info?.status === STATUS_PEMBAYARAN.PAID
                  ? 'Pembayaran Anda terkonfirmasi otomatis melalui Tripay.'
                  : 'Konfirmasi pembayaran Anda diterima. Bendahara PPDB akan memverifikasi maksimal 1x24 jam kerja dan mengirim notifikasi WhatsApp.'}
              </p>
              <Button onClick={onDone} className="w-full py-3 font-bold">
                Lanjut ke Bukti Pendaftaran
              </Button>
            </div>
          )}

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 leading-relaxed">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
