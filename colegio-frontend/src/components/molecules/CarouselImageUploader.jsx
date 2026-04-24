'use client';
import { useState, useRef, useCallback } from 'react';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import api from '@/services/api';
import { safeImageUrl } from '@/lib/safeImageUrl';
import { LuImage, LuInfo, LuClipboard, LuX, LuCrop, LuSlidersHorizontal } from 'react-icons/lu';
import usePasteImage from '@/hooks/usePasteImage';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';

const CANVAS_W = 1000;
const CANVAS_H = 500;
const ASPECT    = CANVAS_W / CANVAS_H; // 2:1

/**
 * Aplica un fondo desenfocado al canvas y dibuja la imagen recortada encima.
 * Recibe un Blob/File de la imagen ya recortada.
 */
async function buildCarouselImage(croppedBlob) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width  = CANVAS_W;
            canvas.height = CANVAS_H;
            const ctx = canvas.getContext('2d');

            // — Fondo desenfocado (object-cover del original recortado) —
            const scaleW  = CANVAS_W / img.width;
            const scaleH  = CANVAS_H / img.height;
            const bgScale = Math.max(scaleW, scaleH) * 1.15;
            const bgW = img.width  * bgScale;
            const bgH = img.height * bgScale;
            ctx.filter = 'blur(20px) brightness(0.5)';
            ctx.drawImage(img, (CANVAS_W - bgW) / 2, (CANVAS_H - bgH) / 2, bgW, bgH);
            ctx.filter = 'none';

            // — Imagen recortada, escalada para llenar el canvas (object-cover) —
            const fgScale = Math.max(scaleW, scaleH);
            const fgW = img.width  * fgScale;
            const fgH = img.height * fgScale;
            ctx.drawImage(img, (CANVAS_W - fgW) / 2, (CANVAS_H - fgH) / 2, fgW, fgH);

            canvas.toBlob(blob => {
                if (!blob) return reject(new Error('Error al procesar la imagen'));
                resolve(new File([blob], 'carousel.jpg', { type: 'image/jpeg' }));
            }, 'image/jpeg', 0.92);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(croppedBlob);
    });
}

export default function CarouselImageUploader({ onUpload, currentImage = '', uploadEndpoint = '/upload/carousel' }) {
    const [preview,  setPreview]  = useState(currentImage);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');

    // — Crop modal state —
    const [tempImage,         setTempImage]         = useState(null);
    const [cropModalOpen,     setCropModalOpen]     = useState(false);
    const [crop,              setCrop]              = useState({ x: 0, y: 0 });
    const [zoom,              setZoom]              = useState(1);
    const [brightness,        setBrightness]        = useState(100); // 70–130 %
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const inputRef = useRef(null);

    const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

    /* ── Abre el modal con la imagen seleccionada ── */
    const openCropModal = useCallback((file) => {
        if (!file) return;
        if (file.size > 12 * 1024 * 1024) { setError('La imagen no puede superar 12 MB.'); return; }
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!validTypes.includes(file.type)) { setError('Solo se permiten JPG, PNG o WebP.'); return; }
        setError('');
        setTempImage(URL.createObjectURL(file));
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setBrightness(100);
        setCropModalOpen(true);
    }, []);

    /* ── Confirma el recorte y sube ── */
    const handleCropSave = async () => {
        if (!tempImage || !croppedAreaPixels) return;
        setLoading(true);
        setCropModalOpen(false);
        try {
            // 1. Obtener el recorte como blob URL
            const croppedBlobUrl = await getCroppedImg(tempImage, croppedAreaPixels);

            // 2. Aplicar brillo si es distinto al default
            let finalBlobUrl = croppedBlobUrl;
            if (brightness !== 100) {
                const resp = await fetch(croppedBlobUrl);
                const blob = await resp.blob();
                const blobFile = new File([blob], 'tmp.jpg', { type: 'image/jpeg' });
                finalBlobUrl = await applyBrightness(blobFile, brightness / 100);
            }

            // 3. Pasar por buildCarouselImage (añade fondo blurred)
            const resp2   = await fetch(finalBlobUrl);
            const blob2   = await resp2.blob();
            const processed = await buildCarouselImage(blob2);

            // Preview inmediato con el resultado del canvas
            setPreview(URL.createObjectURL(processed));

            // 4. Subir al servidor
            const formData = new FormData();
            formData.append('image', processed);
            const response = await api.post(uploadEndpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPreview(response.data.data.url);
            onUpload?.(response.data.data);
        } catch {
            setError('Error al procesar o subir la imagen. Intenta de nuevo.');
            setPreview(currentImage);
        } finally {
            setLoading(false);
            setTempImage(null);
        }
    };

    const handleCropCancel = () => {
        setCropModalOpen(false);
        setTempImage(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) openCropModal(file);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleRemove = () => {
        setPreview('');
        onUpload?.(null);
    };

    /* Paste from clipboard */
    usePasteImage(useCallback((file) => {
        if (!loading && !cropModalOpen) openCropModal(file);
    }, [loading, cropModalOpen, openCropModal]));

    return (
        <div className="flex flex-col gap-3">

            {/* Info banner */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-brand-50 border border-brand-100 text-xs text-brand-700">
                <LuInfo className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                    Ajusta el encuadre exacto antes de subir. El resultado final será <strong>1000 × 500 px</strong> con fondo desenfocado automático.
                    Formatos: JPG, PNG, WebP · Máx 12 MB.
                </span>
            </div>

            {/* Área de preview */}
            <div
                onClick={() => !loading && !preview && inputRef.current?.click()}
                className={`relative w-full rounded-xl border-2 border-dashed overflow-hidden
                    flex flex-col items-center justify-center gap-2 transition-all duration-200
                    ${preview
                        ? 'border-neutral-300 cursor-default'
                        : 'border-neutral-300 hover:border-brand-400 cursor-pointer hover:bg-brand-50'
                    }`}
                style={{ aspectRatio: '1000 / 500' }}
            >
                {preview ? (
                    <>
                        <img
                            src={safeImageUrl(preview)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        {loading && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                                <Spinner size="md" />
                                <p className="text-white text-xs font-medium">Procesando imagen…</p>
                            </div>
                        )}
                        {/* Overlay de acciones cuando hay preview */}
                        {!loading && (
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-200 flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                                        bg-white/90 text-neutral-900 text-xs font-semibold
                                        hover:bg-white transition-colors cursor-pointer shadow-md"
                                >
                                    <LuCrop className="w-3.5 h-3.5" /> Reencuadrar
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                                        bg-red-500/90 text-white text-xs font-semibold
                                        hover:bg-red-600 transition-colors cursor-pointer shadow-md"
                                >
                                    <LuX className="w-3.5 h-3.5" /> Eliminar
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <LuImage className="w-8 h-8 text-neutral-400" />
                        <p className="text-sm text-neutral-500 text-center px-4">
                            Haz clic para seleccionar una imagen
                        </p>
                        <p className="text-xs text-neutral-400 flex items-center gap-1">
                            <LuClipboard className="w-3 h-3" /> Pega con Ctrl+V · Relación ideal 2:1
                        </p>
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

            {/* ── Modal de recorte ── */}
            {cropModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">

                        {/* Header */}
                        <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-display font-bold text-neutral-900">Ajustar imagen</h3>
                                <p className="text-xs text-neutral-400 mt-0.5">Encuadra el área que se mostrará en el carrusel (2:1)</p>
                            </div>
                            <button type="button" onClick={handleCropCancel}
                                className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-lg hover:bg-neutral-100">
                                <LuX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Cropper area — proporción 2:1 como el carousel */}
                        <div className="relative w-full bg-neutral-900" style={{ aspectRatio: '2 / 1' }}>
                            <Cropper
                                image={tempImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={ASPECT}
                                cropShape="rect"
                                showGrid={true}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                style={{
                                    containerStyle: { borderRadius: 0 },
                                    mediaStyle: { filter: `brightness(${brightness}%)` },
                                }}
                            />
                        </div>

                        {/* Controles */}
                        <div className="p-5 flex flex-col gap-4 bg-neutral-50 border-t border-neutral-100">

                            {/* Zoom */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-neutral-500 w-20 flex-shrink-0 flex items-center gap-1.5">
                                    <LuCrop className="w-3.5 h-3.5" /> Zoom
                                </span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.05}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                                />
                                <span className="text-xs font-mono text-neutral-400 w-10 text-right">
                                    {zoom.toFixed(1)}×
                                </span>
                            </div>

                            {/* Brillo */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-neutral-500 w-20 flex-shrink-0 flex items-center gap-1.5">
                                    <LuSlidersHorizontal className="w-3.5 h-3.5" /> Brillo
                                </span>
                                <input
                                    type="range"
                                    value={brightness}
                                    min={60}
                                    max={140}
                                    step={2}
                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                    className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                                />
                                <span className="text-xs font-mono text-neutral-400 w-10 text-right">
                                    {brightness}%
                                </span>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-3 justify-end pt-1 border-t border-neutral-200">
                                <Button type="button" variant="ghost" onClick={handleCropCancel}>
                                    Cancelar
                                </Button>
                                <Button type="button" variant="primary" onClick={handleCropSave} loading={loading}>
                                    Aplicar y subir
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Helper: aplicar brillo via canvas ── */
async function applyBrightness(file, factor) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width  = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.filter = `brightness(${factor})`;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
                resolve(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.95);
        };
        img.src = URL.createObjectURL(file);
    });
}
