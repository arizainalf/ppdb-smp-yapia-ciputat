import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Building2,
  MapPin,
  CheckCircle,
  Copy,
  BookOpen,
} from 'lucide-react';
import { AdminCalonSiswaItem } from './PendaftarDetailModal.js';
import { Button } from '../common/Button.js';

interface EksporModalProps {
  data: AdminCalonSiswaItem[];
  onClose: () => void;
}

export const EksporDapodikModal: React.FC<EksporModalProps> = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState<'baku' | 'sekolah' | 'observasi'>('baku');
  const [filterHanyaFisikValid, setFilterHanyaFisikValid] = useState(false);
  const [filterHanyaLolos, setFilterHanyaLolos] = useState(false);
  const [copiedSchool, setCopiedSchool] = useState<string | null>(null);

  // Filtered dataset
  const targetData = data.filter((item) => {
    if (filterHanyaFisikValid && !item.verifikasiFisik?.verified) return false;
    if (filterHanyaLolos && !['VERIFIED', 'LOLOS_SELEKSI', 'MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(item.status)) return false;
    return true;
  });

  // Group by Sekolah Asal & Kecamatan
  const groupedSchools = targetData.reduce((acc, curr) => {
    const kec = curr.kecamatanAsal || 'Ciputat';
    const school = curr.sekolahAsal || 'SD Lainnya';
    if (!acc[kec]) acc[kec] = {};
    if (!acc[kec][school]) acc[kec][school] = [];
    acc[kec][school].push(curr);
    return acc;
  }, {} as Record<string, Record<string, AdminCalonSiswaItem[]>>);

  // 1. Ekspor CSV Format Baku Dapodik Kemendikdasmen
  const exportDapodikBakuCSV = () => {
    const headers = [
      'No',
      'Nomor Pendaftaran',
      'Nama Siswa (Sesuai Ijazah)',
      'Jenis Kelamin (L/P)',
      'NISN',
      'NIK Siswa',
      'Nomor Kartu Keluarga',
      'Tempat Lahir',
      'Tanggal Lahir (YYYY-MM-DD)',
      'Agama',
      'Nama Ibu Kandung',
      'Nama Ayah',
      'Sekolah Asal (SD/MI)',
      'NPSN SD Asal',
      'Kecamatan Sekolah Asal',
      'Alamat Siswa',
      'Jalur Pendaftaran',
      'Nomor KIP / SKTM',
      'Verifikasi Berkas Fisik TU',
      'Status Admisi SPMB',
    ];

    const rows = targetData.map((p, idx) => [
      idx + 1,
      p.nomorPendaftaran,
      `"${p.namaLengkap}"`,
      p.jenisKelamin,
      `'${p.nisn}'`,
      `'${p.nik || ''}'`,
      `'${p.noKk || ''}'`,
      `"${p.tempatLahir}"`,
      p.tanggalLahir,
      p.agama,
      `"${p.namaOrtu.split('(')[0].trim()}"`,
      `"${p.namaOrtu.split('(')[0].trim()}"`,
      `"${p.sekolahAsal}"`,
      p.npsnAsal || '',
      `"${p.kecamatanAsal || 'Ciputat'}"`,
      `"${p.alamat.replace(/"/g, '""')}"`,
      p.jalurPendaftaran,
      `'${p.nomorKipSktm || ''}'`,
      p.verifikasiFisik?.verified ? 'VALID_TERVERIFIKASI' : 'BELUM_VERIFIKASI',
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `DAPODIK_BAKU_KEMENDIKDASMEN_YAPIA_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Ekspor Rekap Asesmen BTQ & Rombel (Waka Kesiswaan)
  const exportObservasiRombelCSV = () => {
    const headers = [
      'No',
      'Nomor Pendaftaran',
      'Nama Lengkap Siswa',
      'Jenis Kelamin',
      'Sekolah Asal',
      'Kemampuan Membaca Al-Qur\'an',
      'Catatan Pendampingan / Literasi',
      'Catatan Wawancara Karakter',
      'Status Kelulusan',
    ];

    const rows = targetData.map((p, idx) => [
      idx + 1,
      p.nomorPendaftaran,
      `"${p.namaLengkap}"`,
      p.jenisKelamin,
      `"${p.sekolahAsal}"`,
      `"${p.observasi?.kemampuanQuran || 'LANCAR_ALQURAN'}"`,
      `"${p.observasi?.catatanPendampingan || 'Mandiri / Normal'}"`,
      `"${p.observasi?.catatanWawancara || '-'}"`,
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `REKAP_OBSERVASI_ROMBEL_WAKA_KESISWAAN_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySchoolStudents = (schoolName: string, students: AdminCalonSiswaItem[]) => {
    const text = students.map((s) => `${s.nisn}\t${s.namaLengkap}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedSchool(schoolName);
    setTimeout(() => setCopiedSchool(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700 rounded-xl text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Modul Ekspor Standar Baku Dapodik Kemendikdasmen
              </h3>
              <p className="text-xs text-emerald-200">
                Solusi audit tata kelola data: Format baku impor Dapodik & pengelompokan SD asal untuk sp.datadik
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-800 rounded-lg text-emerald-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterHanyaFisikValid}
                onChange={(e) => setFilterHanyaFisikValid(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Hanya Berkas Fisik Valid (TU)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterHanyaLolos}
                onChange={(e) => setFilterHanyaLolos(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Hanya Siswa Terverifikasi/Lolos/Diterima</span>
            </label>
          </div>

          <div className="text-xs font-bold text-slate-600">
            Terpilih: <strong>{targetData.length}</strong> dari {data.length} siswa
          </div>
        </div>

        {/* Sub-Header Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('baku')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'baku'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Format Baku Dapodik Pusat (20 Kolom)
            </button>
            <button
              onClick={() => setActiveTab('sekolah')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'sekolah'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              2. Pengelompokan SD Asal (sp.datadik)
            </button>
            <button
              onClick={() => setActiveTab('observasi')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'observasi'
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              3. Rekap Observasi Rombel (Kesiswaan)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: FORMAT BAKU DAPODIK */}
          {activeTab === 'baku' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <strong>Struktur Kolom Standar Kemendikdasmen:</strong> Format ini telah diselaraskan dengan kebutuhan penarikan data Dapodik, mencakup NISN, NIK, No. KK, Nama Ibu Kandung, Jalur Afirmasi KIP/SKTM, dan verifikasi fisik TU.
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">Sekolah Asal</th>
                        <th className="py-2.5 px-3">Kecamatan</th>
                        <th className="py-2.5 px-3">Jalur</th>
                        <th className="py-2.5 px-3">Verif Fisik TU</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {targetData.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{s.namaLengkap}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{s.nisn}</td>
                          <td className="py-2 px-3">{s.sekolahAsal}</td>
                          <td className="py-2 px-3 text-slate-500">{s.kecamatanAsal || 'Ciputat'}</td>
                          <td className="py-2 px-3">
                            {s.jalurPendaftaran === 'AFIRMASI' ? (
                              <span className="font-bold text-amber-700">AFIRMASI (KIP)</span>
                            ) : (
                              'REGULER'
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {s.verifikasiFisik?.verified ? (
                              <span className="text-emerald-700 font-bold">✓ Valid</span>
                            ) : (
                              <span className="text-slate-400">Belum</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={exportDapodikBakuCSV} className="text-xs py-2 bg-emerald-700 hover:bg-emerald-800 font-bold flex items-center gap-2">
                  <Download className="w-4 h-4" /> Unduh File CSV Baku Dapodik
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: PENGELOMPOKAN SD ASAL (SP.DATADIK) */}
          {activeTab === 'sekolah' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start justify-between gap-3">
                <div className="text-xs text-blue-900 leading-relaxed">
                  <strong>Bantuan Operasional Penarikan Siswa (sp.datadik):</strong> Data di bawah telah dikelompokkan berdasarkan <em>Kecamatan & Sekolah Asal</em> sesuai urutan pencarian pada portal Kemendikdasmen. Klik <strong>"Salin NISN & Nama"</strong> saat menarik data di server pusat.
                </div>
                <a
                  href="https://sp.datadik.kemendikdasmen.go.id"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka sp.datadik
                </a>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {Object.entries(groupedSchools).map(([kecamatan, schools]) => (
                  <div key={kecamatan} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-xs">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Kecamatan: {kecamatan}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(schools).map(([schoolName, students]) => (
                        <div key={schoolName} className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">{schoolName}</span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {students.length} Siswa
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 max-h-24 overflow-y-auto space-y-0.5 border-t border-slate-100 pt-1.5 font-mono">
                            {students.map((st) => (
                              <div key={st.id} className="flex justify-between">
                                <span>{st.namaLengkap}</span>
                                <span className="text-slate-400">{st.nisn}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => handleCopySchoolStudents(schoolName, students)}
                              className="px-2.5 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded flex items-center gap-1 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedSchool === schoolName ? '✓ Tersalin ke Clipboard' : 'Salin NISN & Nama'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OBSERVASI ROMBEL KESISWAAN */}
          {activeTab === 'observasi' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>Format Rekap Asesmen Pembagian Rombongan Belajar (Rombel):</strong> Dokumen ini dapat diserahkan langsung ke Waka Kesiswaan dan Guru Wali Kelas untuk pemetaan kemampuan membaca Al-Qur'an (BTQ) dan siswa yang membutuhkan bimbingan literasi/ABK.
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Nama Siswa</th>
                        <th className="py-2.5 px-3">L/P</th>
                        <th className="py-2.5 px-3">Kemampuan Al-Qur'an</th>
                        <th className="py-2.5 px-3">Catatan Pendampingan</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {targetData.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{s.namaLengkap}</td>
                          <td className="py-2 px-3">{s.jenisKelamin}</td>
                          <td className="py-2 px-3 font-semibold text-emerald-800">
                            {s.observasi?.kemampuanQuran || 'LANCAR_ALQURAN'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {s.observasi?.catatanPendampingan || 'Mandiri / Normal'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded">
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={exportObservasiRombelCSV} className="text-xs py-2 bg-amber-700 hover:bg-amber-800 font-bold flex items-center gap-2">
                  <Download className="w-4 h-4" /> Unduh Rekap Rombel & Asesmen Al-Qur'an
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button variant="outline" onClick={onClose} className="text-xs py-1.5">
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
};
