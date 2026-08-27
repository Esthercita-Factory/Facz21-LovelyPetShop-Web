import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          required={required}
          className={`w-full rounded-xl border bg-slate-50/60 focus:bg-white dark:bg-slate-950/50 dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 px-3.5 py-2.5 text-sm transition-all duration-150 outline-none
            ${icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-3 focus:ring-red-500/15' 
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/15 shadow-2xs'
            }
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
