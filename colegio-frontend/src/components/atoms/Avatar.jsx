const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export default function Avatar({ src, alt, name, size = 'md', className = '' }) {
  // Generar iniciales del nombre
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-neutral-200 ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={alt || name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-semibold text-neutral-600">{initials}</span>
      )}
    </div>
  );
}