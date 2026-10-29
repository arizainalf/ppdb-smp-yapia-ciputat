import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import type { LandingContentDTO } from '@yapia/shared';

const DEFAULT_KONTAK: LandingContentDTO['kontak'] = {
  namaSekolah: 'SMP YAPIA CIPUTAT',
  deskripsiSekolah:
    'Membentuk generasi berakhlak mulia, berprestasi akademik, dan siap menghadapi tantangan era digital dengan nilai-nilai Islam.',
  npsn: '20603210',
  akreditasi: 'Akreditasi A',
  alamatSekolah: 'Jl. KH. Dewantara No. 12, Ciputat, Kota Tangerang Selatan, Banten 15411',
  telepon: '(021) 749-XXXX',
  whatsapp: '0812-3456-7890',
  email: 'ppdb@smp-yapia.sch.id',
  jadwalPelayanan: 'Senin – Jumat: 08.00 – 15.00 WIB | Sabtu: 08.00 – 12.00 WIB (Helpdesk Offline)',
};

export const Footer: React.FC = () => {
  const [kontak, setKontak] = useState<LandingContentDTO['kontak']>(DEFAULT_KONTAK);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/content/landing`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success' && json.data?.kontak) {
          setKontak(json.data.kontak);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5 text-white font-bold text-base mb-3">
            <img
              src="/assets/logo-smp-yapia-ciputat.png"
              alt="Logo SMP YAPIA Ciputat"
              className="w-8 h-8 object-contain shrink-0"
            />
            {kontak.namaSekolah}
          </div>
          <p className="text-slate-400 leading-relaxed mb-4">
            {kontak.deskripsiSekolah}
          </p>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <span>{kontak.akreditasi}</span>
            <span>•</span>
            <span>NPSN: {kontak.npsn}</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">Informasi Kontak Panitia</h4>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{kontak.alamatSekolah}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {kontak.telepon} / WhatsApp: {kontak.whatsapp}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{kontak.email}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">Jadwal Pelayanan PPDB</h4>
          <p className="mb-4 leading-relaxed">{kontak.jadwalPelayanan}</p>
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
            <p className="text-[11px] text-slate-300">
            <strong>Catatan:</strong> Pendaftaran online melalui website ini aktif 24 jam setiap hari selama gelombang pendaftaran dibuka.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-slate-500 text-[11px]">
        © {new Date().getFullYear()} {kontak.namaSekolah}. Hak Cipta Dilindungi Undang-Undang.
      </div>
    </footer>
  );
};

