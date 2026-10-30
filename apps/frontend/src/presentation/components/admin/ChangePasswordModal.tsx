import React, { useState } from 'react';
import { X, KeyRound, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button.js';
import { InputField } from '../common/InputField.js';
import { useAuth } from '../../../application/contexts/AuthContext.js';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const { changePassword } = useAuth();
  const [form, setForm] = useState({ passwordLama: '', passwordBaru: '', konfirmasi: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.passwordBaru.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (form.passwordBaru !== form.konfirmasi) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
    const res = await changePassword(form.passwordLama, form.passwordBaru);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Kata sandi berhasil diubah.');
    } else {
      setError(res.message || 'Gagal mengubah kata sandi.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-sm">Ubah Kata Sandi Panitia</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-6 space-y-4 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">{successMsg}</p>
            <p className="text-xs text-slate-500">
              Sesi Anda tetap aktif. Gunakan kata sandi baru saat login berikutnya.
            </p>
            <Button onClick={onClose} className="w-full py-2.5 text-xs">
              Tutup
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-5 space-y-4">
              <InputField
                label="Kata Sandi Lama"
                name="passwordLama"
                type="password"
                required
                autoComplete="current-password"
                value={form.passwordLama}
                onChange={handleChange}
                placeholder="Masukkan kata sandi saat ini"
              />
              <InputField
                label="Kata Sandi Baru"
                name="passwordBaru"
                type="password"
                required
                autoComplete="new-password"
                value={form.passwordBaru}
                onChange={handleChange}
                placeholder="Minimal 8 karakter"
                helperText="Minimal 8 karakter. Disarankan kombinasi huruf dan angka."
              />
              <InputField
                label="Konfirmasi Kata Sandi Baru"
                name="konfirmasi"
                type="password"
                required
                autoComplete="new-password"
                value={form.konfirmasi}
                onChange={handleChange}
                placeholder="Ulangi kata sandi baru"
              />

              {error && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs py-2"
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" className="text-xs py-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Simpan Kata Sandi Baru
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
