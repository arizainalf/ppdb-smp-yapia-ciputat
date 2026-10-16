import React from 'react';
import { Users, Clock, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';

interface StatsProps {
  totalPendaftar: number;
  menungguVerifikasi: number;
  terverifikasi: number;
  perluRevisi: number;
  totalBiayaMasuk: number;
}

export const AdminStatsCards: React.FC<StatsProps> = ({
  totalPendaftar,
  menungguVerifikasi,
  terverifikasi,
  perluRevisi,
  totalBiayaMasuk,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Total Pendaftar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Pendaftar</span>
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{totalPendaftar}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Calon Siswa Terdaftar</span>
        </div>
      </div>

      {/* 2. Menunggu Verifikasi */}
      <div className="p-4 bg-white rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700">Perlu Verifikasi</span>
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-amber-900 tracking-tight">{menungguVerifikasi}</span>
          <span className="text-[11px] text-amber-700/80 block mt-0.5">Berkas Masuk Baru</span>
        </div>
      </div>

      {/* 3. Terverifikasi */}
      <div className="p-4 bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700">Terverifikasi</span>
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-emerald-900 tracking-tight">{terverifikasi}</span>
          <span className="text-[11px] text-emerald-700/80 block mt-0.5">Berkas Sah & Lengkap</span>
        </div>
      </div>

      {/* 4. Perlu Revisi */}
      <div className="p-4 bg-white rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-700">Perlu Revisi</span>
          <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-black text-rose-900 tracking-tight">{perluRevisi}</span>
          <span className="text-[11px] text-rose-700/80 block mt-0.5">Dokumen Buram / Kurang</span>
        </div>
      </div>

      {/* 5. Keuangan */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Penerimaan Formulir</span>
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight">
            Rp {(totalBiayaMasuk / 1000).toLocaleString('id-ID')}k
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Estimasi Kas Admisi</span>
        </div>
      </div>
    </div>
  );
};
