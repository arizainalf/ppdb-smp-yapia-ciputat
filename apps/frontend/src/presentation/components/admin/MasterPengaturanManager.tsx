import React, { useState, useEffect } from 'react';
import { Settings, Save, Power, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button.js';
import { InputField } from '../common/InputField.js';

interface PengaturanData {
  pendaftaranAktif: boolean;
  tahunAjaran: string;
}

interface KontakSekolah {
  namaSekolah: string;
  deskripsiSekolah: string;
  npsn: string;
  akreditasi: string;
  alamatSekolah: string;
  telepon: string;
  whatsapp: string;
  email: string;
  jadwalPelayanan: string;
}

const KONTAK_FIELDS: Array<{ key: keyof KontakSekolah; label: string; textarea?: boolean }> = [
  { key: 'namaSekolah', label: 'Nama Sekolah' },
  { key: 'npsn', label: 'NPSN' },
  { key: 'akreditasi', label: 'Akreditasi' },
  { key: 'telepon', label: 'Telepon' },
  { key: 'whatsapp', label: 'WhatsApp Helpdesk' },
  { key: 'email', label: 'Email PPDB' },
  { key: 'alamatSekolah', label: 'Alamat Lengkap', textarea: true },
  { key: 'deskripsiSekolah', label: 'Deskripsi / Visi Singkat', textarea: true },
  { key: 'jadwalPelayanan', label: 'Jadwal Pelayanan', textarea: true },
];

export const MasterPengaturanManager: React.FC = () => {
  const [data, setData] = useState<PengaturanData>({ pendaftaranAktif: true, tahunAjaran: '2026/2027' });
  const [kontak, setKontak] = useState<KontakSekolah>({
    namaSekolah: '',
    deskripsiSekolah: '',
    npsn: '',
    akreditasi: '',
    alamatSekolah: '',
    telepon: '',
    whatsapp: '',
    email: '',
    jadwalPelayanan: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('yapia_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`;

  useEffect(() => {
    fetch(`${apiUrl}/api/v1/pengaturan`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success' && json.data) {
          setData({
            pendaftaranAktif: Boolean(json.data.pendaftaranAktif),
            tahunAjaran: json.data.tahunAjaran || '2026/2027',
          });
          if (json.data.kontak) {
            setKontak((prev) => ({ ...prev, ...json.data.kontak }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [apiUrl]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`${apiUrl}/api/v1/pengaturan`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ ...data, kontak }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Gagal menyimpan');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-sm gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Memuat pengaturan...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 tracking-tight">Pengaturan PPDB</h3>
          <p className="text-xs text-slate-500">Saklar buka/tutup pendaftaran dan tahun ajaran aktif secara global.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">{error}</div>
      )}
      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Pengaturan tersimpan dan langsung berlaku.
        </div>
      )}

      {/* Toggle pendaftaran */}
      <div className={`p-5 rounded-2xl border-2 transition-all ${
        data.pendaftaranAktif ? 'border-emerald-300 bg-emerald-50/50' : 'border-rose-300 bg-rose-50/50'
      }`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg shrink-0 ${
              data.pendaftaranAktif ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Status Pendaftaran:{' '}
                <span className={data.pendaftaranAktif ? 'text-emerald-700' : 'text-rose-600'}>
                  {data.pendaftaranAktif ? 'DIBUKA' : 'DITUTUP'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Saat ditutup, formulir pendaftaran online langsung ditolak oleh server dan wizard tidak dapat diakses publik.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setData((p) => ({ ...p, pendaftaranAktif: !p.pendaftaranAktif }))}
            className={`relative w-14 h-7 rounded-full transition-colors shrink-0 cursor-pointer ${
              data.pendaftaranAktif ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
            aria-label="Toggle pendaftaran"
          >
            <span
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                data.pendaftaranAktif ? 'left-7' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Tahun ajaran */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
        <h4 className="text-sm font-bold text-slate-900">Tahun Ajaran Aktif</h4>
        <InputField
          label="Tahun Ajaran"
          name="tahunAjaran"
          type="text"
          required
          value={data.tahunAjaran}
          onChange={(e) => setData((p) => ({ ...p, tahunAjaran: e.target.value }))}
          placeholder="Contoh: 2026/2027"
        />
        <p className="text-[11px] text-slate-500">
          Ditampilkan pada wizard pendaftaran. Per gelombang tetap memiliki tahun ajarannya sendiri (menu Gelombang).
        </p>
      </div>

      {/* Info sekolah & kontak */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Informasi Sekolah & Kontak</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Ditampilkan di footer beranda, halaman cek status, dan digunakan sebagai identitas resmi sistem.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {KONTAK_FIELDS.map((f) => (
            <div key={f.key} className={f.textarea ? 'sm:col-span-2' : ''}>
              {f.textarea ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{f.label}</label>
                  <textarea
                    rows={2}
                    value={kontak[f.key]}
                    onChange={(e) => setKontak((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y"
                  />
                </div>
              ) : (
                <InputField
                  label={f.label}
                  name={f.key}
                  type="text"
                  value={kontak[f.key]}
                  onChange={(e) => setKontak((p) => ({ ...p, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full py-3 font-bold">
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Simpan Pengaturan
      </Button>
    </div>
  );
};
