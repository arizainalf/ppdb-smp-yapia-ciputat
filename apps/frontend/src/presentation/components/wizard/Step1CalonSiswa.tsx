import React, { useState } from 'react';
import { useRegistrationWizard } from '../../../application/hooks/useRegistrationWizard.js';
import { createCalonSiswaSchema, CreateCalonSiswaInput } from '@yapia/shared';
import { InputField } from '../common/InputField.js';
import { Button } from '../common/Button.js';
import { z } from 'zod';

export const Step1CalonSiswa: React.FC = () => {
  const { formData, submitStep1, isLoading, error } = useRegistrationWizard();

  const [form, setForm] = useState<CreateCalonSiswaInput>({
    namaLengkap: formData.namaLengkap || '',
    jenisKelamin: formData.jenisKelamin || 'L',
    tempatLahir: formData.tempatLahir || '',
    tanggalLahir: formData.tanggalLahir || '',
    agama: formData.agama || 'Islam',
    noHpSiswa: formData.noHpSiswa || '',
    gelombangId: formData.gelombangId || 1,
    jalurPendaftaran: (formData.jalurPendaftaran as any) || 'REGULER',
    nomorKipSktm: formData.nomorKipSktm || '',
    pdpConsent: true,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: CreateCalonSiswaInput) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectJalur = (jalur: 'REGULER' | 'AFIRMASI' | 'PRESTASI') => {
    setForm((prev) => ({ ...prev, jalurPendaftaran: jalur }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.jalurPendaftaran === 'AFIRMASI' && !form.nomorKipSktm?.trim()) {
        setFieldErrors((prev) => ({
          ...prev,
          nomorKipSktm: 'Nomor KIP / PIP / Surat Keterangan Tidak Mampu (SKTM) wajib diisi untuk jalur afirmasi',
        }));
        return;
      }
      const validated = createCalonSiswaSchema.parse(form);
      await submitStep1(validated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) errors[String(e.path[0])] = e.message;
        });
        setFieldErrors(errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-800">Tahap 1: Data Pribadi & Jalur Pendaftaran</h3>
        <p className="text-xs text-slate-500">Pilih jalur pendaftaran dan isi data calon siswa sesuai dokumen resmi.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Pilihan Jalur Pendaftaran */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Jalur Pendaftaran <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => handleSelectJalur('REGULER')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              form.jalurPendaftaran === 'REGULER'
                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800">1. Jalur Reguler</span>
              <input
                type="radio"
                name="jalurPendaftaran"
                checked={form.jalurPendaftaran === 'REGULER'}
                onChange={() => handleSelectJalur('REGULER')}
                className="text-emerald-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Jalur pendaftaran umum gelombang aktif SMP YAPIA.</p>
          </div>

          <div
            onClick={() => handleSelectJalur('AFIRMASI')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              form.jalurPendaftaran === 'AFIRMASI'
                ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800">2. Jalur Afirmasi (KIP)</span>
              <input
                type="radio"
                name="jalurPendaftaran"
                checked={form.jalurPendaftaran === 'AFIRMASI'}
                onChange={() => handleSelectJalur('AFIRMASI')}
                className="text-amber-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Pemegang KIP, PIP, KKS, atau SKTM (Subsidi Infak).</p>
          </div>

          <div
            onClick={() => handleSelectJalur('PRESTASI')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              form.jalurPendaftaran === 'PRESTASI'
                ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-800">3. Jalur Prestasi</span>
              <input
                type="radio"
                name="jalurPendaftaran"
                checked={form.jalurPendaftaran === 'PRESTASI'}
                onChange={() => handleSelectJalur('PRESTASI')}
                className="text-blue-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Tahfidz Qur'an, Juara Akademik, Seni, atau Olahraga.</p>
          </div>
        </div>

        {/* Input Tambahan Jika Memilih Afirmasi */}
        {form.jalurPendaftaran === 'AFIRMASI' && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2 mt-1 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">
                Pencatatan Data Afirmasi KIP / PIP / SKTM
              </span>
              <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                Keringanan Infak
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Sesuai audit tata kelola SPMB, berkas pendaftar pemegang KIP/SKTM direkap secara terpisah untuk validasi bantuan pendidikan. Mohon masukkan nomor kartu atau nomor surat keterangan resmi.
            </p>
            <InputField
              label="Nomor Kartu KIP / PIP / KKS / No. Surat SKTM"
              name="nomorKipSktm"
              required
              value={form.nomorKipSktm || ''}
              onChange={handleChange}
              error={fieldErrors.nomorKipSktm}
              placeholder="Contoh: KIP-2026-992138 atau 470/12/SKTM/2026"
            />
          </div>
        )}
      </div>

      <InputField
        label="Nama Lengkap (Sesuai Ijazah)"
        name="namaLengkap"
        required
        value={form.namaLengkap}
        onChange={handleChange}
        error={fieldErrors.namaLengkap}
        placeholder="Contoh: Muhammad Alka Alhabsy"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">
          Jenis Kelamin <span className="text-rose-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name="jenisKelamin"
              value="L"
              checked={form.jenisKelamin === 'L'}
              onChange={handleChange}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            Laki-laki
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="radio"
              name="jenisKelamin"
              value="P"
              checked={form.jenisKelamin === 'P'}
              onChange={handleChange}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            Perempuan
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Tempat Lahir"
          name="tempatLahir"
          required
          value={form.tempatLahir}
          onChange={handleChange}
          error={fieldErrors.tempatLahir}
          placeholder="Contoh: Tangerang Selatan"
        />
        <InputField
          label="Tanggal Lahir"
          type="date"
          name="tanggalLahir"
          required
          value={form.tanggalLahir}
          onChange={handleChange}
          error={fieldErrors.tanggalLahir}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button type="submit" isLoading={isLoading}>
          Lanjut ke Tahap 2: Sekolah Asal &rarr;
        </Button>
      </div>
    </form>
  );
};
