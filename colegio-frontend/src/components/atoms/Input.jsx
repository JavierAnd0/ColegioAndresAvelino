export default function Input({
    type = 'text',
    name,
    placeholder,
    value,
    onChange,
    error,
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <div className="flex flex-col gap-1 w-full">
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`
                    w-full px-3 py-2.5 text-sm
                    bg-white border rounded-lg
                    text-neutral-900 placeholder-neutral-400
                    transition-all duration-200 outline-none
                    ${error
                        ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                        : 'border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent'
                    }
                    disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-400
                    ${className}
                `}
                {...props}
            />
            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </div>
    );
}
