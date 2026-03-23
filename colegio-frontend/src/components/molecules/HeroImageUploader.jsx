'use client';
import { useState, useRef } from 'react';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import api from '@/services/api';
import { LuImage, LuInfo, LuGraduationCap } from 'react-icons/lu';

export default function HeroImageUploader({ onUpload, currentImage = '' }) {
    const [preview, setPreview] = useState(currentImage);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const inputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 15 * 1024 * 1024) {
            setError('La imagen no puede superar 15 MB.');
            return;
        }

        setPreview(URL.createObjectURL(file));
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await api.post('/upload/hero', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPreview(response.data.data.url);
            onUpload?.(response.data.data);
        } catch {
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
        <div className="flex flex-col gap-3">

            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-brand-50 border border-brand-100 text-xs text-brand-700">
                <LuInfo className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                    La imagen se mostrará como <strong>fondo de pantalla completa</strong> del hero.
                    Usa una imagen horizontal de <strong>alta resolución</strong> (mín. 1280 px de ancho).
                    JPG, PNG, WebP · Máx 15 MB.
                </span>
            </div>

            {/* Preview — simula el hero */}
            <div
                onClick={() => !loading && inputRef.current?.click()}
                className={`relative w-full rounded-xl overflow-hidden transition-all duration-200
                    ${!preview ? 'border-2 border-dashed border-neutral-300 hover:border-brand-400 cursor-pointer hover:bg-brand-50' : 'cursor-default'}`}
                style={{ aspectRatio: '16/6' }}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />

                        {/* Overlay gradient — muestra cómo se verá en el hero */}
                        {!loading && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/50 to-neutral-950/10" />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-neutral-950/30" />
                                {/* Texto de ejemplo */}
                                <div className="absolute bottom-0 left-0 p-4 flex flex-col gap-1">
                                    <p className="text-[0.6rem] font-mono text-brand-400 uppercase tracking-widest">Vista previa del hero</p>
                                    <p className="text-white font-bold text-sm leading-tight">Formando los líderes del mañana</p>
                                    <p className="text-white/60 text-[0.6rem]">Así se verá el texto sobre tu imagen</p>
                                </div>
                            </>
                        )}

                        {loading && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                                <Spinner size="md" />
                                <p className="text-white text-xs font-medium">Subiendo imagen…</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 py-8">
                        <LuImage className="w-8 h-8 text-neutral-400" />
                        <p className="text-sm text-neutral-500">Haz clic para subir la imagen de fondo del hero</p>
                        <p className="text-xs text-neutral-400">Horizontal · alta resolución</p>
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" loading={loading}
                    onClick={() => inputRef.current?.click()}>
                    {preview ? 'Cambiar imagen' : 'Subir imagen'}
                </Button>
                {preview && !loading && (
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                        Eliminar
                    </Button>
                )}
            </div>

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
