import React, { useState } from 'react';
import { useRegistrationWizardContext } from '../../../application/contexts/RegistrationWizardContext.js';
import { InputField } from '../common/InputField.js';
import { Button } from '../common/Button.js';
import { School, HeartPulse } from 'lucide-react';

export const Step2SekolahAsal: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useRegistrationWizardContext();

  const [form, setForm] = useState({
    namaSekolahAsal: formData.namaSekolahAsal || '',
    alamatSekolahAsal: formData.alamatSekolahAsal || '',
    nisn: formData.nisn || '',
    tinggiBadan: formData.tinggiBadan || '',
    beratBadan: formData.beratBadan || '',
    golonganDarah: formData.golonganDarah || 'O',
    penyakitBerat: formData.penyakitBerat || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.namaSekolahAsal.trim()) newErrors.namaSekolahAsal = 'Nama sekolah asal wajib diisi';
    if (!form.nisn || !/^\d{10}$/.test(form.nisn)) newErrors.nisn = 'NISN harus tepat 10 digit angka';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateFormData(form);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-600" />
            Tahap 2: Pendidikan Sebelumnya & Fisik
          </h3>
          <p className="text-xs text-slate-500">Formulir Bagian B - Riwayat SD/MI & kesehatan calon siswa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Nama Sekolah Asal (SD / MI)"
          name="namaSekolahAsal"
          required
          value={form.namaSekolahAsal}
          onChange={handleChange}
          error={errors.namaSekolahAsal}
          placeholder="Contoh: SD Negeri Pondok Cabe Ilir 02"
        />

        <InputField
          label="NISN (Nomor Induk Siswa Nasional)"
          name="nisn"
          required
          maxLength={10}
          value={form.nisn}
          onChange={handleChange}
          error={errors.nisn}
          placeholder="10 digit nomor (misal: 0123456789)"
          helperText="Dapat dilihat pada rapor SD atau kartu NISN resmi"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">Alamat Sekolah Asal</label>
        <textarea
          name="alamatSekolahAsal"
          rows={2}
          value={form.alamatSekolahAsal}
          onChange={handleChange}
          className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 transition-all"
          placeholder="Contoh: Jl. Pondok Cabe Raya, Pamulang, Tangerang Selatan"
        />
      </div>

      {/* Bagian Fisik & Kesehatan */}
      <div className="pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <HeartPulse className="w-4 h-4 text-rose-500" />
          Keterangan Fisik & Kesehatan
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField
            label="Tinggi Badan (cm)"
            name="tinggiBadan"
            type="number"
            value={form.tinggiBadan}
            onChange={handleChange}
            placeholder="Contoh: 145"
          />

          <InputField
            label="Berat Badan (kg)"
            name="beratBadan"
            type="number"
            value={form.beratBadan}
            onChange={handleChange}
            placeholder="Contoh: 42"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Golongan Darah</label>
            <select
              name="golonganDarah"
              value={form.golonganDarah}
              onChange={handleChange}
              className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
              <option value="-">Tidak Tahu / Belum Cek</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <InputField
            label="Riwayat Penyakit Berat (Opsional)"
            name="penyakitBerat"
            value={form.penyakitBerat}
            onChange={handleChange}
            placeholder="Kosongkan jika tidak ada riwayat penyakit berat"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={prevStep}>
          &larr; Kembali
        </Button>
        <Button type="submit">
          Lanjut ke Tahap 3: Alamat Domisili &rarr;
        </Button>
      </div>
    </form>
  );
};
