import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  required,
  rows = 3,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        required={required}
        className={`w-full rounded-xl border bg-slate-50/60 focus:bg-white dark:bg-slate-950/50 dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 px-3.5 py-2.5 text-sm transition-all duration-150 outline-none resize-y
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-3 focus:ring-red-500/15' 
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/15 shadow-2xs'
          }
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
