import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './application/contexts/AuthContext.js';
import { Navbar } from './presentation/components/common/Navbar.js';
import { Footer } from './presentation/components/common/Footer.js';
import { LandingPage } from './presentation/pages/LandingPage.js';
import { RegistrationWizardPage } from './presentation/pages/RegistrationWizardPage.js';
import { StatusCheckPage } from './presentation/pages/StatusCheckPage.js';
import { AdminDashboardPage } from './presentation/pages/admin/AdminDashboardPage.js';
import { LoginPage } from './presentation/pages/LoginPage.js';
import { PublicHelpdeskWidget } from './presentation/components/common/PublicHelpdeskWidget.js';

export type ViewState = 'landing' | 'register' | 'status' | 'admin' | 'login';

// Protected Admin Route Guard: Mencegah mental saat refresh jika sudah login
const ProtectedAdminRoute: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'PENDAFTAR') {
    return <Navigate to="/status" replace />;
  }

  return <AdminDashboardPage />;
};

const MainApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Deteksi tampilan aktif berdasarkan URL riil browser
  const getCurrentView = (): ViewState => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/register') || path.startsWith('/daftar')) return 'register';
    if (path.startsWith('/status')) return 'status';
    if (path.startsWith('/login')) return 'login';
    return 'landing';
  };

  const currentView = getCurrentView();

  // Pengarah navigasi yang sinkron dengan URL browser
  const navigateTo = (view: ViewState) => {
    switch (view) {
      case 'landing':
        navigate('/');
        break;
      case 'register':
        navigate('/register');
        break;
      case 'status':
        navigate('/status');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'login':
        navigate('/login');
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white font-sans">
      {/* Global Navbar (disembunyikan saat di dasbor admin untuk ruang kerja maksimal) */}
      {currentView !== 'admin' && (
        <Navbar
          currentView={currentView}
          onNavigate={navigateTo}
          onOpenLogin={() => navigateTo('login')}
        />
      )}

      {/* Main Dynamic View Content dengan URL Terpisah */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                onStartRegistration={() => navigateTo('register')}
                onCheckStatus={() => navigateTo('status')}
              />
            }
          />
          <Route
            path="/register"
            element={<RegistrationWizardPage onBackToHome={() => navigateTo('landing')} />}
          />
          <Route
            path="/daftar"
            element={<RegistrationWizardPage onBackToHome={() => navigateTo('landing')} />}
          />
          <Route
            path="/status"
            element={
              <StatusCheckPage
                onBackToHome={() => navigateTo('landing')}
                onNewRegistration={() => navigateTo('register')}
                onOpenLogin={() => navigateTo('login')}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginPage
                onBackToHome={() => navigateTo('landing')}
                onNavigateRegister={() => navigateTo('register')}
                onLoginSuccess={(targetView) => navigateTo(targetView)}
              />
            }
          />
          <Route path="/admin" element={<ProtectedAdminRoute />} />
          <Route path="/admin/:tab" element={<ProtectedAdminRoute />} />
          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer (sembunyikan di dasbor admin untuk ruang kerja maksimal) */}
      {currentView !== 'admin' && <Footer />}

      {/* Floating Helpdesk & Layanan Pengaduan PPDB */}
      {currentView !== 'admin' && <PublicHelpdeskWidget />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
