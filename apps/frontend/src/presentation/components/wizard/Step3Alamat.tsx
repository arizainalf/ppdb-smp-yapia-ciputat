import React, { useState } from 'react';
import { useRegistrationWizardContext } from '../../../application/contexts/RegistrationWizardContext.js';
import { InputField } from '../common/InputField.js';
import { Button } from '../common/Button.js';
import { Home } from 'lucide-react';

export const Step3Alamat: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useRegistrationWizardContext();

  const [form, setForm] = useState({
    alamatLengkap: formData.alamatLengkap || '',
    rt: formData.rt || '',
    rw: formData.rw || '',
    noRumah: formData.noRumah || '',
    kelurahan: formData.kelurahan || '',
    kecamatan: formData.kecamatan || '',
    kotaKabupaten: formData.kotaKabupaten || 'Tangerang Selatan',
    provinsi: formData.provinsi || 'Banten',
    kodePos: formData.kodePos || '',
    tinggalBersama: formData.tinggalBersama || 'Orang Tua',
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

    if (!form.alamatLengkap.trim()) newErrors.alamatLengkap = 'Jalan / nama perumahan wajib diisi';
    if (!form.kelurahan.trim()) newErrors.kelurahan = 'Kelurahan wajib diisi';
    if (!form.kecamatan.trim()) newErrors.kecamatan = 'Kecamatan wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateFormData(form as any);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-600" />
          Tahap 3: Keterangan Tempat Tinggal
        </h3>
        <p className="text-xs text-slate-500">Formulir Bagian C - Domisili tempat tinggal calon peserta didik saat ini.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <InputField
          label="Alamat Jalan / Komplek / Gang"
          name="alamatLengkap"
          required
          value={form.alamatLengkap}
          onChange={handleChange}
          error={errors.alamatLengkap}
          placeholder="Contoh: Jl. Talas II, Gang Sawo"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <InputField
          label="RT"
          name="rt"
          maxLength={3}
          value={form.rt}
          onChange={handleChange}
          placeholder="06"
        />
        <InputField
          label="RW"
          name="rw"
          maxLength={3}
          value={form.rw}
          onChange={handleChange}
          placeholder="01"
        />
        <InputField
          label="Nomor Rumah"
          name="noRumah"
          value={form.noRumah}
          onChange={handleChange}
          placeholder="No. 19"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Kelurahan / Desa"
          name="kelurahan"
          required
          value={form.kelurahan}
          onChange={handleChange}
          error={errors.kelurahan}
          placeholder="Contoh: Pondok Cabe Ilir"
        />
        <InputField
          label="Kecamatan"
          name="kecamatan"
          required
          value={form.kecamatan}
          onChange={handleChange}
          error={errors.kecamatan}
          placeholder="Contoh: Pamulang"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField
          label="Kota / Kabupaten"
          name="kotaKabupaten"
          required
          value={form.kotaKabupaten}
          onChange={handleChange}
        />
        <InputField
          label="Provinsi"
          name="provinsi"
          required
          value={form.provinsi}
          onChange={handleChange}
        />
        <InputField
          label="Kode Pos"
          name="kodePos"
          maxLength={5}
          value={form.kodePos}
          onChange={handleChange}
          placeholder="15418"
        />
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <label className="text-sm font-semibold text-slate-700">Tinggal Bersama Siapa?</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Orang Tua', 'Wali', 'Asrama', 'Lainnya'].map((opt) => (
            <label
              key={opt}
              className={`flex items-center gap-2 p-3 rounded-lg border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                form.tinggalBersama === opt
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="tinggalBersama"
                value={opt}
                checked={form.tinggalBersama === opt}
                onChange={handleChange}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={prevStep}>
          &larr; Kembali
        </Button>
        <Button type="submit">
          Lanjut ke Tahap 4: Orang Tua / Wali &rarr;
        </Button>
      </div>
    </form>
  );
};
