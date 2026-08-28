import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthModal } from './components/auth/AuthModal';

// Pages
import { LandingPage } from './components/landing/LandingPage';
import { StorePage } from './components/store/StorePage';
import { MyPetsPage } from './components/my-pets/MyPetsPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { PetsPage } from './components/pets/PetsPage';
import { OwnersPage } from './components/owners/OwnersPage';
import { AppointmentsPage } from './components/appointments/AppointmentsPage';
import { ProductsPage } from './components/products/ProductsPage';
import { EmployeesPage } from './components/employees/EmployeesPage';
import { CombinedRegistrationPage } from './components/pets/CombinedRegistrationPage';
import { VaccinesPage } from './components/vaccines/VaccinesPage';
import { HospitalizationPage } from './components/hospitalization/HospitalizationPage';
import { AuditLogsPage } from './components/audit/AuditLogsPage';

const AppContent: React.FC = () => {
  const { user, isStaff, isClient } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Adjust active tab when role or auth state changes
  useEffect(() => {
    if (isStaff && user) {
      if (user.role === 'Admin') setActiveTab('dashboard');
      else if (user.role === 'Veterinario') setActiveTab('pets');
      else if (user.role === 'Recepcion') setActiveTab('appointments');
    } else if (isClient) {
      setActiveTab('my-pets');
    } else {
      setActiveTab('landing');
    }
  }, [user?.role]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onNavigate={setActiveTab} onOpenAuth={handleOpenAuth} />;
      case 'store':
        return <StorePage />;
      case 'my-pets':
        return <MyPetsPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'pets':
        return <PetsPage />;
      case 'vaccines':
        return <VaccinesPage />;
      case 'hospitalization':
        return <HospitalizationPage />;
      case 'appointments':
        return <AppointmentsPage />;
      case 'owners':
        return <OwnersPage />;
      case 'products':
        return <ProductsPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'combined':
      case 'combined-reg':
        return <CombinedRegistrationPage onSuccess={() => setActiveTab('pets')} />;
      default:
        return <LandingPage onNavigate={setActiveTab} onOpenAuth={handleOpenAuth} />;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onOpenAuth={handleOpenAuth}
    >
      {renderActivePage()}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </AppLayout>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
