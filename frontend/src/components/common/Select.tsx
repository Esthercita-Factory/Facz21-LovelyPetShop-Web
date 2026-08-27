import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  children,
  error,
  helperText,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        required={required}
        className={`w-full rounded-xl border bg-slate-50/60 focus:bg-white dark:bg-slate-950/50 dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm transition-all duration-150 outline-none cursor-pointer
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-3 focus:ring-red-500/15' 
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/15 shadow-2xs'
          }
          ${className}`}
        {...props}
      >
        {options 
          ? options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children
        }
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
});

Select.displayName = 'Select';
