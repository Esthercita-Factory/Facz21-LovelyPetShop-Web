import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useAuth();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/30 dark:border-emerald-500/40 bg-white dark:bg-slate-900',
    error: 'border-red-500/30 dark:border-red-500/40 bg-white dark:bg-slate-900',
    info: 'border-indigo-500/30 dark:border-indigo-500/40 bg-white dark:bg-slate-900'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-scale max-w-sm">
      <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border ${borders[toast.type]} backdrop-blur-md`}>
        {icons[toast.type]}
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {toast.message}
        </p>
      </div>
    </div>
  );
};
