import React, { useState } from 'react';
import { AuthProvider, useAuth } from './application/contexts/AuthContext.js';
import { Navbar } from './presentation/components/common/Navbar.js';
import { Footer } from './presentation/components/common/Footer.js';
import { LandingPage } from './presentation/pages/LandingPage.js';
import { RegistrationWizardPage } from './presentation/pages/RegistrationWizardPage.js';
import { StatusCheckPage } from './presentation/pages/StatusCheckPage.js';
import { AdminDashboardPage } from './presentation/pages/admin/AdminDashboardPage.js';
import { LoginPage } from './presentation/pages/LoginPage.js';

export type ViewState = 'landing' | 'register' | 'status' | 'admin' | 'login';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const { user, isAuthenticated } = useAuth();

  const navigateTo = (view: ViewState) => {
    if (view === 'admin') {
      if (!isAuthenticated) {
        setCurrentView('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (user?.role === 'PENDAFTAR') {
        setCurrentView('status');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setCurrentView(view);
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

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartRegistration={() => navigateTo('register')}
            onCheckStatus={() => navigateTo('status')}
          />
        )}

        {currentView === 'register' && (
          <RegistrationWizardPage onBackToHome={() => navigateTo('landing')} />
        )}

        {currentView === 'status' && (
          <StatusCheckPage
            onBackToHome={() => navigateTo('landing')}
            onNewRegistration={() => navigateTo('register')}
            onOpenLogin={() => navigateTo('login')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardPage onBackToPublic={() => navigateTo('landing')} />
        )}

        {currentView === 'login' && (
          <LoginPage
            onBackToHome={() => navigateTo('landing')}
            onNavigateRegister={() => navigateTo('register')}
            onLoginSuccess={(targetView) => navigateTo(targetView)}
          />
        )}
      </main>

      {/* Global Footer (sembunyikan di dasbor admin untuk ruang kerja maksimal) */}
      {currentView !== 'admin' && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
