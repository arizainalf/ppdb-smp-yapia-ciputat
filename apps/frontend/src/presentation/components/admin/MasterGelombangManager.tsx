import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '../common/Button.js';
import { InputField } from '../common/InputField.js';

export interface GelombangItem {
  id: number;
  namaGelombang: string;
  tahunAjaran: string;
  tanggalBuka: string;
  tanggalTutup: string;
  kuotaMaksimal: number;
  kuotaTerisi: number;
  biayaPendaftaran: number;
  potonganBiaya: number;
  isActive: boolean;
}

export const MasterGelombangManager: React.FC = () => {
  const [gelombangList, setGelombangList] = useState<GelombangItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<GelombangItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGelombang = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/gelombang`);
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        setGelombangList(json.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data gelombang:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGelombang();
  }, []);

  const handleEdit = (item: GelombangItem) => {
    setEditingItem({ ...item, potonganBiaya: item.potonganBiaya || 0 });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    const nextId = gelombangList.length + 1;
    setEditingItem({
      id: 0,
      namaGelombang: `Gelombang ${nextId}`,
      tahunAjaran: '2027/2028',
      tanggalBuka: '2027-01-01',
      tanggalTutup: '2027-04-30',
      kuotaMaksimal: 50,
      kuotaTerisi: 0,
      biayaPendaftaran: 2000000,
      potonganBiaya: 0,
      isActive: false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const isEdit = editingItem.id && editingItem.id > 0;
      const url = isEdit
        ? `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/gelombang/${editingItem.id}`
        : `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/gelombang`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (res.ok) {
        await fetchGelombang();
      }
    } catch (err) {
      console.error('Gagal menyimpan gelombang:', err);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleToggleActive = async (id: number) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/gelombang/${id}/toggle`, {
        method: 'PATCH',
      });
      if (res.ok) {
        await fetchGelombang();
      }
    } catch (err) {
      console.error('Gagal mengubah status gelombang:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus data gelombang ini?')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:8000"}`}/api/v1/gelombang/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          await fetchGelombang();
        }
      } catch (err) {
        console.error('Gagal menghapus gelombang:', err);
      }
    }
  };

  const getGelombangStatus = (g: GelombangItem) => {
    if (!g.isActive) {
      return {
        label: 'OFF (Ditutup)',
        badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
        description: 'Pendaftaran ditutup/dijeda manual oleh panitia.',
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (g.kuotaTerisi >= g.kuotaMaksimal) {
      return {
        label: 'Kuota Penuh',
        badgeClass: 'bg-rose-100 text-rose-700 border border-rose-200',
        description: 'Daya tampung gelombang ini telah terpenuhi.',
      };
    }

    if (todayStr < g.tanggalBuka) {
      return {
        label: 'Akan Datang',
        badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
        description: `Pendaftaran dibuka mulai ${g.tanggalBuka}.`,
      };
    }

    if (todayStr > g.tanggalTutup) {
      return {
        label: 'Jadwal Berakhir',
        badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
        description: `Batas waktu pendaftaran berakhir pada ${g.tanggalTutup}.`,
      };
    }

    return {
      label: 'Sedang Dibuka',
      badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      description: 'Pendaftaran sedang aktif menerima calon siswa baru.',
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800">Master Data Gelombang Pendaftaran</h3>
          <p className="text-xs text-slate-500">
            Atur periode pendaftaran, kuota daya tampung, tarif biaya normal, dan potongan harga per gelombang.
          </p>
        </div>
        <Button onClick={handleAddNew} className="text-xs py-2">
          <Plus className="w-4 h-4" /> Tambah Gelombang Baru
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Memuat master data gelombang dari database...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gelombangList.map((g) => {
            const statusInfo = getGelombangStatus(g);
            return (
              <div
                key={g.id}
              className={`p-5 rounded-2xl bg-white border transition-all ${
                g.isActive ? 'border-emerald-500 shadow-xs' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">{g.namaGelombang}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.badgeClass}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Tahun Ajaran: {g.tahunAjaran}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(g)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800"
                    title="Edit Gelombang"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700"
                    title="Hapus Gelombang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Jadwal Pendaftaran:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {g.tanggalBuka} s/d {g.tanggalTutup}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Biaya Formulir:</span>
                  {g.potonganBiaya > 0 ? (
                    <span className="mt-0.5 block">
                      <span className="text-slate-400 line-through text-[11px] font-semibold">
                        Rp {g.biayaPendaftaran.toLocaleString('id-ID')}
                      </span>
                      <span className="font-extrabold text-emerald-700 block">
                        Rp {(Math.max(0, g.biayaPendaftaran - g.potonganBiaya)).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Potongan gelombang ini: Rp {g.potonganBiaya.toLocaleString('id-ID')}
                      </span>
                    </span>
                  ) : (
                    <span className="font-extrabold text-emerald-700 mt-0.5 block">
                      Rp {g.biayaPendaftaran.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block">Daya Tampung / Kuota:</span>
                  <span className="font-bold text-slate-800">{g.kuotaMaksimal} Siswa</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Siswa Terdaftar:</span>
                  <span className="font-bold text-emerald-800">{g.kuotaTerisi} Siswa</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">
                    Sakelar Gelombang (Master Switch)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {statusInfo.description}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-black tracking-wider ${
                      g.isActive ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {g.isActive ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={g.isActive}
                    onClick={() => handleToggleActive(g.id)}
                    title={g.isActive ? 'Klik untuk mematikan (OFF)' : 'Klik untuk mengaktifkan (ON)'}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      g.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        g.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col"
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold text-sm">
                {editingItem.id ? 'Edit Gelombang Pendaftaran' : 'Tambah Gelombang'}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <InputField
                label="Nama Gelombang"
                required
                value={editingItem.namaGelombang}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, namaGelombang: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Tahun Ajaran"
                  required
                  value={editingItem.tahunAjaran}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, tahunAjaran: e.target.value })
                  }
                />
                <InputField
                  label="Kuota Maksimal (Siswa)"
                  type="number"
                  required
                  value={editingItem.kuotaMaksimal}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      kuotaMaksimal: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Tanggal Buka"
                  type="date"
                  required
                  value={editingItem.tanggalBuka}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, tanggalBuka: e.target.value })
                  }
                />
                <InputField
                  label="Tanggal Tutup"
                  type="date"
                  required
                  value={editingItem.tanggalTutup}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, tanggalTutup: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Biaya Normal (IDR)"
                  type="number"
                  required
                  value={editingItem.biayaPendaftaran}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      biayaPendaftaran: Number(e.target.value),
                    })
                  }
                />
                <InputField
                  label="Potongan Gelombang (IDR)"
                  type="number"
                  required
                  value={editingItem.potonganBiaya}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      potonganBiaya: Math.max(0, Number(e.target.value)),
                    })
                  }
                />
              </div>

              <p className="text-[11px] text-slate-500 -mt-2">
                Tagihan pendaftar = biaya normal &minus; potongan gelombang &minus; bantuan Pemkot Tangsel
                (Rp 1.800.000, otomatis untuk domisili Kota Tangerang Selatan).
              </p>

              <div className="pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Status Sakelar Gelombang (ON/OFF)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {editingItem.isActive
                        ? 'Status ON: Pendaftaran diizinkan aktif sesuai kalender.'
                        : 'Status OFF: Pendaftaran ditutup / dinonaktifkan sementara.'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-xs font-black tracking-wide ${
                        editingItem.isActive ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {editingItem.isActive ? 'ON' : 'OFF'}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={editingItem.isActive}
                      onClick={() =>
                        setEditingItem({ ...editingItem, isActive: !editingItem.isActive })
                      }
                      title={editingItem.isActive ? 'Klik untuk mematikan (OFF)' : 'Klik untuk mengaktifkan (ON)'}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        editingItem.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          editingItem.isActive ? 'translate-x-5' : 'translate-x-0'
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
                <Save className="w-4 h-4" /> Simpan Data Gelombang
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
