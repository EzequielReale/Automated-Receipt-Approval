import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-sm font-bold text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-3 border rounded-xl outline-none transition-all
              appearance-none bg-no-repeat bg-[right_1rem_center]
              focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500
              ${error 
                ? 'border-red-500 focus:ring-red-500 bg-red-50/50' 
                : 'border-gray-300 focus:ring-blue-500'
              }
              ${className}
            `}
            style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', 
              backgroundSize: '1.5em' 
            }}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-500 text-xs font-bold mt-1 animate-pulse">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
