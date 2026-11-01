import React, { useState, useMemo } from 'react';
import { useRegistrationWizardContext } from '../../../application/contexts/RegistrationWizardContext.js';
import { InputField } from '../common/InputField.js';
import { Button } from '../common/Button.js';
import { Home, Landmark, CheckCircle2 } from 'lucide-react';
import {
  getProvinsiList,
  getKotaList,
  getKecamatanList,
  getKelurahanList,
  isEligibleBantuanTangsel,
  BANTUAN_TANGSEL_CONFIG,
} from '@yapia/shared';

export const Step3Alamat: React.FC = () => {
  const { formData, updateFormData, nextStep, prevStep } = useRegistrationWizardContext();

  const [form, setForm] = useState({
    alamatLengkap: formData.alamatLengkap || '',
    rt: formData.rt || '',
    rw: formData.rw || '',
    noRumah: formData.noRumah || '',
    provinsi: formData.provinsi || 'Banten',
    kotaKabupaten: formData.kotaKabupaten || 'Kota Tangerang Selatan',
    kecamatan: formData.kecamatan || 'Ciputat',
    kelurahan: formData.kelurahan || 'Ciputat',
    kodePos: formData.kodePos || '15411',
    tinggalBersama: formData.tinggalBersama || 'Orang Tua',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const provinsiList = useMemo(() => getProvinsiList(), []);
  const kotaList = useMemo(() => getKotaList(form.provinsi), [form.provinsi]);
  const kecamatanList = useMemo(() => getKecamatanList(form.kotaKabupaten), [form.kotaKabupaten]);
  const kelurahanList = useMemo(() => getKelurahanList(form.kecamatan), [form.kecamatan]);

  const isTangsel = useMemo(() => isEligibleBantuanTangsel(form.kotaKabupaten), [form.kotaKabupaten]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProv = e.target.value;
    const availableKota = getKotaList(newProv);
    const defaultKota = availableKota[0] || '';
    const availableKec = getKecamatanList(defaultKota);
    const defaultKec = availableKec[0] || '';
    const availableKel = getKelurahanList(defaultKec);
    const defaultKel = availableKel[0]?.kelurahan || '';
    const defaultKodePos = availableKel[0]?.kodePos || '';

    setForm((prev) => ({
      ...prev,
      provinsi: newProv,
      kotaKabupaten: defaultKota,
      kecamatan: defaultKec,
      kelurahan: defaultKel,
      kodePos: defaultKodePos,
    }));
  };

  const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKota = e.target.value;
    const availableKec = getKecamatanList(newKota);
    const defaultKec = availableKec[0] || '';
    const availableKel = getKelurahanList(defaultKec);
    const defaultKel = availableKel[0]?.kelurahan || '';
    const defaultKodePos = availableKel[0]?.kodePos || '';

    setForm((prev) => ({
      ...prev,
      kotaKabupaten: newKota,
      kecamatan: defaultKec,
      kelurahan: defaultKel,
      kodePos: defaultKodePos,
    }));
  };

  const handleKecamatanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKec = e.target.value;
    const availableKel = getKelurahanList(newKec);
    const defaultKel = availableKel[0]?.kelurahan || '';
    const defaultKodePos = availableKel[0]?.kodePos || '';

    setForm((prev) => ({
      ...prev,
      kecamatan: newKec,
      kelurahan: defaultKel,
      kodePos: defaultKodePos,
    }));
  };

  const handleKelurahanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKel = e.target.value;
    const matched = kelurahanList.find((k) => k.kelurahan === newKel);
    setForm((prev) => ({
      ...prev,
      kelurahan: newKel,
      kodePos: matched?.kodePos || prev.kodePos,
    }));
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
          Tahap 3: Keterangan Tempat Tinggal & Domisili
        </h3>
        <p className="text-xs text-slate-500">Formulir Bagian C - Domisili tempat tinggal calon peserta didik saat ini.</p>
      </div>

      {/* Banner Khusus Bantuan Pemkot Tangerang Selatan */}
      {isTangsel && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl flex items-start gap-3.5 shadow-2xs animate-in fade-in duration-200">
          <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/70 px-2.5 py-0.5 rounded-full">
                Program Daerah
              </span>
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Memenuhi Syarat Domisili Tangsel
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mt-1">
              Bantuan Biaya Pendidikan Pemerintah Kota Tangerang Selatan {`(${BANTUAN_TANGSEL_CONFIG.PERIODE_LABEL})`}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Calon peserta didik yang berdomisili di wilayah Kota Tangerang Selatan berhak diajukan dalam kuota resmi penerima Bantuan Biaya Pendidikan dari Pemerintah Kota Tangerang Selatan {`sebesar ${BANTUAN_TANGSEL_CONFIG.PERIODE_LABEL}.`}
            </p>
          </div>
        </div>
      )}

      {/* Hierarki Wilayah Cascading Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Provinsi <span className="text-rose-500">*</span>
          </label>
          <select
            name="provinsi"
            value={form.provinsi}
            onChange={handleProvinsiChange}
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
          >
            {provinsiList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Kota / Kabupaten <span className="text-rose-500">*</span>
          </label>
          <select
            name="kotaKabupaten"
            value={form.kotaKabupaten}
            onChange={handleKotaChange}
            className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100 font-medium"
          >
            {kotaList.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kecamatan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Kecamatan <span className="text-rose-500">*</span>
          </label>
          {kecamatanList.length > 0 ? (
            <select
              name="kecamatan"
              value={form.kecamatan}
              onChange={handleKecamatanChange}
              className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
            >
              {kecamatanList.map((kec) => (
                <option key={kec} value={kec}>
                  {kec}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="kecamatan"
              value={form.kecamatan}
              onChange={handleChange}
              placeholder="Masukkan nama kecamatan"
              className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
            />
          )}
        </div>

        {/* Kelurahan */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">
            Kelurahan / Desa <span className="text-rose-500">*</span>
          </label>
          {kelurahanList.length > 0 ? (
            <select
              name="kelurahan"
              value={form.kelurahan}
              onChange={handleKelurahanChange}
              className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
            >
              {kelurahanList.map((kel) => (
                <option key={kel.kelurahan} value={kel.kelurahan}>
                  {kel.kelurahan} (Kode Pos: {kel.kodePos})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="kelurahan"
              value={form.kelurahan}
              onChange={handleChange}
              placeholder="Masukkan nama kelurahan"
              className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
            />
          )}
        </div>
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

      <div className="grid grid-cols-4 gap-3">
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
        <InputField
          label="Kode Pos"
          name="kodePos"
          maxLength={5}
          value={form.kodePos}
          onChange={handleChange}
          placeholder="15411"
          helperText="Otomatis terisi"
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

      <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={prevStep} className="w-full sm:w-auto">
          &larr; Kembali
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Lanjut ke Tahap 4: Orang Tua &rarr;
        </Button>
      </div>
    </form>
  );
};
