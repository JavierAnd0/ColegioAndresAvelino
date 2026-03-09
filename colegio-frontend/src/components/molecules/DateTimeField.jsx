import Label from '@/components/atoms/Typography/Label';

export default function DateTimeField({
    label,
    nameDate,
    nameTime,
    valueDate,
    valueTime,
    onChange,
    error,
    required = false,
    disabled = false,
    hideTime = false,
}) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <Label required={required}>{label}</Label>}

            <div className={`grid gap-2 ${hideTime ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {/* Date */}
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                    </div>
                    <input
                        type="date"
                        name={nameDate}
                        value={valueDate}
                        onChange={onChange}
                        disabled={disabled}
                        required={required}
                        className={`
                            w-full pl-9 pr-3 py-2.5 text-sm
                            bg-white border rounded-lg text-neutral-900
                            transition-all duration-200 outline-none cursor-pointer
                            ${error
                                ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                                : 'border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent'
                            }
                            disabled:bg-neutral-50 disabled:cursor-not-allowed
                        `}
                    />
                </div>

                {/* Time */}
                {!hideTime && (
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <input
                            type="time"
                            name={nameTime}
                            value={valueTime}
                            onChange={onChange}
                            disabled={disabled}
                            className={`
                                w-full pl-9 pr-3 py-2.5 text-sm
                                bg-white border rounded-lg text-neutral-900
                                transition-all duration-200 outline-none cursor-pointer
                                ${error
                                    ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                                    : 'border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent'
                                }
                                disabled:bg-neutral-50 disabled:cursor-not-allowed
                            `}
                        />
                    </div>
                )}
            </div>

            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
