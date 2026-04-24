'use client';
import { useEffect } from 'react';

/**
 * usePasteImage — escucha eventos paste y clipboard global.
 * Extrae el primer elemento imagen que encuentre y llama a onFile(file).
 *
 * @param {function} onFile  - callback que recibe el objeto File de la imagen pegada
 * @param {boolean}  enabled - si es false el listener no se registra (ej: cuando hay un modal abierto)
 */
export default function usePasteImage(onFile, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of items) {
                if (item.kind === 'file' && item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        e.preventDefault();
                        onFile(file);
                        break;
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [onFile, enabled]);
}
