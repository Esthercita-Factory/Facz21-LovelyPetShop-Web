import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CustomerNavbar } from './CustomerNavbar';
import { StaffSidebar } from './StaffSidebar';
import { Toast } from '../common/Toast';
import { ThemeToggle } from '../common/ThemeToggle';

interface AppLayoutProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  onOpenAuth,
  children
}) => {
  const { isStaff } = useAuth();

  if (isStaff && activeTab !== 'landing' && activeTab !== 'store') {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <StaffSidebar activeTab={activeTab} onSelectTab={onSelectTab} />
        
        <main className="flex-1 min-w-0 overflow-y-auto h-screen p-6 sm:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        <Toast />
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <CustomerNavbar 
        activeTab={activeTab} 
        onSelectTab={onSelectTab} 
        onOpenAuth={onOpenAuth} 
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {children}
        </div>
      </main>

      <Toast />
      <ThemeToggle />
    </div>
  );
};
