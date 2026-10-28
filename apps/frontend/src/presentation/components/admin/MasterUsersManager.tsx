import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Phone, Mail, Trash2, Edit2, X, Save } from 'lucide-react';
import { Button } from '../common/Button.js';
import { InputField } from '../common/InputField.js';

export interface AdminUserItem {
  id: string;
  namaLengkap: string;
  noHp: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'BENDAHARA' | 'KEPSEK';
  isActive: boolean;
}

export const MasterUsersManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('yapia_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/users`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        setUsers(json.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data panitia:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddNew = () => {
    setEditingUser({
      id: '',
      namaLengkap: '',
      noHp: '',
      email: '',
      role: 'OPERATOR',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (u: AdminUserItem) => {
    setEditingUser({ ...u });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus panitia ini?')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/users/${id}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
        if (res.ok) {
          await fetchUsers();
        }
      } catch (err) {
        console.error('Gagal menghapus panitia:', err);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/users/${id}/toggle`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Gagal mengubah status panitia:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const isEdit = Boolean(editingUser.id);
      const url = isEdit
        ? `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/users/${editingUser.id}`
        : `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/users`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(editingUser),
      });

      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Gagal menyimpan panitia:', err);
    }

    setIsModalOpen(false);
    setEditingUser(null);
  };

  const roleBadges: Record<AdminUserItem['role'], { label: string; class: string }> = {
    ADMIN: { label: 'Super Admin', class: 'bg-purple-100 text-purple-800' },
    OPERATOR: { label: 'Verifikator Berkas', class: 'bg-blue-100 text-blue-800' },
    BENDAHARA: { label: 'Bendahara Admisi', class: 'bg-amber-100 text-amber-800' },
    KEPSEK: { label: 'Kepala Sekolah', class: 'bg-emerald-100 text-emerald-800' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">Master Data Akun Panitia PPDB</h3>
          <p className="text-xs text-slate-500">
            Kelola hak akses panitia verifikator, bendahara pendaftaran, dan kepala sekolah.
          </p>
        </div>
        <Button onClick={handleAddNew} className="text-xs py-2">
          <UserPlus className="w-4 h-4" /> Tambah Akun Panitia
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Memuat data panitia dari database...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Panitia</th>
                  <th className="py-3 px-4">Kontak (WhatsApp / Email)</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{u.namaLengkap}</span>
                      <span className="text-[11px] text-slate-400 font-mono">ID: {u.id}</span>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <span className="flex items-center gap-1.5 text-slate-800 font-mono">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" /> {u.noHp}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          roleBadges[u.role].class
                        }`}
                      >
                        <Shield className="w-3 h-3" /> {roleBadges[u.role].label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span className={`text-[11px] font-black ${u.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {u.isActive ? 'ON' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={u.isActive}
                          onClick={() => handleToggleStatus(u.id)}
                          title={u.isActive ? 'Klik untuk nonaktifkan panitia' : 'Klik untuk aktifkan panitia'}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                            u.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              u.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(u)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800"
                          title="Edit Panitia"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700"
                          title="Hapus Panitia"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Edit / Add User */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm">
                {editingUser.namaLengkap ? 'Edit Data Panitia' : 'Tambah Akun Panitia'}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <InputField
                label="Nama Lengkap & Gelar"
                required
                value={editingUser.namaLengkap}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, namaLengkap: e.target.value })
                }
                placeholder="Contoh: Budi Santoso, S.Pd"
              />

              <InputField
                label="Nomor WhatsApp"
                required
                value={editingUser.noHp}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, noHp: e.target.value })
                }
                placeholder="0812XXXXXXXX"
              />

              <InputField
                label="Email Resmi Sekolah"
                type="email"
                required
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                placeholder="panitia@smp-yapia.sch.id"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Peran & Hak Akses</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as AdminUserItem['role'],
                    })
                  }
                  className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-100"
                >
                  <option value="OPERATOR">Verifikator Berkas (Operator PPDB)</option>
                  <option value="BENDAHARA">Bendahara (Verifikasi Pembayaran)</option>
                  <option value="KEPSEK">Kepala Sekolah (Lihat & Pleno Kelulusan)</option>
                  <option value="ADMIN">Super Admin (Akses Penuh)</option>
                </select>
              </div>

              <div className="pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Status Akses Akun (ON/OFF)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {editingUser.isActive
                        ? 'Status ON: Panitia diizinkan login ke portal admin.'
                        : 'Status OFF: Akun dinonaktifkan sementara.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-black tracking-wide ${
                        editingUser.isActive ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {editingUser.isActive ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={editingUser.isActive}
                      onClick={() =>
                        setEditingUser({ ...editingUser, isActive: !editingUser.isActive })
                      }
                      title={editingUser.isActive ? 'Klik untuk nonaktifkan (OFF)' : 'Klik untuk aktifkan (ON)'}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        editingUser.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          editingUser.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="text-xs py-2"
              >
                Batal
              </Button>
              <Button type="submit" className="text-xs py-2">
                <Save className="w-4 h-4" /> Simpan Data Panitia
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
