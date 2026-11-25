import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

// === Input ===
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, prefix, suffix, className='', ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="label">{label}</label>}
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-cedro-400 pointer-events-none">{prefix}</span>}
      <input
        ref={ref}
        className={`input ${prefix?'pl-9':''} ${suffix?'pr-9':''} ${error?'border-barro-400 focus:ring-barro-400':''} ${className}`}
        {...props}
      />
      {suffix && <span className="absolute right-3 text-cedro-400 pointer-events-none">{suffix}</span>}
    </div>
    {error && <p className="text-xs text-barro-600">{error}</p>}
    {hint && !error && <p className="text-xs text-cedro-400">{hint}</p>}
  </div>
));
Input.displayName = 'Input';

// === Select ===
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string|number; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, placeholder, className='', ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={`input ${error?'border-barro-400':''} ${className}`} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="text-xs text-barro-600">{error}</p>}
  </div>
));
Select.displayName = 'Select';

// === Textarea ===
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className='', ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="label">{label}</label>}
    <textarea ref={ref} rows={3} className={`input resize-none ${error?'border-barro-400':''} ${className}`} {...props} />
    {error && <p className="text-xs text-barro-600">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';
