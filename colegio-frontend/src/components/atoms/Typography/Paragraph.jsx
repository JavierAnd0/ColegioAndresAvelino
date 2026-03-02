const sizes = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
};

const colors = {
    default: 'text-neutral-700',
    muted: 'text-neutral-500',
    light: 'text-neutral-400',
    dark: 'text-neutral-900',
};

export default function Paragraph({
    children,
    size = 'base',
    color = 'default',
    className = '',
}) {
    return (
        <p className={`${sizes[size]} ${colors[color]} ${className}`}>
            {children}
        </p>
    );
}