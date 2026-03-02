export default function Skeleton({ className = '', rounded = 'md' }) {
    const roundedMap = {
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
    };

    return (
        <div
            className={`
        bg-neutral-200 animate-pulse
        ${roundedMap[rounded]}
        ${className}
      `}
        />
    );
}
