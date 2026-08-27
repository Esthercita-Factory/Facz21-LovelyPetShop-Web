import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMinimized, setIsMinimized] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-minimize 2 seconds after being toggled
  const handleToggle = () => {
    toggleTheme();
    setIsMinimized(false);
    setTimeout(() => {
      setIsMinimized(true);
    }, 2200);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsMinimized(true);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showExpanded = isHovered || !isMinimized;

  return (
    <div
      className="fixed bottom-6 right-6 z-40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleToggle}
        aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        className={`group flex items-center justify-center rounded-full border shadow-lg backdrop-blur-md cursor-pointer transition-all duration-300 ease-out
          ${theme === 'dark'
            ? 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-amber-400 shadow-black/30'
            : 'bg-white/90 hover:bg-white border-slate-200 text-indigo-600 shadow-slate-300/40'
          }
          ${showExpanded 
            ? 'p-3.5 scale-100 opacity-100 ring-2 ring-indigo-500/20' 
            : 'p-2.5 scale-85 opacity-60 hover:opacity-100 hover:scale-100'
          }
        `}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <Sun 
            className={`w-5 h-5 absolute transition-all duration-300 ${
              theme === 'dark' 
                ? 'rotate-90 scale-0 opacity-0' 
                : 'rotate-0 scale-100 opacity-100'
            }`} 
          />
          <Moon 
            className={`w-5 h-5 absolute transition-all duration-300 ${
              theme === 'dark' 
                ? 'rotate-0 scale-100 opacity-100' 
                : '-rotate-90 scale-0 opacity-0'
            }`} 
          />
        </div>

        {/* Subtle hover tooltip tag */}
        {showExpanded && (
          <span className="ml-2 text-xs font-semibold select-none text-slate-700 dark:text-slate-200 whitespace-nowrap pr-1 transition-opacity duration-200">
            {theme === 'dark' ? 'Oscuro' : 'Claro'}
          </span>
        )}
      </button>
    </div>
  );
};
