'use client';
import { useRef, useCallback } from 'react';
import Label from '@/components/atoms/Typography/Label';

const tools = [
    { key: 'h2', label: 'H2', syntax: ['## ', ''], title: 'Título', block: true },
    { key: 'h3', label: 'H3', syntax: ['### ', ''], title: 'Subtítulo', block: true },
    { key: 'bold', label: 'B', syntax: ['**', '**'], title: 'Negrita', className: 'font-bold' },
    { key: 'italic', label: 'I', syntax: ['_', '_'], title: 'Cursiva', className: 'italic' },
    { key: 'underline', label: 'U', syntax: ['<u>', '</u>'], title: 'Subrayado', className: 'underline' },
    { key: 'separator', label: '|' },
    { key: 'ul', label: '• Lista', syntax: ['- ', ''], title: 'Lista', block: true },
    { key: 'link', label: 'Link', syntax: ['[', '](url)'], title: 'Enlace' },
];

export default function RichTextarea({
    name,
    value,
    onChange,
    error,
    label,
    required = false,
    placeholder = '',
    rows = 10,
}) {
    const textareaRef = useRef(null);

    const applyFormat = useCallback((tool) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = value;
        const selected = text.substring(start, end);
        const [prefix, suffix] = tool.syntax;

        let newText;
        let newCursorPos;

        if (tool.block) {
            // Para bloques: insertar al inicio de la línea
            const lineStart = text.lastIndexOf('\n', start - 1) + 1;
            const before = text.substring(0, lineStart);
            const after = text.substring(lineStart);

            if (selected) {
                // Aplicar a cada línea seleccionada
                const lines = text.substring(lineStart, end).split('\n');
                const formatted = lines.map(line => prefix + line).join('\n');
                newText = before + formatted + text.substring(end);
                newCursorPos = end + (lines.length * prefix.length);
            } else {
                newText = before + prefix + after;
                newCursorPos = lineStart + prefix.length;
            }
        } else {
            // Para inline: envolver selección
            if (selected) {
                newText = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
                newCursorPos = end + prefix.length + suffix.length;
            } else {
                newText = text.substring(0, start) + prefix + suffix + text.substring(end);
                newCursorPos = start + prefix.length;
            }
        }

        // Emitir el cambio
        const event = {
            target: { name, value: newText },
        };
        onChange(event);

        // Restaurar foco y posición del cursor
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.selectionStart = newCursorPos;
            textarea.selectionEnd = newCursorPos;
        });
    }, [value, name, onChange]);

    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && <Label htmlFor={name} required={required}>{label}</Label>}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-neutral-50 border border-neutral-200 border-b-0 rounded-t-lg">
                {tools.map((tool) => {
                    if (tool.key === 'separator') {
                        return <div key={tool.key} className="w-px h-5 bg-neutral-200 mx-1 hidden sm:block" />;
                    }
                    return (
                        <button
                            key={tool.key}
                            type="button"
                            title={tool.title}
                            onClick={() => applyFormat(tool)}
                            className={`
                                px-2 py-1 text-xs rounded transition-colors duration-150
                                text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900
                                cursor-pointer select-none
                                ${tool.className || ''}
                            `}
                        >
                            {tool.label}
                        </button>
                    );
                })}

                <span className="ml-auto text-[10px] text-neutral-400 tabular-nums">
                    {wordCount} palabras
                </span>
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className={`
                    w-full px-3 py-2.5 text-sm resize-y min-h-[200px]
                    bg-white border rounded-b-lg rounded-t-none
                    text-neutral-900 placeholder-neutral-400
                    transition-all duration-200 outline-none
                    leading-relaxed
                    ${error
                        ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                        : 'border-neutral-200 focus:ring-2 focus:ring-neutral-900 focus:border-transparent'
                    }
                `}
            />

            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
