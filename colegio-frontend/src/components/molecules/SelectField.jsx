import Label from '@/components/atoms/Typography/Label';

export default function SelectField({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder,
    error,
    required = false,
    disabled = false,
    className = '',
}) {
    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            {label && <Label htmlFor={name} required={required}>{label}</Label>}
            <div className="relative">
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`
                        w-full px-3 py-2.5 text-sm appearance-none cursor-pointer
                        bg-white border rounded-lg text-neutral-900
                        transition-all duration-200 outline-none
                        ${error
                            ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                            : 'border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent'
                        }
                        disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-400
                    `}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
