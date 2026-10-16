import React from 'react';
import { RegistrationFormData } from '../../../domain/models/CalonSiswaModel.js';
import { Printer, CheckCircle, QrCode, Download, X } from 'lucide-react';
import { Button } from '../common/Button.js';

interface BuktiProps {
  formData: Partial<RegistrationFormData>;
  nomorPendaftaran: string;
  onClose: () => void;
}

export const BuktiPendaftaranModal: React.FC<BuktiProps> = ({
  formData,
  nomorPendaftaran,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-emerald-700 text-white flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-300" />
            <h3 className="font-extrabold text-base tracking-tight">
              Pendaftaran Berhasil Terkirim!
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-600 rounded-lg transition-colors text-emerald-100 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div id="printable-card" className="p-6 space-y-6">
          {/* Header Surat */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <h2 className="text-xl font-black text-slate-900 tracking-wider uppercase">
              SMP YAPIA CIPUTAT
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              PANITIA PENERIMAAN MURID BARU (SIPMB) TAHUN AJARAN 2026/2027
            </p>
            <p className="text-[11px] text-slate-500">
              Jl. KH. Dewantara No. 12, Ciputat, Tangerang Selatan | Telp: (021) 749-XXXX
            </p>
          </div>

          {/* Registration Number Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
                Nomor Registrasi Resmi
              </span>
              <p className="text-2xl font-black text-emerald-900 font-mono tracking-tight">
                {nomorPendaftaran}
              </p>
              <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                STATUS: TERDAFTAR (MENUNGGU VERIFIKASI)
              </span>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <QrCode className="w-16 h-16 text-slate-900" />
              <span className="text-[9px] font-mono text-slate-500 mt-1">VERIFIED QR</span>
            </div>
          </div>

          {/* Biodata Data Tables */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
              Data Calon Siswa (Bagian A & B)
            </h4>
            <div className="grid grid-cols-2 gap-y-2">
              <div>
                <span className="text-slate-500">Nama Lengkap:</span>
                <p className="font-bold text-slate-800">{formData.namaLengkap}</p>
              </div>
              <div>
                <span className="text-slate-500">NISN:</span>
                <p className="font-bold text-slate-800 font-mono">{formData.nisn || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">Jenis Kelamin:</span>
                <p className="font-bold text-slate-800">{formData.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</p>
              </div>
              <div>
                <span className="text-slate-500">Tempat, Tanggal Lahir:</span>
                <p className="font-bold text-slate-800">{formData.tempatLahir}, {formData.tanggalLahir}</p>
              </div>
              <div>
                <span className="text-slate-500">Sekolah Asal:</span>
                <p className="font-bold text-slate-800">{formData.namaSekolahAsal || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">No. WhatsApp Siswa:</span>
                <p className="font-bold text-slate-800">{formData.noHpSiswa || '-'}</p>
              </div>
            </div>

            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1 pt-3">
              Data Domisili & Orang Tua (Bagian C & D)
            </h4>
            <div className="grid grid-cols-2 gap-y-2">
              <div className="col-span-2">
                <span className="text-slate-500">Alamat Tempat Tinggal:</span>
                <p className="font-bold text-slate-800">
                  {formData.alamatLengkap} RT {formData.rt || '00'}/RW {formData.rw || '00'} No. {formData.noRumah || '-'}, Kel. {formData.kelurahan}, Kec. {formData.kecamatan}, {formData.kotaKabupaten}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Nama Ayah / Ibu:</span>
                <p className="font-bold text-slate-800">{formData.namaAyah || formData.namaIbu || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">No. HP Orang Tua:</span>
                <p className="font-bold text-slate-800">{formData.noHpAyah || formData.noHpIbu || '-'}</p>
              </div>
            </div>
          </div>

          {/* Petunjuk Selanjutnya */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
            📌 <strong>Langkah Selanjutnya:</strong>
            <ol className="list-decimal ml-4 mt-1 space-y-1">
              <li>Simpan atau cetak lembar bukti pendaftaran ini.</li>
              <li>Panitia akan memverifikasi berkas Anda dalam waktu 1x24 jam hari kerja.</li>
              <li>Notifikasi kelulusan berkas akan dikirimkan langsung ke nomor WhatsApp yang terdaftar.</li>
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="w-4 h-4" /> Cetak Lembar Ini
            </Button>
            <Button onClick={handlePrint}>
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
