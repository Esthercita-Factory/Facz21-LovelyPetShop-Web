import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// 1. Logo Minimalista y Serio
export const BrandLogoIcon: React.FC<IconProps> = ({ className = 'w-8 h-8', size }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <rect width="32" height="32" rx="9" fill="#4F46E5" />
    <path
      d="M16 24C13.8 24 12 22.2 12 20.2C12 18.8 13.5 17.8 15 18.2C15.6 18.4 16.4 18.4 17 18.2C18.5 17.8 20 18.8 20 20.2C20 22.2 18.2 24 16 24Z"
      fill="white"
    />
    <circle cx="11.5" cy="14.5" r="1.7" fill="white" />
    <circle cx="14.5" cy="11.5" r="1.7" fill="white" />
    <circle cx="17.5" cy="11.5" r="1.7" fill="white" />
    <circle cx="20.5" cy="14.5" r="1.7" fill="white" />
    <path d="M16 19.5V22M14.75 20.75H17.25" stroke="#4F46E5" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// 2. Iconos de Animales en Trazado de Línea Monocromático (Un solo color)
export const DogLineIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path d="M10 5.5L7 3L4 6.5L6.5 10L5 15L9 16L10 20H14L15 16L19 15L17.5 10L20 6.5L17 3L14 5.5" />
    <circle cx="9.5" cy="11.5" r="0.75" fill="currentColor" />
    <circle cx="14.5" cy="11.5" r="0.75" fill="currentColor" />
    <path d="M11 14.5H13" />
  </svg>
);

export const CatLineIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path d="M4.5 5L7.5 10H16.5L19.5 5V13C19.5 17 16 20 12 20C8 20 4.5 17 4.5 13V5Z" />
    <circle cx="9" cy="13" r="0.75" fill="currentColor" />
    <circle cx="15" cy="13" r="0.75" fill="currentColor" />
    <path d="M11 15.5L12 16.5L13 15.5" />
    <path d="M8 15L5 14M8 16.5L5 17M16 15L19 14M16 16.5L19 17" strokeWidth="1.2" />
  </svg>
);

export const RabbitLineIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path d="M9 3C7.5 3 7 7.5 8 11.5M15 3C16.5 3 17 7.5 16 11.5" />
    <circle cx="12" cy="15.5" r="5.5" />
    <circle cx="9.8" cy="14.5" r="0.75" fill="currentColor" />
    <circle cx="14.2" cy="14.5" r="0.75" fill="currentColor" />
    <path d="M11.5 17H12.5" />
  </svg>
);

export const BirdLineIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path d="M16 4C14 4 12.5 5.5 12.5 7.5V11L8 15.5V19L11 18L13 20L15 16.5C18 16.5 20.5 14 20.5 11C20.5 7.5 18.5 4 16 4Z" />
    <path d="M20.5 8.5L23 10L20.5 11.5" />
    <circle cx="16" cy="7.5" r="0.75" fill="currentColor" />
    <path d="M12.5 11L5 14L4 18L8 16.5" />
  </svg>
);

export const PawLineIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <path d="M12 18C10.5 18 9 17 9 15.5C9 14.5 10 13.5 11.2 13.8C11.7 13.9 12.3 13.9 12.8 13.8C14 13.5 15 14.5 15 15.5C15 17 13.5 18 12 18Z" />
    <circle cx="8" cy="11.5" r="1.3" />
    <circle cx="10.5" cy="8.5" r="1.3" />
    <circle cx="13.5" cy="8.5" r="1.3" />
    <circle cx="16" cy="11.5" r="1.3" />
  </svg>
);

// 3. Estetoscopio Clínico Minimalista
export const ClinicalStethoscopeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={size ? { width: size, height: size } : undefined}>
    <path d="M5 3V9C5 12.31 7.69 15 11 15H13C16.31 15 19 12.31 19 9V3" />
    <path d="M3.5 3H6.5M17.5 3H20.5" />
    <path d="M12 15V17C12 18.66 13.34 20 15 20H17C18.66 20 20 18.66 20 17V16" />
    <circle cx="20" cy="14" r="2" />
  </svg>
);

// 4. Jeringa de Vacunación Minimalista
export const VaccineSyringeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={size ? { width: size, height: size } : undefined}>
    <path d="M18 2L22 6" />
    <path d="M14 4L20 10" />
    <path d="M16 6L18 8" />
    <rect x="7" y="8" width="7" height="11" rx="1" transform="rotate(-45 7 8)" />
    <path d="M9 12L11 14" />
    <path d="M7 14L9 16" />
    <path d="M5 19L2 22" />
  </svg>
);

// 5. Farmacia & Rx
export const PharmacyRxIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={size ? { width: size, height: size } : undefined}>
    <rect x="6" y="3" width="12" height="18" rx="3" />
    <path d="M6 7H18" />
    <path d="M12 11V17M9 14H15" strokeWidth="2" />
  </svg>
);

// 6. Higiene & Estética
export const GroomingSpaIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} style={size ? { width: size, height: size } : undefined}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M8.5 8.5L20 20M8.5 15.5L20 4" />
  </svg>
);

// Helper function to render the minimalist single-color line animal avatar
export const getSpeciesAvatarComponent = (species: string, className = 'w-11 h-11', _name?: string) => {
  const s = (species || '').toLowerCase();
  let IconComponent = PawLineIcon;

  if (s.includes('perro') || s.includes('dog') || s.includes('canin')) {
    IconComponent = DogLineIcon;
  } else if (s.includes('gato') || s.includes('cat') || s.includes('felin')) {
    IconComponent = CatLineIcon;
  } else if (s.includes('conejo') || s.includes('rabbit') || s.includes('bunny')) {
    IconComponent = RabbitLineIcon;
  } else if (s.includes('ave') || s.includes('pajaro') || s.includes('loro') || s.includes('bird')) {
    IconComponent = BirdLineIcon;
  }

  return (
    <div className={`rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 shadow-xs ${className}`}>
      <IconComponent className="w-5 h-5" />
    </div>
  );
};


