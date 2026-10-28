import React, { useState } from 'react';
import { useRegistrationWizardContext } from '../../../application/contexts/RegistrationWizardContext.js';
import { InputField } from '../common/InputField.js';
import { Button } from '../common/Button.js';
import { Users, User } from 'lucide-react';

export const Step4OrangTua: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useRegistrationWizardContext();
  const [activeTab, setActiveTab] = useState<'ayah' | 'ibu' | 'wali'>('ayah');

  const [form, setForm] = useState({
    // Ayah
    namaAyah: formData.namaAyah || '',
    statusAyah: formData.statusAyah || 'HIDUP',
    pendidikanAyah: formData.pendidikanAyah || 'SMA/SMK',
    tahunLahirAyah: formData.tahunLahirAyah || '1980',
    pekerjaanAyah: formData.pekerjaanAyah || '',
    penghasilanAyah: formData.penghasilanAyah || 'Rp 3.000.000 - Rp 5.000.000',
    noHpAyah: formData.noHpAyah || '',

    // Ibu
    namaIbu: formData.namaIbu || '',
    statusIbu: formData.statusIbu || 'HIDUP',
    pendidikanIbu: formData.pendidikanIbu || 'SMA/SMK',
    tahunLahirIbu: formData.tahunLahirIbu || '1984',
    pekerjaanIbu: formData.pekerjaanIbu || 'Ibu Rumah Tangga',
    penghasilanIbu: formData.penghasilanIbu || 'Tidak Berpenghasilan',
    noHpIbu: formData.noHpIbu || '',

    // Wali
    namaWali: formData.namaWali || '',
    hubunganWali: formData.hubunganWali || '',
    pekerjaanWali: formData.pekerjaanWali || '',
    noHpWali: formData.noHpWali || '',

    // Kontak & Notifikasi Login Orang Tua
    emailOrtu: formData.emailOrtu || formData.email || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.namaAyah.trim() && form.statusAyah === 'HIDUP') {
      newErrors.namaAyah = 'Nama ayah wajib diisi sesuai ijazah';
    }
    if (!form.namaIbu.trim() && form.statusIbu === 'HIDUP') {
      newErrors.namaIbu = 'Nama ibu kandung wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Auto switch tab if error
      if (newErrors.namaAyah) setActiveTab('ayah');
      else if (newErrors.namaIbu) setActiveTab('ibu');
      return;
    }

    updateFormData(form as any);
    nextStep();
  };

  const pendidikanOptions = ['SD / Sederajat', 'SMP / Sederajat', 'SMA / SMK', 'D1 - D3', 'S1 / Sarjana', 'S2 / Magister', 'S3 / Doktor', 'Lainnya'];
  const penghasilanOptions = [
    'Tidak Berpenghasilan',
    '< Rp 1.000.000',
    'Rp 1.000.000 - Rp 3.000.000',
    'Rp 3.000.000 - Rp 5.000.000',
    'Rp 5.000.000 - Rp 10.000.000',
    '> Rp 10.000.000',
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          Tahap 4: Keterangan Orang Tua & Wali
        </h3>
        <p className="text-xs text-slate-500">Formulir Bagian D - Data ayah kandung, ibu kandung, atau wali siswa.</p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('ayah')}
          className={`px-5 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'ayah'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Data Ayah
          {errors.namaAyah && <span className="w-2 h-2 rounded-full bg-rose-500" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ibu')}
          className={`px-5 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'ibu'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Data Ibu
          {errors.namaIbu && <span className="w-2 h-2 rounded-full bg-rose-500" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wali')}
          className={`px-5 py-2.5 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'wali'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          Data Wali (Opsional)
        </button>
      </div>

      {/* Content Tab: AYAH */}
      {activeTab === 'ayah' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex gap-4 mb-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="statusAyah"
                value="HIDUP"
                checked={form.statusAyah === 'HIDUP'}
                onChange={handleChange}
                className="text-emerald-600"
              />
              Masih Hidup
            </label>
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="statusAyah"
                value="MENINGGAL"
                checked={form.statusAyah === 'MENINGGAL'}
                onChange={handleChange}
                className="text-emerald-600"
              />
              Almarhum / Sudah Meninggal
            </label>
          </div>

          <InputField
            label="Nama Lengkap Ayah"
            name="namaAyah"
            required={form.statusAyah === 'HIDUP'}
            value={form.namaAyah}
            onChange={handleChange}
            error={errors.namaAyah}
            placeholder="Contoh: Ahmad Fauzi"
            helperText="Wajib sesuai penulisan pada Akta / Kartu Keluarga"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Pendidikan Terakhir Ayah</label>
              <select
                name="pendidikanAyah"
                value={form.pendidikanAyah}
                onChange={handleChange}
                className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
              >
                {pendidikanOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <InputField
              label="Tahun Lahir Ayah"
              name="tahunLahirAyah"
              maxLength={4}
              value={form.tahunLahirAyah}
              onChange={handleChange}
              placeholder="Contoh: 1978"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Pekerjaan Ayah"
              name="pekerjaanAyah"
              value={form.pekerjaanAyah}
              onChange={handleChange}
              placeholder="Contoh: Karyawan Swasta / Wiraswasta"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Penghasilan Bulanan Ayah</label>
              <select
                name="penghasilanAyah"
                value={form.penghasilanAyah}
                onChange={handleChange}
                className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
              >
                {penghasilanOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <InputField
            label="Nomor WhatsApp / Telepon Ayah"
            name="noHpAyah"
            value={form.noHpAyah}
            onChange={handleChange}
            placeholder="0812XXXXXXXX"
          />
        </div>
      )}

      {/* Content Tab: IBU */}
      {activeTab === 'ibu' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex gap-4 mb-2">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="statusIbu"
                value="HIDUP"
                checked={form.statusIbu === 'HIDUP'}
                onChange={handleChange}
                className="text-emerald-600"
              />
              Masih Hidup
            </label>
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="statusIbu"
                value="MENINGGAL"
                checked={form.statusIbu === 'MENINGGAL'}
                onChange={handleChange}
                className="text-emerald-600"
              />
              Almarhumah / Sudah Meninggal
            </label>
          </div>

          <InputField
            label="Nama Lengkap Ibu Kandung"
            name="namaIbu"
            required={form.statusIbu === 'HIDUP'}
            value={form.namaIbu}
            onChange={handleChange}
            error={errors.namaIbu}
            placeholder="Contoh: Siti Aminah"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Pendidikan Terakhir Ibu</label>
              <select
                name="pendidikanIbu"
                value={form.pendidikanIbu}
                onChange={handleChange}
                className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
              >
                {pendidikanOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <InputField
              label="Tahun Lahir Ibu"
              name="tahunLahirIbu"
              maxLength={4}
              value={form.tahunLahirIbu}
              onChange={handleChange}
              placeholder="Contoh: 1982"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Pekerjaan Ibu"
              name="pekerjaanIbu"
              value={form.pekerjaanIbu}
              onChange={handleChange}
              placeholder="Contoh: Ibu Rumah Tangga / PNS / Guru"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Penghasilan Bulanan Ibu</label>
              <select
                name="penghasilanIbu"
                value={form.penghasilanIbu}
                onChange={handleChange}
                className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
              >
                {penghasilanOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <InputField
            label="Nomor WhatsApp / Telepon Ibu"
            name="noHpIbu"
            value={form.noHpIbu}
            onChange={handleChange}
            placeholder="0813XXXXXXXX"
          />
        </div>
      )}

      {/* Content Tab: WALI */}
      {activeTab === 'wali' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            Diisi jika calon peserta didik tinggal atau diasuh oleh wali (kakek/nenek, paman, bibi, kakak).
          </p>

          <InputField
            label="Nama Lengkap Wali"
            name="namaWali"
            value={form.namaWali}
            onChange={handleChange}
            placeholder="Contoh: Budi Santoso"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Hubungan dengan Siswa"
              name="hubunganWali"
              value={form.hubunganWali}
              onChange={handleChange}
              placeholder="Contoh: Paman / Kakek"
            />
            <InputField
              label="Pekerjaan Wali"
              name="pekerjaanWali"
              value={form.pekerjaanWali}
              onChange={handleChange}
              placeholder="Contoh: Wiraswasta"
            />
          </div>

          <InputField
            label="Nomor Telepon / WhatsApp Wali"
            name="noHpWali"
            value={form.noHpWali}
            onChange={handleChange}
            placeholder="0857XXXXXXXX"
          />
        </div>
      )}

      {/* Bagian Akun & Notifikasi Login Orang Tua */}
      <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-emerald-950">Email Akun Orang Tua / Wali</h4>
          <p className="text-xs text-emerald-800">
            Email ini bersama nomor WhatsApp yang diisi di atas digunakan untuk masuk memeriksa status pendaftaran & mengunduh SK kelulusan.
          </p>
        </div>
        <InputField
          label="Email Aktif Orang Tua"
          name="emailOrtu"
          type="email"
          value={form.emailOrtu}
          onChange={handleChange}
          placeholder="contoh: orangtua@gmail.com"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={prevStep} className="w-full sm:w-auto">
          &larr; Kembali
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Lanjut ke Tahap 5: Berkas &rarr;
        </Button>
      </div>
    </form>
  );
};
