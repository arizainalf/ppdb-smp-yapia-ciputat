import React, { useState, useEffect } from 'react';
import {
  RegistrationWizardProvider,
  useRegistrationWizardContext,
} from '../../application/contexts/RegistrationWizardContext.js';
import { Step1CalonSiswa } from '../components/wizard/Step1CalonSiswa.js';
import { Step2SekolahAsal } from '../components/wizard/Step2SekolahAsal.js';
import { Step3Alamat } from '../components/wizard/Step3Alamat.js';
import { Step4OrangTua } from '../components/wizard/Step4OrangTua.js';
import { Step5UploadBerkas } from '../components/wizard/Step5UploadBerkas.js';
import { PaymentModal } from '../components/wizard/PaymentModal.js';
import { BuktiPendaftaranModal } from '../components/wizard/BuktiPendaftaranModal.js';
import { calonSiswaService } from '../../infrastructure/api/calonSiswaService.js';
import { Button } from '../components/common/Button.js';
import { ArrowLeft } from 'lucide-react';

interface WizardPageProps {
  onBackToHome?: () => void;
}

const WizardContent: React.FC<WizardPageProps> = ({ onBackToHome }) => {
  const { currentStep, formData, updateFormData } = useRegistrationWizardContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBuktiModal, setShowBuktiModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [nomorRegistrasi, setNomorRegistrasi] = useState('REG-2026-G1-0001');
  const [pendaftaranAktif, setPendaftaranAktif] = useState<boolean | null>(null); // null = memuat
  const [infoGelombang, setInfoGelombang] = useState<{ nama: string; tahunAjaran: string } | null>(null);
  const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`;

  // Gate pendaftaran + pilih gelombang aktif secara dinamis
  useEffect(() => {
    fetch(`${apiUrl}/api/v1/pengaturan`)
      .then((r) => r.json())
      .then((j) => {
        if (j.status === 'success' && j.data) setPendaftaranAktif(Boolean(j.data.pendaftaranAktif));
        else setPendaftaranAktif(true);
      })
      .catch(() => setPendaftaranAktif(true));

    fetch(`${apiUrl}/api/v1/gelombang`)
      .then((r) => r.json())
      .then((j) => {
        if (j.status === 'success' && Array.isArray(j.data)) {
          const today = new Date().toISOString().slice(0, 10);
          const aktif = j.data.find(
            (g: any) =>
              g.isActive &&
              (!g.tanggalBuka || today >= g.tanggalBuka) &&
              (!g.tanggalTutup || today <= g.tanggalTutup)
          );
          if (aktif) {
            setInfoGelombang({ nama: aktif.namaGelombang, tahunAjaran: aktif.tahunAjaran || '' });
            updateFormData({ gelombangId: aktif.id });
          }
        }
      })
      .catch(() => {});
  }, [apiUrl, updateFormData]);

  const stepTitles = [
    'Data Calon Siswa',
    'Asal Sekolah & Fisik',
    'Tempat Tinggal',
    'Orang Tua / Wali',
    'Unggah Berkas',
  ];

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await calonSiswaService.register({
        gelombangId: Number(formData.gelombangId) || 1,
        namaLengkap: formData.namaLengkap || 'Calon Siswa',
        jenisKelamin: (formData.jenisKelamin as 'L' | 'P') || 'L',
        tempatLahir: formData.tempatLahir || 'Tangerang Selatan',
        tanggalLahir: formData.tanggalLahir || '2013-05-12',
        agama: formData.agama || 'Islam',
        noHpSiswa: formData.noHpSiswa || formData.noHpAyah || formData.noHpIbu || '',
        email: formData.emailOrtu || formData.email || '',
        jalurPendaftaran: (formData.jalurPendaftaran as any) || 'REGULER',
        nomorKipSktm: formData.nomorKipSktm || '',
        pdpConsent: true,
        // Kaitkan relasi data ortu, sekolah asal, dan alamat ke database
        namaOrtu: formData.namaAyah || formData.namaIbu || formData.namaWali || 'Wali Murid',
        noHpOrtu: formData.noHpAyah || formData.noHpIbu || formData.noHpWali || '',
        sekolahAsal: formData.namaSekolahAsal || 'SD Negeri',
        nisn: formData.nisn || '',
        alamat: formData.alamatLengkap || '',
        // Alamat terstruktur: menentukan kelayakan Bantuan Biaya Pendidikan Pemkot Tangsel
        rt: formData.rt || '',
        rw: formData.rw || '',
        noRumah: formData.noRumah || '',
        kelurahan: formData.kelurahan || '',
        kecamatan: formData.kecamatan || '',
        kotaKabupaten: formData.kotaKabupaten || '',
        provinsi: formData.provinsi || '',
        kodePos: formData.kodePos || '',
        tinggalBersama: formData.tinggalBersama || '',
      } as any);

      if (res.data?.nomorPendaftaran) {
        setNomorRegistrasi(res.data.nomorPendaftaran);
        updateFormData({ nomorPendaftaran: res.data.nomorPendaftaran });
      }
      setShowPaymentModal(true);
    } catch (e: any) {
      console.error('Pendaftaran gagal:', e);
      alert('Pendaftaran gagal: ' + (e.message || 'Koneksi ke server bermasalah'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Back button */}
      {onBackToHome && (
        <button
          onClick={onBackToHome}
          className="mb-4 text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
          Formulir PPDB Online {infoGelombang?.tahunAjaran || '2026/2027'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
          Penerimaan Murid Baru
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          SMP YAPIA Ciputat • {infoGelombang ? `${infoGelombang.nama} (Tahun Ajaran ${infoGelombang.tahunAjaran || '-'})` : 'Memuat gelombang aktif...'}
        </p>
      </div>

      {/* Gate: pendaftaran ditutup oleh panitia */}
      {pendaftaranAktif === false ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold">
            ✕
          </div>
          <h2 className="text-lg font-black text-slate-900">Pendaftaran Sedang Ditutup</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Panitia PPDB sedang menutup pendaftaran online. Silakan pantau beranda untuk pengumuman pembukaan
            gelombang berikutnya, atau hubungi panitia melalui helpdesk.
          </p>
          {onBackToHome && (
            <Button onClick={onBackToHome} variant="outline" className="mx-auto px-6">
              Kembali ke Beranda
            </Button>
          )}
        </div>
      ) : (
      <>
      {/* Step Indicator Progress Bar */}
      <div className="mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex justify-between items-center relative">
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={title} className="flex flex-col items-center flex-1 z-10">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 shadow-sm'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] mt-2 font-medium hidden sm:block text-center max-w-[90px] leading-tight ${
                    isCurrent ? 'text-emerald-800 font-bold' : 'text-slate-400'
                  }`}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Components Render */}
      <div className="transition-all duration-300">
        {currentStep === 1 && <Step1CalonSiswa />}
        {currentStep === 2 && <Step2SekolahAsal />}
        {currentStep === 3 && <Step3Alamat />}
        {currentStep === 4 && <Step4OrangTua />}
        {currentStep === 5 && (
          <Step5UploadBerkas
            onSubmitFinal={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
      </>
      )}

      {/* Payment Modal (Tripay / Transfer Manual) */}
      {showPaymentModal && (
        <PaymentModal
          nomorPendaftaran={nomorRegistrasi}
          gelombangId={Number(formData.gelombangId) || 1}
          kotaKabupaten={formData.kotaKabupaten || ''}
          onDone={() => {
            setShowPaymentModal(false);
            setShowBuktiModal(true);
          }}
        />
      )}

      {/* Bukti Pendaftaran Modal */}
      {showBuktiModal && (
        <BuktiPendaftaranModal
          formData={formData}
          nomorPendaftaran={nomorRegistrasi}
          onClose={() => {
            setShowBuktiModal(false);
            if (onBackToHome) onBackToHome();
          }}
        />
      )}
    </div>
  );
};

export const RegistrationWizardPage: React.FC<WizardPageProps> = (props) => {
  return (
    <RegistrationWizardProvider>
      <div className="min-h-screen bg-slate-50/50 pb-16">
        <WizardContent {...props} />
      </div>
    </RegistrationWizardProvider>
  );
};
