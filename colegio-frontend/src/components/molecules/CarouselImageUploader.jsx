'use client';
import { useState, useRef } from 'react';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import api from '@/services/api';
import { LuImage, LuInfo } from 'react-icons/lu';

const CANVAS_W = 1000;
const CANVAS_H = 500;

/**
 * Procesa la imagen en el cliente antes de subirla:
 * 1. Fondo: imagen escalada para cubrir el canvas + blur
 * 2. Frente: imagen centrada con object-contain (sin recorte)
 * Resultado: JPEG 1920×800 listo para el carousel.
 */
async function processImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width  = CANVAS_W;
            canvas.height = CANVAS_H;
            const ctx = canvas.getContext('2d');

            // — Fondo desenfocado —
            // Escalar la imagen para cubrir el canvas (object-cover)
            const scaleW = CANVAS_W / img.width;
            const scaleH = CANVAS_H / img.height;
            const bgScale = Math.max(scaleW, scaleH) * 1.15; // un poco más grande para el blur
            const bgW = img.width  * bgScale;
            const bgH = img.height * bgScale;
            const bgX = (CANVAS_W - bgW) / 2;
            const bgY = (CANVAS_H - bgH) / 2;

            ctx.filter = 'blur(24px) brightness(0.55)';
            ctx.drawImage(img, bgX, bgY, bgW, bgH);
            ctx.filter = 'none';

            // — Overlay oscuro suave —
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            // — Imagen principal centrada (object-contain) —
            const fgScale = Math.min(scaleW, scaleH);
            const fgW = img.width  * fgScale;
            const fgH = img.height * fgScale;
            const fgX = (CANVAS_W - fgW) / 2;
            const fgY = (CANVAS_H - fgH) / 2;
            ctx.drawImage(img, fgX, fgY, fgW, fgH);

            canvas.toBlob(blob => {
                if (!blob) return reject(new Error('Error al procesar la imagen'));
                const processed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                    type: 'image/jpeg',
                });
                resolve(processed);
            }, 'image/jpeg', 0.92);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

export default function CarouselImageUploader({ onUpload, currentImage = '', uploadEndpoint = '/upload/carousel' }) {
    const [preview, setPreview] = useState(currentImage);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const inputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 12 * 1024 * 1024) {
            setError('La imagen no puede superar 12 MB.');
            return;
        }

        // Preview local inmediato (imagen original)
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setError('');
        setLoading(true);

        try {
            // Procesar en canvas → JPEG 1920×800
            const processed = await processImage(file);

            // Subir al servidor
            const formData = new FormData();
            formData.append('image', processed);
            const response = await api.post(uploadEndpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Preview con la imagen ya procesada desde Cloudinary
            setPreview(response.data.data.url);
            onUpload?.(response.data.data);
        } catch {
            setError('Error al procesar o subir la imagen. Intenta de nuevo.');
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

            {/* Info de tamaño */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-brand-50 border border-brand-100 text-xs text-brand-700">
                <LuInfo className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                    La imagen se procesará automáticamente a <strong>1000 × 500 px</strong> con fondo desenfocado.
                    Funciona mejor con imágenes <strong>horizontales</strong> (paisaje).
                    Formatos: JPG, PNG, WebP · Máx 12 MB.
                </span>
            </div>

            {/* Área de preview */}
            <div
                onClick={() => !loading && inputRef.current?.click()}
                className={`relative w-full rounded-xl border-2 border-dashed overflow-hidden
                    flex flex-col items-center justify-center gap-2 transition-all duration-200
                    ${preview
                        ? 'border-neutral-300 cursor-default'
                        : 'border-neutral-300 hover:border-brand-400 cursor-pointer hover:bg-brand-50'
                    }`}
                style={{ aspectRatio: '1000 / 500' }}  /* proporción real del canvas */
            >
                {preview ? (
                    <>
                        <img
                            src={/^(blob:|https?:\/\/)/.test(preview) ? preview : ''}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        {loading && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                                <Spinner size="md" />
                                <p className="text-white text-xs font-medium">Procesando imagen…</p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <LuImage className="w-8 h-8 text-neutral-400" />
                        <p className="text-sm text-neutral-500 text-center px-4">
                            Haz clic para subir una imagen
                        </p>
                        <p className="text-xs text-neutral-400">Relación ideal 2:1 · horizontal</p>
                    </>
                )}
            </div>

            {/* Error */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Botones */}
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
