export default function ToggleSwitch({
    checked = false,
    onChange,
    label,
    name,
    disabled = false,
}) {
    return (
        <label className={`inline-flex items-center gap-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                disabled={disabled}
                onClick={() => onChange?.({ target: { name, type: 'checkbox', checked: !checked } })}
                className={`
                    relative inline-flex h-5 w-9 shrink-0 items-center rounded-full
                    transition-colors duration-200 ease-in-out
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2
                    ${checked ? 'bg-neutral-900' : 'bg-neutral-300'}
                    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
            >
                <span
                    className={`
                        pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm
                        ring-0 transition-transform duration-200 ease-in-out
                        ${checked ? 'translate-x-[18px]' : 'translate-x-[3px]'}
                    `}
                />
            </button>
            {label && <span className="text-sm text-neutral-700 select-none">{label}</span>}
        </label>
    );
}
