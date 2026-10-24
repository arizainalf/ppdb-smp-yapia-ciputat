import React, { useState, useEffect } from 'react';
import {
  Menu,
  Download,
  FileSpreadsheet,
  Bell,
  RefreshCw,
  Award,
  FileCheck2,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutTemplate,
} from 'lucide-react';
import { AdminSidebar, AdminMenuKey } from '../../components/admin/AdminSidebar.js';
import { AdminStatsCards } from '../../components/admin/AdminStatsCards.js';
import { PendaftarTable } from '../../components/admin/PendaftarTable.js';
import {
  PendaftarDetailDrawer,
  AdminCalonSiswaItem,
} from '../../components/admin/PendaftarDetailModal.js';
import { EksporDapodikModal } from '../../components/admin/EksporDapodikModal.js';
import { MasterGelombangManager } from '../../components/admin/MasterGelombangManager.js';
import { MasterUsersManager } from '../../components/admin/MasterUsersManager.js';
import { MasterLandingContentManager } from '../../components/admin/MasterLandingContentManager.js';
import { MasterHelpdeskManager } from '../../components/admin/MasterHelpdeskManager.js';
import { Button } from '../../components/common/Button.js';
import { useAuth } from '../../../application/contexts/AuthContext.js';
import { useSearchParams } from 'react-router-dom';

interface AdminPageProps {
  onBackToPublic: () => void;
}

export const AdminDashboardPage: React.FC<AdminPageProps> = ({ onBackToPublic }) => {
  const { user, can } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as AdminMenuKey | null;
  const validTabs: AdminMenuKey[] = ['overview', 'pendaftar', 'gelombang', 'users', 'content', 'helpdesk', 'dapodik'];
  const initialTab: AdminMenuKey = (tabFromUrl && validTabs.includes(tabFromUrl)) ? tabFromUrl : 'overview';

  const [activeMenu, setActiveMenuState] = useState<AdminMenuKey>(initialTab);

  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeMenu) {
      setActiveMenuState(tabFromUrl);
    }
  }, [tabFromUrl]);

  const setActiveMenu = (menu: AdminMenuKey) => {
    setActiveMenuState(menu);
    const newParams = new URLSearchParams(searchParams);
    if (menu === 'overview') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', menu);
    }
    setSearchParams(newParams, { replace: true });
  };
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('yapia_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('yapia_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Mock list with complete audit findings (Afirmasi, Fisik, Observasi, Progressive Statuses)
  const [pendaftarList, setPendaftarList] = useState<AdminCalonSiswaItem[]>([
    {
      id: '10000000-0000-4000-8000-000000000001',
      nomorPendaftaran: 'REG-2026-G1-0001',
      namaLengkap: 'ALKA ALHABSY',
      nisn: '0123456789',
      nik: '3274011205130001',
      noKk: '3274011205130000',
      sekolahAsal: 'SD Negeri Pondok Cabe Ilir 02',
      npsnAsal: '20603123',
      kecamatanAsal: 'Pamulang',
      jenisKelamin: 'L',
      tempatLahir: 'Jakarta',
      tanggalLahir: '2013-05-12',
      agama: 'Islam',
      alamat: 'Jl. Talas II RT 06/RW 01 No. 19, Pondok Cabe Ilir, Pamulang',
      namaOrtu: 'Ahmad Fauzi (Ayah)',
      noHpOrtu: '081298765432',
      gelombangId: 1,
      status: 'LOLOS_SELEKSI',
      tanggalDaftar: '16 Okt 2026',
      jalurPendaftaran: 'AFIRMASI',
      nomorKipSktm: 'KIP-2026-992138',
      pdpConsent: true,
      verifikasiFisik: {
        verified: true,
        verifiedBy: 'Aila Syifa (Staf TU)',
        verifiedAt: '16 Okt 2026, 10:00',
        notes: 'Map berkas fisik lengkap di lemari arsip TU, ijazah asli legalisir sesuai.',
      },
      observasi: {
        kemampuanQuran: 'LANCAR_ALQURAN',
        catatanPendampingan: 'Mandiri / Normal',
        catatanWawancara: 'Siswa berminat di ekskul Marawis dan Sains Club.',
        assessedBy: 'Waka Kesiswaan & Guru PAI',
      },
      berkas: { ijazah: true, kk: true, akta: true, foto: true, kip: true },
      catatanPanitia: 'Semua berkas lengkap dan sah. Siap mengikuti MPLS.',
      auditLogs: [
        { action: 'Formulir Online Disubmit', actor: 'Wali Murid', timestamp: '15 Okt 2026 14:00' },
        { action: 'Verifikasi Berkas Fisik Diterima', actor: 'Aila Syifa (TU)', timestamp: '16 Okt 2026 10:00', notes: 'Ijazah & KK asli dicocokkan.' },
        { action: 'Penetapan Lolos Seleksi', actor: 'Via Aprilian S., S.Kom (Kepsek)', timestamp: '16 Okt 2026 11:30' },
      ],
    },
    {
      id: '20000000-0000-4000-8000-000000000002',
      nomorPendaftaran: 'REG-2026-G1-0002',
      namaLengkap: 'SITI NURHALIZA AMINAH',
      nisn: '0123456790',
      nik: '3674015008130002',
      noKk: '3674015008130000',
      sekolahAsal: 'MI Yapia Ciputat',
      npsnAsal: '60721234',
      kecamatanAsal: 'Ciputat',
      jenisKelamin: 'P',
      tempatLahir: 'Tangerang Selatan',
      tanggalLahir: '2013-08-20',
      agama: 'Islam',
      alamat: 'Jl. KH. Dewantara No. 45, Ciputat',
      namaOrtu: 'Hendra Gunawan (Ayah)',
      noHpOrtu: '081311223344',
      gelombangId: 1,
      status: 'SUBMITTED',
      tanggalDaftar: '16 Okt 2026',
      jalurPendaftaran: 'REGULER',
      pdpConsent: true,
      verifikasiFisik: {
        verified: false,
        notes: 'Menunggu penyerahan berkas fisik ke kantor TU.',
      },
      observasi: {
        kemampuanQuran: 'IQRA_LANJUT',
        catatanPendampingan: 'Perlu bimbingan tajwid lanjutan',
      },
      berkas: { ijazah: true, kk: true, akta: true, foto: true },
    },
    {
      id: '30000000-0000-4000-8000-000000000003',
      nomorPendaftaran: 'REG-2026-G1-0003',
      namaLengkap: 'MUHAMMAD FATHAN ATHALLAH',
      nisn: '0123456791',
      nik: '3274021402130003',
      noKk: '3274021402130000',
      sekolahAsal: 'SD Negeri Cipayung 01',
      npsnAsal: '20603456',
      kecamatanAsal: 'Ciputat',
      jenisKelamin: 'L',
      tempatLahir: 'Jakarta',
      tanggalLahir: '2013-02-14',
      agama: 'Islam',
      alamat: 'Jl. Cipayung Raya No. 12, Ciputat',
      namaOrtu: 'Dewi Lestari (Ibu)',
      noHpOrtu: '085799887766',
      gelombangId: 1,
      status: 'REVISI',
      tanggalDaftar: '15 Okt 2026',
      jalurPendaftaran: 'AFIRMASI',
      nomorKipSktm: '470/12/SKTM/2026',
      pdpConsent: true,
      verifikasiFisik: {
        verified: false,
        notes: 'Fotokopi KK terpotong pada bagian tanda tangan kepala dinas dukcapil.',
      },
      berkas: { ijazah: true, kk: true, akta: false, foto: true, kip: true },
      catatanPanitia: 'Scan Akta Kelahiran buram, mohon unggah ulang melalui portal pendaftaran.',
    },
    {
      id: '40000000-0000-4000-8000-000000000004',
      nomorPendaftaran: 'REG-2026-G1-0004',
      namaLengkap: 'BILAL AL-GHIFARI',
      nisn: '0123456792',
      nik: '3674030511130004',
      noKk: '3674030511130000',
      sekolahAsal: 'SDIT Al-Hikmah Ciputat',
      npsnAsal: '69912345',
      kecamatanAsal: 'Ciputat',
      jenisKelamin: 'L',
      tempatLahir: 'Tangerang Selatan',
      tanggalLahir: '2013-11-05',
      agama: 'Islam',
      alamat: 'Komplek Kejaksaan Agung No. 8, Ciputat',
      namaOrtu: 'Bambang Irawan (Ayah)',
      noHpOrtu: '081288990011',
      gelombangId: 1,
      status: 'MENGIKUTI_MPLS',
      tanggalDaftar: '16 Okt 2026',
      jalurPendaftaran: 'PRESTASI',
      pdpConsent: true,
      verifikasiFisik: {
        verified: true,
        verifiedBy: 'Aila Syifa (Staf TU)',
        verifiedAt: '16 Okt 2026',
        notes: 'Sertifikat tahfidz Juz 30 asli telah dicocokkan.',
      },
      observasi: {
        kemampuanQuran: 'TAHFIDZ',
        catatanPendampingan: 'Mandiri / Kelas Prestasi Tahfidz',
        catatanWawancara: 'Hafal Juz 30 mutqin dan siap ikut lomba MTQ.',
      },
      berkas: { ijazah: true, kk: true, akta: true, foto: true },
    },
    {
      id: '50000000-0000-4000-8000-000000000005',
      nomorPendaftaran: 'REG-2026-G1-0005',
      namaLengkap: 'AULIA RAHMADHANI',
      nisn: '0123456793',
      nik: '3276044907130005',
      noKk: '3276044907130000',
      sekolahAsal: 'SD Negeri Serua 03',
      npsnAsal: '20603789',
      kecamatanAsal: 'Ciputat',
      jenisKelamin: 'P',
      tempatLahir: 'Depok',
      tanggalLahir: '2013-07-09',
      agama: 'Islam',
      alamat: 'Jl. Sukabakti No. 22, Serua Indah',
      namaOrtu: 'Surya Pratama (Ayah)',
      noHpOrtu: '081900112233',
      gelombangId: 1,
      status: 'DITERIMA_RESMI',
      tanggalDaftar: '16 Okt 2026',
      jalurPendaftaran: 'REGULER',
      pdpConsent: true,
      verifikasiFisik: {
        verified: true,
        verifiedBy: 'Aila Syifa (Staf TU)',
        verifiedAt: '16 Okt 2026',
        notes: 'Seluruh berkas fisik lengkap.',
      },
      observasi: {
        kemampuanQuran: 'LANCAR_ALQURAN',
        catatanPendampingan: 'Mandiri / Rombel 7A',
      },
      berkas: { ijazah: true, kk: true, akta: true, foto: true },
    },
  ]);

  const [selectedPendaftar, setSelectedPendaftar] = useState<AdminCalonSiswaItem | null>(null);

  const fetchPendaftarList = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/calon-siswa');
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        setPendaftarList(json.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data pendaftar dari backend:', err);
    }
  };

  useEffect(() => {
    fetchPendaftarList();
  }, []);

  // Statistics calculation
  const totalPendaftar = pendaftarList.length;
  const menungguVerifikasi = pendaftarList.filter((p) => p.status === 'SUBMITTED').length;
  const terverifikasi = pendaftarList.filter((p) =>
    ['VERIFIED', 'LOLOS_SELEKSI', 'MENGIKUTI_MPLS', 'DITERIMA_RESMI'].includes(p.status)
  ).length;
  const perluRevisi = pendaftarList.filter((p) => p.status === 'REVISI').length;
  const totalBiayaMasuk = terverifikasi * 250000;

  const handleUpdateStatus = async (
    id: string,
    newStatus: AdminCalonSiswaItem['status'],
    catatan?: string,
    extraData?: Partial<AdminCalonSiswaItem>
  ) => {
    // 1. Update optimistik di state
    setPendaftarList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
              catatanPanitia: catatan ?? item.catatanPanitia,
              ...(extraData || {}),
            }
          : item
      )
    );
    if (selectedPendaftar && selectedPendaftar.id === id) {
      setSelectedPendaftar((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              catatanPanitia: catatan ?? prev.catatanPanitia,
              ...(extraData || {}),
            }
          : null
      );
    }

    // 2. Persist ke database backend Hono
    try {
      await fetch(`http://localhost:8000/api/v1/calon-siswa/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          catatan,
          verifikasiFisik: extraData?.verifikasiFisik,
          observasi: extraData?.observasi,
          actor: user?.namaLengkap || 'Panitia PPDB',
        }),
      });
      await fetchPendaftarList();
    } catch (err) {
      console.error('Gagal memperbarui status ke server:', err);
    }
  };

  const menuTitles: Record<AdminMenuKey, { title: string; subtitle: string }> = {
    overview: {
      title: 'Ringkasan Eksekutif & Metrik Admisi',
      subtitle: 'Pantau data pendaftaran, verifikasi berkas fisik TU, kuota afirmasi KIP, dan sinkronisasi Dapodik.',
    },
    pendaftar: {
      title: 'Pemeriksaan & Verifikasi Data Calon Siswa',
      subtitle: 'Daftar seluruh calon siswa dengan filter jalur afirmasi, verifikasi fisik TU, dan status berjenjang.',
    },
    gelombang: {
      title: 'Manajemen Gelombang Pendaftaran',
      subtitle: 'Konfigurasi periode buka/tutup pendaftaran, batas kuota, dan tarif biaya formulir.',
    },
    users: {
      title: 'Master Pengguna & Akun Panitia PPDB',
      subtitle: 'Kelola hak akses dan peran (Super Admin, Operator PPDB, Bendahara, Kepala Sekolah).',
    },
    content: {
      title: 'Manajemen Konten Beranda (CMS)',
      subtitle: 'Kelola judul banner hero, teks keunggulan, panduan pendaftaran, CTA, dan kontak informasi sekolah.',
    },
    helpdesk: {
      title: 'Pusat Helpdesk & Layanan Pengaduan PPDB',
      subtitle: 'Kelola pertanyaan masuk dari calon siswa/orang tua, tanggapan resmi, dan balasan via WhatsApp Web.',
    },
    dapodik: {
      title: 'Modul Standar Baku Ekspor Dapodik Kemendikdasmen',
      subtitle: 'Format baku CSV/Excel sesuai spek Dapodik pusat dan fitur pengelompokan SD asal untuk sp.datadik.',
    },
  };

  return (
    <div className="min-h-screen lg:h-screen bg-slate-100 flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Sidebar Component */}
      <AdminSidebar
        activeMenu={activeMenu}
        onSelectMenu={(key) => setActiveMenu(key)}
        onBackToPublic={onBackToPublic}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
        pendingCount={menungguVerifikasi}
        totalPendaftar={totalPendaftar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Drawer Hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Buka Navigasi Mobile"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button
              onClick={handleToggleSidebarCollapse}
              className="hidden lg:flex p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Perluas Sidebar (Expand)' : 'Ciutkan Sidebar (Collapse)'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>

            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                {menuTitles[activeMenu].title}
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">
                {menuTitles[activeMenu].subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.location.reload()}
              title="Refresh Data"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              title="Notifikasi"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
            </button>
            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
              className="hidden sm:flex text-xs py-1.5 px-3 border-emerald-600 text-emerald-800 font-bold hover:bg-emerald-50 items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" /> Ekspor Dapodik
            </Button>
          </div>
        </header>

        {/* Dynamic Content View */}
        <main className="p-4 sm:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* View: OVERVIEW */}
          {activeMenu === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <AdminStatsCards
                totalPendaftar={totalPendaftar}
                menungguVerifikasi={menungguVerifikasi}
                terverifikasi={terverifikasi}
                perluRevisi={perluRevisi}
                totalBiayaMasuk={totalBiayaMasuk}
              />

              {/* Quick Info Badges based on Audit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-600 text-white rounded-lg">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">Jalur Afirmasi KIP / PIP / SKTM</h4>
                      <p className="text-[11px] text-amber-800">
                        Pendaftar pemegang KIP/SKTM yang direkap terpisah untuk validasi bantuan biaya.
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-amber-900">
                    {pendaftarList.filter((p) => p.jalurPendaftaran === 'AFIRMASI').length}
                  </span>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-600 text-white rounded-lg">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-950">Berkas Fisik Terverifikasi TU</h4>
                      <p className="text-[11px] text-blue-800">
                        Two-eyes verification: Map fisik asli telah dicocokkan sebelum ditarik ke Dapodik.
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-blue-900">
                    {pendaftarList.filter((p) => p.verifikasiFisik?.verified).length}
                  </span>
                </div>

                {(user?.role === 'ADMIN' || can('MANAGE_CONTENT')) && (
                  <div className="sm:col-span-2 p-4 bg-purple-50/80 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-600 text-white rounded-lg shrink-0 shadow-sm">
                        <LayoutTemplate className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-purple-950">
                            Manajemen Konten Beranda (CMS)
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 text-purple-900">
                            Super Admin
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-800 mt-0.5">
                          Ubah judul headline hero, 4 poin keunggulan, panduan 4 langkah pendaftaran, banner CTA, dan info kontak secara instan.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setActiveMenu('content')}
                      className="text-xs bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 shrink-0 shadow-xs cursor-pointer"
                    >
                      Buka Modul CMS &rarr;
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Daftar Calon Siswa Terbaru (Verifikasi Berkas & Observasi)
                  </h3>
                  <button
                    onClick={() => setActiveMenu('pendaftar')}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Buka Seluruh Data Siswa &rarr;
                  </button>
                </div>
                <PendaftarTable
                  data={pendaftarList.slice(0, 4)}
                  onSelectPendaftar={(item) => setSelectedPendaftar(item)}
                  onExportDapodik={() => setShowExportModal(true)}
                />
              </div>
            </div>
          )}

          {/* View: PENDAFTAR TABLE */}
          {activeMenu === 'pendaftar' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <PendaftarTable
                data={pendaftarList}
                onSelectPendaftar={(item) => setSelectedPendaftar(item)}
                onExportDapodik={() => setShowExportModal(true)}
              />
            </div>
          )}

          {/* View: MASTER GELOMBANG */}
          {activeMenu === 'gelombang' && (
            can('MANAGE_GELOMBANG') ? (
              <div className="animate-in fade-in duration-200">
                <MasterGelombangManager />
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
                  🛡️
                </div>
                <h3 className="text-base font-bold text-slate-800">Akses Terbatas: Master Gelombang</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Peran Anda (<strong>{user?.role}</strong>) tidak memiliki wewenang mengubah konfigurasi gelombang, kuota, dan tarif biaya formulir. Pengaturan ini hanya dapat diakses oleh Super Admin.
                </p>
              </div>
            )
          )}

          {/* View: MASTER USERS */}
          {activeMenu === 'users' && (
            can('MANAGE_USERS') ? (
              <div className="animate-in fade-in duration-200">
                <MasterUsersManager />
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
                  🛡️
                </div>
                <h3 className="text-base font-bold text-slate-800">Akses Terbatas: Manajemen Pengguna (RBAC)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pengelolaan akun panitia PPDB, operator, dan hak akses sistem memerlukan otorisasi Super Administrator.
                </p>
              </div>
            )
          )}

          {/* View: MASTER LANDING CONTENT (CMS) */}
          {activeMenu === 'content' && (
            can('MANAGE_CONTENT') ? (
              <div className="animate-in fade-in duration-200">
                <MasterLandingContentManager />
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
                  🛡️
                </div>
                <h3 className="text-base font-bold text-slate-800">Akses Terbatas: Konten Beranda (CMS)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pengaturan teks judul, banner, panduan, dan kontak publik beranda hanya dapat diakses oleh Super Admin.
                </p>
              </div>
            )
          )}

          {/* View: HELPDESK & COMPLAINT SERVICE */}
          {activeMenu === 'helpdesk' && (
            can('MANAGE_HELPDESK') ? (
              <div className="animate-in fade-in duration-200">
                <MasterHelpdeskManager />
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
                  🛡️
                </div>
                <h3 className="text-base font-bold text-slate-800">Akses Terbatas: Helpdesk & Tiket</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Layanan tiket bantuan dan pengaduan hanya dapat diakses oleh Panitia PPDB, Operator, dan Pimpinan.
                </p>
              </div>
            )
          )}

          {/* View: DAPODIK EXPORT */}
          {activeMenu === 'dapodik' && (
            can('EXPORT_DAPODIK') ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Modul Standar Baku Ekspor Dapodik Kemendikdasmen
                    </h3>
                    <p className="text-xs text-slate-500">
                      Format file tabel CSV/Excel siap impor langsung ke portal sp.datadik atau aplikasi Dapodik sekolah.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <p>
                    ✔ <strong>Format Baku 20 Kolom:</strong> NISN 10 digit, NIK, No. KK, Nama Ibu Kandung, Asal SD, NPSN, dan Alamat lengkap.
                  </p>
                  <p>
                    ✔ <strong>Pengelompokan SD Asal & Kecamatan:</strong> Memudahkan Operator Dapodik mencocokkan siswa di portal pusat per sekolah asal.
                  </p>
                  <p>
                    ✔ <strong>Rekap Observasi Al-Qur'an (BTQ) & Rombel:</strong> Membantu Waka Kesiswaan dalam penetapan rombongan belajar.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button onClick={() => setShowExportModal(true)} className="py-2.5 bg-emerald-700 hover:bg-emerald-800">
                    <FileSpreadsheet className="w-4 h-4" /> Buka Modul Ekspor Dapodik Lengkap
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
                  🛡️
                </div>
                <h3 className="text-base font-bold text-slate-800">Akses Terbatas: Ekspor Dapodik</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Modul ini dikhususkan untuk Operator Sekolah dan Kepala Sekolah untuk penarikan data ke portal Dapodik pusat.
                </p>
              </div>
            )
          )}
        </main>
      </div>

      {/* Verification & Detail Drawer */}
      {selectedPendaftar && (
        <PendaftarDetailDrawer
          pendaftar={selectedPendaftar}
          onClose={() => setSelectedPendaftar(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Dedicated Dapodik Export Modal */}
      {showExportModal && (
        <EksporDapodikModal
          data={pendaftarList}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
