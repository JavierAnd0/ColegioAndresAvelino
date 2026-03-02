import Label from '@/components/atoms/Typography/Label';
import Input from '@/components/atoms/Input';

export default function FormField({
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    className = '',
}) {
    return (
        <div className={`flex flex-col gap-1.5 w-full ${className}`}>
            {label && (
                <Label htmlFor={name} required={required}>
                    {label}
                </Label>
            )}
            <Input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                error={error}
                disabled={disabled}
            />
        </div>
    );
}