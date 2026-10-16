import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Award,
  Phone,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import { AdminCalonSiswaItem } from './PendaftarDetailModal.js';
import { Button } from '../common/Button.js';

interface TableProps {
  data: AdminCalonSiswaItem[];
  onSelectPendaftar: (item: AdminCalonSiswaItem) => void;
  onExportDapodik: () => void;
}

export const PendaftarTable: React.FC<TableProps> = ({
  data,
  onSelectPendaftar,
  onExportDapodik,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterJalur, setFilterJalur] = useState<string>('ALL');
  const [filterFisik, setFilterFisik] = useState<string>('ALL');

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      item.nomorPendaftaran.toLowerCase().includes(search.toLowerCase()) ||
      item.nisn.includes(search) ||
      item.sekolahAsal.toLowerCase().includes(search.toLowerCase()) ||
      (item.nomorKipSktm && item.nomorKipSktm.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchJalur = filterJalur === 'ALL' || item.jalurPendaftaran === filterJalur;
    const matchFisik =
      filterFisik === 'ALL' ||
      (filterFisik === 'VERIFIED' && item.verifikasiFisik?.verified) ||
      (filterFisik === 'UNVERIFIED' && !item.verifikasiFisik?.verified);

    return matchSearch && matchStatus && matchJalur && matchFisik;
  });

  const getStatusBadge = (status: AdminCalonSiswaItem['status']) => {
    switch (status) {
      case 'DITERIMA_RESMI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-700 text-white shadow-xs">
            <ShieldCheck className="w-3 h-3" /> RESMI DITERIMA
          </span>
        );
      case 'MENGIKUTI_MPLS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
            <BookOpen className="w-3 h-3 text-purple-600" /> IKUT MPLS
          </span>
        );
      case 'LOLOS_SELEKSI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
            <Award className="w-3 h-3 text-blue-600" /> LOLOS SELEKSI
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> BERKAS VALID
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 text-amber-600" /> PERLU VERIFIKASI
          </span>
        );
      case 'REVISI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3 text-rose-600" /> PERLU REVISI
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const handleQuickWhatsApp = (e: React.MouseEvent, item: AdminCalonSiswaItem) => {
    e.stopPropagation();
    const rawHp = item.noHpOrtu.replace(/^0/, '62').replace(/\D/g, '');
    const msg = `Assalamu'alaikum Bpk/Ibu wali dari ${item.namaLengkap} (No: ${item.nomorPendaftaran}). Kami dari Panitia SPMB SMP YAPIA Ciputat menginformasikan status terkini pendaftaran ananda adalah *${item.status}*.`;
    window.open(`https://api.whatsapp.com/send?phone=${rawHp}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-slate-50/50">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama siswa, NISN, SD asal, atau No KIP..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          />
        </div>

        {/* Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          {/* Filter Jalur */}
          <select
            value={filterJalur}
            onChange={(e) => setFilterJalur(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="ALL">Semua Jalur</option>
            <option value="REGULER">Reguler</option>
            <option value="AFIRMASI">Afirmasi (KIP/SKTM)</option>
            <option value="PRESTASI">Prestasi</option>
          </select>

          {/* Filter Verifikasi Fisik */}
          <select
            value={filterFisik}
            onChange={(e) => setFilterFisik(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="ALL">Semua Berkas Fisik</option>
            <option value="VERIFIED">Fisik: Valid TU</option>
            <option value="UNVERIFIED">Fisik: Belum Diterima</option>
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="ALL">Semua Status</option>
            <option value="SUBMITTED">Perlu Verifikasi</option>
            <option value="VERIFIED">Berkas Valid</option>
            <option value="LOLOS_SELEKSI">Lolos Seleksi</option>
            <option value="MENGIKUTI_MPLS">Ikut MPLS</option>
            <option value="DITERIMA_RESMI">Resmi Diterima</option>
            <option value="REVISI">Perlu Revisi</option>
            <option value="DRAFT">Draft</option>
          </select>

          <Button
            onClick={onExportDapodik}
            className="text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Ekspor Dapodik Kemdikbud
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <th className="py-3 px-4">No. Pendaftaran</th>
              <th className="py-3 px-4">Nama Siswa & NISN</th>
              <th className="py-3 px-4">Jalur Pendaftaran</th>
              <th className="py-3 px-4">Sekolah Asal & Kec.</th>
              <th className="py-3 px-4">Verifikasi Fisik TU</th>
              <th className="py-3 px-4">Status SPMB</th>
              <th className="py-3 px-4 text-center">Aksi Cepat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <p className="font-semibold text-sm">Tidak ada pendaftar yang cocok.</p>
                  <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectPendaftar(item)}
                  className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <span className="group-hover:text-emerald-700 transition-colors">
                      {item.nomorPendaftaran}
                    </span>
                    <span className="block text-[10px] font-normal text-slate-400">
                      G{item.gelombangId} • {item.tanggalDaftar}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block group-hover:text-emerald-800">
                      {item.namaLengkap}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      NISN: {item.nisn} ({item.jenisKelamin === 'L' ? 'L' : 'P'})
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {item.jalurPendaftaran === 'AFIRMASI' ? (
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Award className="w-3 h-3 text-amber-600" /> AFIRMASI (KIP)
                        </span>
                        <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                          {item.nomorKipSktm || '-'}
                        </span>
                      </div>
                    ) : item.jalurPendaftaran === 'PRESTASI' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        PRESTASI
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        REGULER
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 block">{item.sekolahAsal}</span>
                    <span className="text-[10px] text-slate-400">
                      Kec. {item.kecamatanAsal || 'Ciputat'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    {item.verifikasiFisik?.verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fisik Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5" /> Belum Fisik
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">{getStatusBadge(item.status)}</td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleQuickWhatsApp(e, item)}
                        title="Hubungi Orang Tua lewat WhatsApp"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectPendaftar(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" /> Review
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Menampilkan <strong>{filteredData.length}</strong> dari <strong>{data.length}</strong> calon siswa
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Jalur Afirmasi KIP: {data.filter(d => d.jalurPendaftaran === 'AFIRMASI').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Fisik Terverifikasi TU: {data.filter(d => d.verifikasiFisik?.verified).length}
          </span>
        </div>
      </div>
    </div>
  );
};
