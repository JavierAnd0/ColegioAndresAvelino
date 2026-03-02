const sizes = {
    h1: 'text-4xl md:text-5xl font-bold',
    h2: 'text-3xl md:text-4xl font-bold',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    h5: 'text-lg md:text-xl font-medium',
    h6: 'text-base md:text-lg font-medium',
};

export default function Heading({
    level = 'h2',
    children,
    className = '',
}) {
    const Tag = level;

    return (
        <Tag className={`text-neutral-900 leading-tight tracking-tight ${sizes[level]} ${className}`}>
            {children}
        </Tag>
    );
}