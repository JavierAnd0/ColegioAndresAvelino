export default function Label({
    children,
    htmlFor,
    required = false,
    className = '',
}) {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-sm font-medium text-neutral-700 ${className}`}
        >
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
}