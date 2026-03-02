'use client';
import { useState } from 'react';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

export default function SearchBar({
    placeholder = 'Buscar...',
    onSearch,
    initialValue = '',
    className = '',
}) {
    const [value, setValue] = useState(initialValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch?.(value.trim());
    };

    const handleClear = () => {
        setValue('');
        onSearch?.('');
    };

    return (
        <form onSubmit={handleSubmit} className={`flex gap-2 w-full ${className}`}>
            <div className="relative flex-1">
                <Input
                    type="search"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </div>
            {value && (
                <Button type="button" variant="ghost" size="md" onClick={handleClear}>
                    ✕
                </Button>
            )}
            <Button type="submit" variant="primary" size="md">
                Buscar
            </Button>
        </form>
    );
}