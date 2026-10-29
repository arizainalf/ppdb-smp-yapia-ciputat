import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Shield,
  FileSpreadsheet,
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutTemplate,
  Headphones,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../../application/contexts/AuthContext.js';

export type AdminMenuKey = 'overview' | 'pendaftar' | 'gelombang' | 'users' | 'dapodik' | 'content' | 'pengaturan' | 'helpdesk';

export interface AdminSidebarProps {
  activeMenu: AdminMenuKey;
  onSelectMenu: (menu: AdminMenuKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingCount: number;
  totalPendaftar: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeMenu,
  onSelectMenu,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  pendingCount,
  totalPendaftar,
}) => {
  const { user, logout, can } = useAuth();
  const rawMenuItems: Array<{
    key: AdminMenuKey;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
    section?: string;
    permission: import('@yapia/shared').Permission;
  }> = [
    {
      key: 'overview',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      section: 'Utama',
      permission: 'VIEW_DASHBOARD',
    },
    {
      key: 'pendaftar',
      label: 'Data Calon Siswa',
      icon: <Users className="w-4 h-4 shrink-0" />,
      badge: pendingCount > 0 ? `${pendingCount} Baru` : totalPendaftar,
      badgeColor: pendingCount > 0 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300',
      section: 'Utama',
      permission: 'VIEW_PENDAFTAR',
    },
    {
      key: 'gelombang',
      label: 'Gelombang',
      icon: <Calendar className="w-4 h-4 shrink-0" />,
      section: 'Master Data',
      permission: 'MANAGE_GELOMBANG',
    },
    {
      key: 'users',
      label: 'Users & Panitia',
      icon: <Shield className="w-4 h-4 shrink-0" />,
      section: 'Master Data',
      permission: 'MANAGE_USERS',
    },
    {
      key: 'helpdesk',
      label: 'Helpdesk & Tiket',
      icon: <Headphones className="w-4 h-4 shrink-0" />,
      section: 'Layanan Siswa',
      permission: 'MANAGE_HELPDESK',
    },
    {
      key: 'dapodik',
      label: 'Ekspor Dapodik',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
      section: 'Laporan',
      permission: 'EXPORT_DAPODIK',
    },
    {
      key: 'content',
      label: 'Konten Beranda (CMS)',
      icon: <LayoutTemplate className="w-4 h-4 shrink-0" />,
      section: 'Konfigurasi',
      permission: 'MANAGE_CONTENT',
    },
    {
      key: 'pengaturan',
      label: 'Pengaturan',
      icon: <Settings className="w-4 h-4 shrink-0" />,
      section: 'Konfigurasi',
      permission: 'MANAGE_CONTENT',
    }
  ];

  const SECTIONS = ['Utama', 'Master Data', 'Layanan Siswa', 'Laporan', 'Konfigurasi'];

  const menuItems = rawMenuItems.filter((item) => {
    if (item.key === 'content') {
      return user?.role === 'ADMIN' || can('MANAGE_CONTENT');
    }
    return can(item.permission);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ease-in-out lg:static lg:h-screen lg:shrink-0 ${
          isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Top Header Logo */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
            {/* Header when expanded (or on mobile) */}
            <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'lg:hidden' : 'flex'}`}>
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0 shadow-xs">
                <img
                  src="/assets/logo-smp-yapia-ciputat.png"
                  alt="Logo SMP YAPIA Ciputat"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="overflow-hidden">
                <h2 className="font-black text-white text-sm tracking-tight leading-tight whitespace-nowrap">
                  PANITIA PPDB
                </h2>
                <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase whitespace-nowrap">
                  SMP YAPIA CIPUTAT
                </p>
              </div>
            </div>

            {/* Header when collapsed on desktop */}
            <div className={`hidden ${isCollapsed ? 'lg:flex items-center justify-center w-full' : ''}`}>
              <button
                onClick={onToggleCollapse}
                title="Perluas Sidebar (Expand)"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 hover:bg-slate-800 hover:scale-105 transition-all group cursor-pointer"
              >
                <img
                  src="/assets/logo-smp-yapia-ciputat.png"
                  alt="Logo SMP YAPIA Ciputat"
                  className="w-full h-full object-contain group-hover:hidden"
                />
                <PanelLeftOpen className="w-5 h-5 text-emerald-400 hidden group-hover:block" />
              </button>
            </div>

            {/* Actions on Header Right (Desktop Collapse & Mobile Close) */}
            <div className={`flex items-center gap-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
              {/* Desktop Collapse Button */}
              <button
                onClick={onToggleCollapse}
                title="Ciutkan Sidebar (Collapse)"
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cloudflare D1 Realtime Status */}
          {/* {isCollapsed ? (
            <div
              className="hidden lg:flex py-3 items-center justify-center border-b border-slate-900 bg-slate-900/40 shrink-0 cursor-default"
              title="Cloudflare D1 SQL: Online"
            >
              <div className="relative flex items-center justify-center">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
              </div>
            </div>
          ) : (
            <div className="px-5 py-3 border-b border-slate-900 bg-slate-900/40 shrink-0">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-2 text-slate-400">
                  <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Cloudflare D1 SQL</span>
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-400 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online
                </span>
              </div>
            </div>
          )} */}

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {isCollapsed ? (
              // Collapsed View for Desktop (Icons only)
              <div className="hidden lg:flex flex-col items-center py-3 space-y-3 px-2">
                {SECTIONS.map((sectionTitle, sIdx) => {
                  const items = menuItems.filter((i) => i.section === sectionTitle);
                  if (items.length === 0) return null;

                  return (
                    <div key={sectionTitle} className="w-full flex flex-col items-center space-y-2">
                      {sIdx > 0 && <div className="w-8 border-t border-slate-800/80 my-1" />}
                      {items.map((item) => {
                        const isActive = activeMenu === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              onSelectMenu(item.key);
                              onCloseMobile();
                            }}
                            title={`${item.label}${item.badge ? ` (${item.badge})` : ''}`}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all relative group cursor-pointer ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                          >
                            {item.icon}
                            {item.badge !== undefined && (
                              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-slate-950 animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Expanded View (always on mobile, and on desktop when not collapsed) */}
            <div className={`p-3 space-y-6 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              {SECTIONS.map((sectionTitle) => {
                const items = menuItems.filter((i) => i.section === sectionTitle);
                if (items.length === 0) return null;

                return (
                  <div key={sectionTitle} className="space-y-1">
                    <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                      {sectionTitle}
                    </span>
                    {items.map((item) => {
                      const isActive = activeMenu === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            onSelectMenu(item.key);
                            onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-extrabold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive ? 'bg-white text-emerald-950 font-black' : item.badgeColor
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: User Profile & Exit Button */}
        <div className="shrink-0 border-t border-slate-900 bg-slate-950">
          {/* Collapsed Bottom View */}
          {isCollapsed ? (
            <div className="hidden lg:flex flex-col items-center p-3 gap-2">
              <div
                className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0 cursor-default"
                title={`${user?.namaLengkap || 'Panitia PPDB'} (${user?.role || 'OPERATOR'})`}
              >
                {user?.namaLengkap ? user.namaLengkap.slice(0, 2).toUpperCase() : 'PN'}
              </div>
              <button
                onClick={() => logout()}
                title="Keluar / Logout"
                className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-400 hover:text-white hover:bg-rose-900/40 border border-rose-900/50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          ) : null}

          {/* Expanded Bottom View */}
          <div className={`p-4 space-y-3 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
            {/* User Info Card */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                {user?.namaLengkap ? user.namaLengkap.slice(0, 2).toUpperCase() : 'PN'}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate">
                  {user?.namaLengkap || 'Panitia PPDB'}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold block truncate">
                  {user?.role || 'OPERATOR'} • SMP YAPIA
                </span>
              </div>
            </div>

            {/* Logout & Exit Button */}
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-900/40 border border-rose-900/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Keluar / Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
