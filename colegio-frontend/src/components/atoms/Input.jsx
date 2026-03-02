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
          w-full px-3 py-2 text-base
          bg-white border rounded-md
          text-neutral-900 placeholder-neutral-400
          transition-all duration-200
          outline-none
          ${error
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                        : 'border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100'
                    }
          disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400
          ${className}
        `}
                {...props}
            />
            {error && (
                <span className="text-sm text-red-500">{error}</span>
            )}
        </div>
    );
}