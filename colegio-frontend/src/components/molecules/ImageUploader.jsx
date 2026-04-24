'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import api from '@/services/api';
import { safeImageUrl } from '@/lib/safeImageUrl';
import { LuImage, LuClipboard } from 'react-icons/lu';
import usePasteImage from '@/hooks/usePasteImage';

export default function ImageUploader({
    onUpload,
    currentImage = '',
    endpoint = '/upload/blog',
    className = '',
    actions = null,
}) {
    const [preview, setPreview] = useState(currentImage);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pasteHint, setPasteHint] = useState(false);
    const inputRef = useRef(null);

    // Hint flash on focus/hover
    const showPasteHint = useCallback(() => setPasteHint(true), []);
    const hidePasteHint = useCallback(() => setPasteHint(false), []);

    // Paste from clipboard
    usePasteImage(useCallback((file) => {
        if (!loading) handleFileUpload(file);
    }, [loading]), true);

    useEffect(() => {
        setPreview(currentImage);
    }, [currentImage]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await handleFileUpload(file);
    };

    const handleFileUpload = async (file) => {
        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no puede superar 5MB.');
            return;
        }

        // Mostrar preview local inmediato
        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            onUpload?.(response.data.data);
        } catch (err) {
            setError('Error al subir la imagen. Intenta de nuevo.');
            setPreview(currentImage);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setPreview('');
        onUpload?.(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>

            {/* Área de preview */}
            <div
                onClick={() => !loading && inputRef.current?.click()}
                onMouseEnter={showPasteHint}
                onMouseLeave={hidePasteHint}
                onFocus={showPasteHint}
                onBlur={hidePasteHint}
                className={`
          relative w-full h-48 rounded-xl border-2 border-dashed
          flex flex-col items-center justify-center gap-2
          transition-all duration-200 overflow-hidden
          ${preview
                        ? 'border-neutral-300'
                        : 'border-neutral-300 hover:border-neutral-500 cursor-pointer hover:bg-neutral-50'
                    }
        `}
            >
                {preview ? (
                    <>
                        <img
                            src={safeImageUrl(preview)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        {loading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Spinner size="md" />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <LuImage className="w-8 h-8 text-neutral-400" />
                        <p className="text-sm text-neutral-500 text-center px-4">
                            Click para subir imagen
                        </p>
                        <p className="text-xs text-neutral-400 flex items-center gap-1">
                            <LuClipboard className="w-3 h-3" /> Pega con Ctrl+V · JPG, PNG, WebP · Máx 5MB
                        </p>
                    </>
                )}

                {/* Paste hint overlay */}
                {!preview && pasteHint && (
                    <div className="absolute inset-0 bg-neutral-900/5 flex items-center justify-center rounded-xl pointer-events-none">
                        <span className="text-xs font-semibold text-neutral-500 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
                            Ctrl+V para pegar imagen
                        </span>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Botones */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={loading}
                    onClick={() => inputRef.current?.click()}
                >
                    {preview ? 'Cambiar imagen' : 'Subir imagen'}
                </Button>
                {preview && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemove}
                    >
                        Eliminar
                    </Button>
                )}
                {actions}
            </div>

            {/* Input oculto */}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}