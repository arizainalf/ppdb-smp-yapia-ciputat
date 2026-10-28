import React, { useState } from 'react';
import { useRegistrationWizardContext } from '../../../application/contexts/RegistrationWizardContext.js';
import { Button } from '../common/Button.js';
import { FileUp, CheckCircle, AlertTriangle, ShieldCheck, FileText, Image, Lock, Award } from 'lucide-react';

interface Step5Props {
  onSubmitFinal: () => Promise<void>;
  isSubmitting: boolean;
}

export const Step5UploadBerkas: React.FC<Step5Props> = ({ onSubmitFinal, isSubmitting }) => {
  const { formData, updateFormData, prevStep } = useRegistrationWizardContext();

  const [uploads, setUploads] = useState({
    ijazah: formData.ijazahUploaded || false,
    kk: formData.kkUploaded || false,
    akta: formData.aktaUploaded || false,
    foto: formData.fotoUploaded || false,
    kip: formData.kipUploaded || false,
  });

  const [pernyataan, setPernyataan] = useState(formData.pernyataanKebenaran || false);
  const [pdpConsent, setPdpConsent] = useState(formData.pdpConsent ?? true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAfirmasi = formData.jalurPendaftaran === 'AFIRMASI';

  const handleSimulateUpload = (key: 'ijazah' | 'kk' | 'akta' | 'foto' | 'kip') => {
    setUploads((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      updateFormData({
        ijazahUploaded: next.ijazah,
        kkUploaded: next.kk,
        aktaUploaded: next.akta,
        fotoUploaded: next.foto,
        kipUploaded: next.kip,
      });
      return next;
    });
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);

    if (!uploads.ijazah || !uploads.kk || !uploads.akta) {
      setErrorMsg('Mohon lengkapi ketiga dokumen wajib (Ijazah/SKL, Kartu Keluarga, dan Akta Kelahiran).');
      return;
    }

    if (isAfirmasi && !uploads.kip) {
      setErrorMsg('Untuk Jalur Afirmasi, mohon unggah scan Kartu KIP / PIP / Surat Keterangan Tidak Mampu (SKTM).');
      return;
    }

    if (!pernyataan) {
      setErrorMsg('Anda wajib menyetujui pernyataan kebenaran data formulir.');
      return;
    }

    if (!pdpConsent) {
      setErrorMsg('Anda wajib menyetujui ketentuan pemrosesan data pribadi sesuai UU PDP No. 27/2022.');
      return;
    }

    updateFormData({
      pernyataanKebenaran: true,
      pdpConsent: true,
      pdpConsentAt: new Date().toISOString(),
    });
    await onSubmitFinal();
  };

  return (
    <form onSubmit={handleFinalSubmit} className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileUp className="w-5 h-5 text-emerald-600" />
          Tahap 5: Unggah Dokumen & Konfirmasi Final
        </h3>
        <p className="text-xs text-slate-500">
          Formulir Bagian E - Unggah scan / foto berkas persyaratan resmi dalam format PDF, JPG, atau PNG (Maks 2 MB per file).
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Ijazah / SKL */}
        <div
          onClick={() => handleSimulateUpload('ijazah')}
          className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col justify-between ${
            uploads.ijazah
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${uploads.ijazah ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Ijazah SD / SKL</h4>
                <p className="text-[11px] text-slate-500">Scan asli atau fotokopi legalisir</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">Wajib</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            {uploads.ijazah ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Terunggah (ijazah_sd.pdf)
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Klik untuk memilih file...</span>
            )}
          </div>
        </div>

        {/* 2. Kartu Keluarga */}
        <div
          onClick={() => handleSimulateUpload('kk')}
          className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col justify-between ${
            uploads.kk
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${uploads.kk ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Kartu Keluarga (KK)</h4>
                <p className="text-[11px] text-slate-500">Scan dokumen KK yang masih berlaku</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">Wajib</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            {uploads.kk ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Terunggah (kartu_keluarga.jpg)
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Klik untuk memilih file...</span>
            )}
          </div>
        </div>

        {/* 3. Akta Kelahiran */}
        <div
          onClick={() => handleSimulateUpload('akta')}
          className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col justify-between ${
            uploads.akta
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${uploads.akta ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Akta Kelahiran</h4>
                <p className="text-[11px] text-slate-500">Scan akta kelahiran resmi</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">Wajib</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            {uploads.akta ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Terunggah (akta_kelahiran.pdf)
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Klik untuk memilih file...</span>
            )}
          </div>
        </div>

        {/* 4. Pas Foto 3x4 */}
        <div
          onClick={() => handleSimulateUpload('foto')}
          className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col justify-between ${
            uploads.foto
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${uploads.foto ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Pas Foto 3x4</h4>
                <p className="text-[11px] text-slate-500">Latar merah/biru berseragam SD</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Opsional</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            {uploads.foto ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Terunggah (pas_foto_3x4.jpg)
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Klik untuk memilih file...</span>
            )}
          </div>
        </div>

        {/* 5. Kartu KIP / PIP / SKTM (Kondisional untuk Jalur Afirmasi) */}
        {isAfirmasi && (
          <div
            onClick={() => handleSimulateUpload('kip')}
            className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col justify-between sm:col-span-2 ${
              uploads.kip
                ? 'border-amber-500 bg-amber-50/50'
                : 'border-amber-300 hover:border-amber-500 bg-amber-50/20'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${uploads.kip ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Kartu Indonesia Pintar (KIP) / PIP / Surat Keterangan Tidak Mampu (SKTM)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Nomor: {formData.nomorKipSktm || '-'} (Wajib untuk validasi subsidi infak & kuota afirmasi)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Wajib Afirmasi
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              {uploads.kip ? (
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Dokumen KIP/SKTM Terunggah (kartu_kip_resmi.pdf)
                </span>
              ) : (
                <span className="text-amber-700 font-medium">Klik untuk memilih file Kartu KIP/SKTM...</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ringkasan Isian Formulir */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Ringkasan Isian Calon Siswa
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-slate-400 block">Nama Calon Siswa:</span>
            <span className="font-bold text-slate-800">{formData.namaLengkap || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Jalur Pendaftaran:</span>
            <span className="font-bold text-emerald-700">
              {formData.jalurPendaftaran || 'REGULER'}
              {formData.nomorKipSktm ? ` (${formData.nomorKipSktm})` : ''}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Sekolah Asal:</span>
            <span className="font-bold text-slate-800">{formData.namaSekolahAsal || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Nama Orang Tua:</span>
            <span className="font-bold text-slate-800">{formData.namaAyah || formData.namaIbu || '-'}</span>
          </div>
        </div>
      </div>

      {/* Pernyataan Kebenaran Dokumen */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
        <input
          type="checkbox"
          id="pernyataanKebenaran"
          checked={pernyataan}
          onChange={(e) => setPernyataan(e.target.checked)}
          className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-amber-300"
        />
        <label htmlFor="pernyataanKebenaran" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
          <ShieldCheck className="w-4 h-4 inline-block text-amber-700 mr-1 -mt-0.5" />
          <strong>Pernyataan Kebenaran Dokumen:</strong> Saya menyatakan bahwa seluruh data yang diisi pada formulir ini adalah benar, sah, dan dapat dipertanggungjawabkan sesuai dokumen resmi ijazah SD, Kartu Keluarga, dan Akta Kelahiran. Jika di kemudian hari ditemukan pemalsuan data, saya bersedia menerima sanksi pembatalan penerimaan.
        </label>
      </div>

      {/* Kepatuhan UU PDP No. 27/2022 (Persetujuan Pemrosesan Data Pribadi) */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
        <input
          type="checkbox"
          id="pdpConsent"
          checked={pdpConsent}
          onChange={(e) => setPdpConsent(e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-blue-300"
        />
        <label htmlFor="pdpConsent" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
          <Lock className="w-4 h-4 inline-block text-blue-700 mr-1 -mt-0.5" />
          <strong>Persetujuan Pemrosesan Data Pribadi (UU PDP No. 27/2022):</strong> Saya secara sadar memberikan persetujuan eksplisit kepada Panitia SPMB SMP YAPIA Ciputat untuk memproses, menyimpan, dan memvalidasi data pribadi calon peserta didik dan orang tua (termasuk NIK, No. KK, NISN, dan penghasilan) untuk keperluan seleksi admisi, kesiswaan, dan pelaporan sinkronisasi resmi Dapodik Kemendikbudristek.
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting} className="w-full sm:w-auto">
          &larr; Kembali
        </Button>
        <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
          Kirim Formulir Pendaftaran Final ✓
        </Button>
      </div>
    </form>
  );
};
