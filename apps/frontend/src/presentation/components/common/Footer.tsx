import React from 'react';
import { MapPin, Phone, Mail, GraduationCap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5 text-white font-bold text-base mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            SMP YAPIA CIPUTAT
          </div>
          <p className="text-slate-400 leading-relaxed mb-4">
            Membentuk generasi berakhlak mulia, berprestasi akademik, dan siap menghadapi tantangan era digital dengan nilai-nilai Islam.
          </p>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <span>Akreditasi A</span>
            <span>•</span>
            <span>NPSN: 20603210</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">Informasi Kontak Panitia</h4>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Jl. KH. Dewantara No. 12, Ciputat, Kota Tangerang Selatan, Banten 15411</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>(021) 749-XXXX / WhatsApp: 0812-3456-7890</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ppdb@smp-yapia.sch.id</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3">Jadwal Pelayanan PPDB</h4>
          <p className="mb-2">Senin – Jumat: 08.00 – 15.00 WIB</p>
          <p className="mb-4">Sabtu: 08.00 – 12.00 WIB (Helpdesk Offline)</p>
          <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
            <p className="text-[11px] text-slate-300">
              💡 <strong>Catatan:</strong> Pendaftaran online melalui website ini aktif 24 jam setiap hari selama gelombang pendaftaran dibuka.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-slate-500 text-[11px]">
        © {new Date().getFullYear()} SMP YAPIA Ciputat. Hak Cipta Dilindungi Undang-Undang.
      </div>
    </footer>
  );
};
