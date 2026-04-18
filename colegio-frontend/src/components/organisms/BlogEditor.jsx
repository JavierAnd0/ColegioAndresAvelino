'use client';
import { useState, useRef } from 'react';
import FormField from '@/components/molecules/FormField';
import RichTextarea from '@/components/molecules/RichTextarea';
import AlertMessage from '@/components/molecules/AlertMessage';
import { safeImageUrl } from '@/lib/safeImageUrl';
import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Typography/Label';
import Textarea from '@/components/atoms/Textarea';
import ToggleSwitch from '@/components/atoms/ToggleSwitch';
import Spinner from '@/components/atoms/Spinner';
import { blogService } from '@/services/blogService';
import api from '@/services/api';
import {
    LuImage, LuSearch, LuX, LuCheck, LuChevronLeft, LuChevronRight,
    LuUpload, LuSparkles, LuPencil, LuStar, LuGlobe, LuArchive, LuPenLine, LuExternalLink,
} from 'react-icons/lu';

/* ══════════════════════════════════════
   CONSTANTS
══════════════════════════════════════ */
const categories = [
    { value: 'noticias',    label: 'Noticias' },
    { value: 'eventos',     label: 'Eventos' },
    { value: 'actividades', label: 'Actividades' },
    { value: 'logros',      label: 'Logros' },
    { value: 'anuncios',    label: 'Anuncios' },
    { value: 'general',     label: 'General' },
];

const statusOptions = [
    {
        value: 'borrador',
        label: 'Borrador',
        desc: 'Solo visible para ti',
        Icon: LuPenLine,
        iconBg: 'bg-neutral-200',
        iconColor: 'text-neutral-600',
        activeBorder: 'border-neutral-400',
        activeBg: 'bg-neutral-50',
    },
    {
        value: 'publicado',
        label: 'Publicado',
        desc: 'Visible para todos',
        Icon: LuGlobe,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        activeBorder: 'border-green-400',
        activeBg: 'bg-green-50',
    },
    {
        value: 'archivado',
        label: 'Archivado',
        desc: 'Oculto del blog',
        Icon: LuArchive,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        activeBorder: 'border-yellow-400',
        activeBg: 'bg-yellow-50',
    },
];

const cropRatios = [
    { value: '16/9', label: '16:9', hint: 'Panorámica', w: 16, h: 9 },
    { value: '4/3',  label: '4:3',  hint: 'Estándar',   w: 4,  h: 3 },
    { value: '3/2',  label: '3:2',  hint: 'Clásica',    w: 3,  h: 2 },
    { value: '1/1',  label: '1:1',  hint: 'Cuadrada',   w: 1,  h: 1 },
];

const categoryColors = {
    noticias:    'bg-blue-50 text-blue-700 border-blue-200',
    eventos:     'bg-brand-50 text-brand-700 border-brand-200',
    actividades: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    logros:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    anuncios:    'bg-red-50 text-red-600 border-red-200',
    general:     'bg-neutral-100 text-neutral-600 border-neutral-200',
};

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function SectionLabel({ title, subtitle }) {
    return (
        <div className="mb-4">
            <p className="font-display font-bold text-neutral-900 text-sm">{title}</p>
            {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
    );
}

function CropRatioIcon({ w, h, active }) {
    const MAX = 20;
    const scale = MAX / Math.max(w, h);
    const rw = w * scale;
    const rh = h * scale;
    return (
        <svg width="26" height="20" viewBox="0 0 26 20" className={active ? 'text-white' : 'text-neutral-500'}>
            <rect x={(26 - rw) / 2} y={(20 - rh) / 2} width={rw} height={rh} rx="1.5" fill="currentColor" />
        </svg>
    );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
export default function BlogEditor({ onSubmit, initialData = {}, loading = false, savedPost = null }) {
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title:   initialData.title   || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        category:   initialData.category   || 'general',
        tags:       initialData.tags?.join(', ') || '',
        status:     initialData.status     || 'borrador',
        isFeatured: initialData.isFeatured || false,
        featuredImage: initialData.featuredImage
            ? { ...initialData.featuredImage, cropRatio: initialData.featuredImage.cropRatio || '16/9' }
            : { url: '', alt: '', cropRatio: '16/9' },
    });

    const [errors, setErrors]           = useState({});
    const [alert, setAlert]             = useState(null);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [uploadError, setUploadError] = useState('');

    /* Pexels */
    const [showPexels, setShowPexels]               = useState(false);
    const [pexelsQuery, setPexelsQuery]             = useState('');
    const [pexelsSuggestions, setPexelsSuggestions] = useState([]);
    const [loadingPexels, setLoadingPexels]         = useState(false);
    const [pexelsPage, setPexelsPage]               = useState(1);

    /* ── Handlers ── */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const setImageUrl = (url, alt = '') =>
        setForm(prev => ({ ...prev, featuredImage: { ...prev.featuredImage, url, alt } }));

    const setCropRatio = (ratio) =>
        setForm(prev => ({ ...prev, featuredImage: { ...prev.featuredImage, cropRatio: ratio } }));

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setUploadError('La imagen no puede superar 5MB.'); return; }
        setUploadError('');
        setImageUrl(URL.createObjectURL(file), form.title);
        setUploadingImg(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await api.post('/upload/blog', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setImageUrl(res.data.data.url, form.title);
        } catch {
            setUploadError('Error al subir la imagen.');
            setImageUrl('', '');
        } finally {
            setUploadingImg(false);
        }
    };

    const handlePexelsSearch = async (page = 1) => {
        const q = pexelsQuery.trim() || form.title.trim() || form.category;
        if (!q) return;
        setLoadingPexels(true);
        setPexelsPage(page);
        try {
            const res = await blogService.suggestImages({ title: q, category: form.category, count: 9, page });
            setPexelsSuggestions(res.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error al buscar en Pexels. Verifica la API key.' });
        } finally {
            setLoadingPexels(false);
        }
    };

    const handleSelectPexels = (img) => {
        setImageUrl(img.url, form.title || img.alt);
        setShowPexels(false);
        setPexelsSuggestions([]);
    };

    const generateExcerpt = () => {
        if (!form.content.trim()) return;
        const clean = form.content
            .replace(/#{1,6}\s/g, '').replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/_(.*?)_/g, '$1').replace(/<u>(.*?)<\/u>/g, '$1')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/^- /gm, '').trim();
        const truncated = clean.length > 280
            ? clean.substring(0, 280).replace(/\s+\S*$/, '') + '...'
            : clean;
        setForm(prev => ({ ...prev, excerpt: truncated }));
    };

    const validate = () => {
        const e = {};
        if (!form.title.trim())   e.title   = 'El título es obligatorio';
        if (!form.excerpt.trim()) e.excerpt  = 'El extracto es obligatorio';
        if (!form.content.trim()) e.content  = 'El contenido es obligatorio';
        return e;
    };

    const handleSubmit = async (e, statusOverride = null) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        try {
            const payload = {
                ...form,
                status: statusOverride || form.status,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            };
            await onSubmit(payload);
            setAlert({ type: 'success', message: 'Post guardado exitosamente.' });
        } catch (error) {
            setAlert({ type: 'error', message: error.message || 'Error al guardar el post.' });
        }
    };

    const hasImage  = !!form.featuredImage?.url;
    const cropRatio = form.featuredImage?.cropRatio || '16/9';
    const currentCrop = cropRatios.find(r => r.value === cropRatio) || cropRatios[0];
    const parsedTags  = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    const currentStatus = statusOptions.find(s => s.value === form.status) || statusOptions[0];

    /* ══════════════════════════════════════
       RENDER
    ══════════════════════════════════════ */
    return (
        <form onSubmit={handleSubmit} className="w-full">
            {alert && (
                <div className="mb-6">
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                </div>
            )}

            {/* ── Two-column layout on xl+ ── */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-8 items-start">

                {/* ════════════════════════════════
                    COLUMNA PRINCIPAL
                ════════════════════════════════ */}
                <div className="flex flex-col gap-8 min-w-0">

                    {/* ───────────────────────────
                        PORTADA
                    ─────────────────────────── */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="h-5 w-5 rounded-full bg-neutral-900 text-white flex items-center
                                justify-center text-[0.6rem] font-black flex-shrink-0">1</span>
                            <p className="font-display font-bold text-neutral-900 text-sm">Imagen de portada</p>
                        </div>

                        {!hasImage ? (
                            <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 overflow-hidden">
                                <div className="py-10 flex flex-col items-center gap-2 text-center px-4">
                                    <div className="h-12 w-12 rounded-xl bg-white border border-neutral-200
                                        shadow-sm flex items-center justify-center mb-1">
                                        <LuImage className="w-5 h-5 text-neutral-400" />
                                    </div>
                                    <p className="font-semibold text-neutral-700 text-sm">Sin imagen de portada</p>
                                    <p className="text-xs text-neutral-400 max-w-[220px] leading-relaxed">
                                        Una buena imagen aumenta el alcance de tu publicación
                                    </p>
                                </div>
                                <div className="border-t border-neutral-200 grid grid-cols-2 divide-x divide-neutral-200">
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center gap-2 py-5 px-4 text-center
                                            hover:bg-white transition-colors cursor-pointer group">
                                        <div className="h-8 w-8 rounded-xl bg-neutral-900 group-hover:bg-brand-600
                                            flex items-center justify-center transition-colors">
                                            <LuUpload className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-neutral-800">Subir imagen</p>
                                            <p className="text-[0.62rem] text-neutral-400 mt-0.5">JPG, PNG, WebP · máx 5MB</p>
                                        </div>
                                    </button>
                                    <button type="button"
                                        onClick={() => { setShowPexels(true); if (!pexelsSuggestions.length) handlePexelsSearch(1); }}
                                        className="flex flex-col items-center gap-2 py-5 px-4 text-center
                                            hover:bg-white transition-colors cursor-pointer group">
                                        <div className="h-8 w-8 rounded-xl bg-neutral-100 group-hover:bg-brand-50
                                            flex items-center justify-center transition-colors">
                                            <LuSearch className="w-3.5 h-3.5 text-neutral-500 group-hover:text-brand-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-neutral-800">Buscar en Pexels</p>
                                            <p className="text-[0.62rem] text-neutral-400 mt-0.5">Fotos gratuitas de alta calidad</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-black">
                                <div className="relative overflow-hidden" style={{ aspectRatio: cropRatio }}>
                                    {uploadingImg && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                            <Spinner size="md" />
                                        </div>
                                    )}
                                    <img src={safeImageUrl(form.featuredImage.url)} alt={form.featuredImage.alt || 'Preview'}
                                        className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                                        flex items-end justify-between p-4 gap-2">
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                                    bg-white/20 backdrop-blur-sm text-white text-xs font-semibold
                                                    hover:bg-white/30 transition-colors cursor-pointer border border-white/20">
                                                <LuPencil className="w-3 h-3" /> Cambiar
                                            </button>
                                            <button type="button"
                                                onClick={() => { setShowPexels(true); if (!pexelsSuggestions.length) handlePexelsSearch(1); }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                                    bg-white/20 backdrop-blur-sm text-white text-xs font-semibold
                                                    hover:bg-white/30 transition-colors cursor-pointer border border-white/20">
                                                <LuSearch className="w-3 h-3" /> Pexels
                                            </button>
                                        </div>
                                        <button type="button" onClick={() => setImageUrl('', '')}
                                            className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center
                                                text-white hover:bg-red-500/80 transition-colors cursor-pointer border border-white/20">
                                            <LuX className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Crop + alt */}
                                <div className="bg-neutral-950 px-4 py-3 flex flex-col gap-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-[0.58rem] font-mono font-bold uppercase tracking-widest
                                            text-neutral-500 flex-shrink-0 w-12">Recorte</span>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {cropRatios.map(r => (
                                                <button key={r.value} type="button" onClick={() => setCropRatio(r.value)}
                                                    title={r.hint}
                                                    className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-lg
                                                        transition-all cursor-pointer border
                                                        ${cropRatio === r.value
                                                            ? 'bg-white text-neutral-900 border-white'
                                                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'}`}>
                                                    <CropRatioIcon w={r.w} h={r.h} active={cropRatio === r.value} />
                                                    <span className="text-[0.55rem] font-mono font-bold leading-none">{r.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-[0.62rem] text-neutral-500 italic hidden sm:inline">
                                            {currentCrop.hint}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}

                        {/* Pexels picker */}
                        {showPexels && (
                            <div className="mt-3 rounded-2xl border border-neutral-200 overflow-hidden bg-white">
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                                    <div className="flex-1 flex items-center gap-2 bg-white border border-neutral-200
                                        rounded-lg px-3 py-2 focus-within:border-neutral-400 transition-colors">
                                        <LuSearch className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                                        <input type="text" value={pexelsQuery}
                                            onChange={e => setPexelsQuery(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handlePexelsSearch(1))}
                                            placeholder={form.title || 'Buscar fotos en Pexels...'}
                                            className="flex-1 text-xs bg-transparent outline-none text-neutral-700 placeholder-neutral-400" />
                                    </div>
                                    <button type="button" onClick={() => handlePexelsSearch(1)} disabled={loadingPexels}
                                        className="px-3 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold
                                            hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer flex-shrink-0">
                                        {loadingPexels
                                            ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                                            : 'Buscar'}
                                    </button>
                                    <button type="button" onClick={() => setShowPexels(false)}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg
                                            hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700
                                            transition-colors cursor-pointer flex-shrink-0">
                                        <LuX className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-3">
                                    {loadingPexels ? (
                                        <div className="flex items-center justify-center py-12"><Spinner size="md" /></div>
                                    ) : pexelsSuggestions.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-3 gap-2">
                                                {pexelsSuggestions.map((img, i) => (
                                                    <button key={i} type="button" onClick={() => handleSelectPexels(img)}
                                                        className="relative group rounded-xl overflow-hidden border-2 border-transparent
                                                            hover:border-brand-500 transition-all cursor-pointer aspect-[4/3]">
                                                        <img src={img.thumbnailUrl} alt={img.alt}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
                                                            flex items-center justify-center transition-colors">
                                                            <div className="h-9 w-9 rounded-full bg-white/0 group-hover:bg-white
                                                                flex items-center justify-center scale-75 group-hover:scale-100 transition-all">
                                                                <LuCheck className="w-4 h-4 text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </div>
                                                        {img.photographer && (
                                                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1
                                                                bg-gradient-to-t from-black/70 to-transparent
                                                                text-[0.55rem] text-white/80 truncate
                                                                opacity-0 group-hover:opacity-100 transition-opacity">
                                                                © {img.photographer}
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                                                <button type="button"
                                                    onClick={() => handlePexelsSearch(Math.max(1, pexelsPage - 1))}
                                                    disabled={loadingPexels || pexelsPage <= 1}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                                        border border-neutral-200 text-xs font-medium text-neutral-500
                                                        hover:bg-neutral-50 disabled:opacity-30 cursor-pointer transition-colors">
                                                    <LuChevronLeft className="w-3.5 h-3.5" /> Anteriores
                                                </button>
                                                <span className="text-[0.62rem] font-mono text-neutral-400">Pág. {pexelsPage}</span>
                                                <button type="button"
                                                    onClick={() => handlePexelsSearch(pexelsPage + 1)}
                                                    disabled={loadingPexels}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                                        border border-neutral-200 text-xs font-medium text-neutral-500
                                                        hover:bg-neutral-50 disabled:opacity-30 cursor-pointer transition-colors">
                                                    Más opciones <LuChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-10">
                                            <LuImage className="w-9 h-9 text-neutral-200 mx-auto mb-2" />
                                            <p className="text-sm text-neutral-400">
                                                {pexelsQuery || form.title
                                                    ? 'No se encontraron fotos. Intenta con otro término.'
                                                    : 'Escribe un término para buscar fotos.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleFileChange} className="hidden" />
                    </section>

                    {/* ───────────────────────────
                        CONTENIDO
                    ─────────────────────────── */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="h-5 w-5 rounded-full bg-neutral-900 text-white flex items-center
                                justify-center text-[0.6rem] font-black flex-shrink-0">2</span>
                            <p className="font-display font-bold text-neutral-900 text-sm">Contenido</p>
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Título grande */}
                            <div>
                                <input name="title" value={form.title} onChange={handleChange}
                                    placeholder="Escribe un título impactante..."
                                    className={`w-full font-display font-bold text-neutral-900
                                        text-2xl sm:text-3xl leading-tight bg-transparent outline-none
                                        border-b-2 pb-3 placeholder-neutral-300 transition-colors
                                        ${errors.title ? 'border-red-400' : 'border-neutral-200 focus:border-neutral-900'}`} />
                                <div className="flex items-center justify-between mt-1.5">
                                    {errors.title
                                        ? <p className="text-xs text-red-500">{errors.title}</p>
                                        : <span />}
                                    <span className={`text-xs font-mono tabular-nums
                                        ${form.title.length > 80 ? 'text-red-400' : 'text-neutral-300'}`}>
                                        {form.title.length}/100
                                    </span>
                                </div>
                            </div>

                            {/* Editor */}
                            <RichTextarea label="Contenido" name="content" value={form.content}
                                onChange={handleChange} error={errors.content} rows={14}
                                placeholder="Escribe el contenido del post..." required />

                            {/* Extracto */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <Label htmlFor="excerpt" required>Extracto</Label>
                                    <button type="button" onClick={generateExcerpt} disabled={!form.content.trim()}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
                                            text-neutral-500 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100
                                            rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                                        <LuSparkles className="h-3.5 w-3.5" /> Generar desde contenido
                                    </button>
                                </div>
                                <Textarea name="excerpt" placeholder="Breve resumen visible en el listado (máx. 300 caracteres)..."
                                    value={form.excerpt} onChange={handleChange} error={errors.excerpt} rows={3} />
                                <span className={`text-xs font-mono text-right
                                    ${form.excerpt.length > 280 ? 'text-red-400' : 'text-neutral-400'}`}>
                                    {form.excerpt.length}/300
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Acciones — solo visibles en mobile (xl oculta, se muestran en sidebar) */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-100 xl:hidden">
                        <ActionButtons initialData={initialData} loading={loading} handleSubmit={handleSubmit} savedPost={savedPost} />
                    </div>
                </div>

                {/* ════════════════════════════════
                    SIDEBAR DE PUBLICACIÓN (xl+)
                ════════════════════════════════ */}
                <aside className="xl:sticky xl:top-6 xl:self-start">
                    <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">

                        {/* Header del panel */}
                        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
                            <div className="flex items-center justify-between">
                                <p className="font-display font-bold text-neutral-900 text-sm">Publicación</p>
                                {/* Indicador de estado actual */}
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full
                                    text-[0.62rem] font-semibold border
                                    ${currentStatus.activeBg} ${currentStatus.activeBorder}
                                    text-neutral-700`}>
                                    <currentStatus.Icon className={`w-3 h-3 ${currentStatus.iconColor}`} />
                                    {currentStatus.label}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 flex flex-col gap-6">

                            {/* Estado */}
                            <div>
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Estado</p>
                                <div className="flex flex-col gap-2">
                                    {statusOptions.map(opt => (
                                        <button key={opt.value} type="button"
                                            onClick={() => setForm(p => ({ ...p, status: opt.value }))}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left
                                                ${form.status === opt.value
                                                    ? `${opt.activeBg} ${opt.activeBorder}`
                                                    : 'bg-white border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50'}`}>
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${opt.iconBg}`}>
                                                <opt.Icon className={`w-4 h-4 ${opt.iconColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-neutral-800">{opt.label}</p>
                                                <p className="text-[0.62rem] text-neutral-400 mt-0.5">{opt.desc}</p>
                                            </div>
                                            {form.status === opt.value && (
                                                <div className="h-4 w-4 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0">
                                                    <LuCheck className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Categoría */}
                            <div>
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Categoría</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {categories.map(cat => {
                                        const colors = categoryColors[cat.value] || categoryColors.general;
                                        const isActive = form.category === cat.value;
                                        return (
                                            <button key={cat.value} type="button"
                                                onClick={() => setForm(p => ({ ...p, category: cat.value }))}
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer
                                                    ${isActive
                                                        ? `${colors} ring-2 ring-offset-1 ring-neutral-900`
                                                        : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50'}`}>
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3">Tags</p>
                                <input type="text" name="tags" value={form.tags} onChange={handleChange}
                                    placeholder="deportes, cultura, noticias"
                                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg
                                        bg-white text-neutral-700 placeholder-neutral-400
                                        focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent
                                        transition-colors" />
                                {parsedTags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {parsedTags.map((tag, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded-full text-xs font-mono
                                                bg-neutral-100 text-neutral-500">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Destacar */}
                            <div className="flex items-center justify-between py-3 border-t border-neutral-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-7 w-7 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                        <LuStar className="w-3.5 h-3.5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-neutral-800">Destacar en inicio</p>
                                        <p className="text-[0.6rem] text-neutral-400">Visible en la página principal</p>
                                    </div>
                                </div>
                                <ToggleSwitch name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
                            </div>

                            {/* Acciones del sidebar */}
                            <div className="flex flex-col gap-2 pt-1">
                                <ActionButtons initialData={initialData} loading={loading} handleSubmit={handleSubmit} savedPost={savedPost} />
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </form>
    );
}

/* Botones reutilizables en mobile y sidebar */
function ActionButtons({ initialData, loading, handleSubmit, savedPost }) {
    const previewSlug = savedPost?.slug || initialData?.slug;
    const isPublished = (savedPost?.status || initialData?.status) === 'publicado';

    return (
        <>
            {initialData._id ? (
                <Button type="button" variant="primary" size="md" loading={loading}
                    onClick={(e) => handleSubmit(e)} className="w-full justify-center">
                    Guardar cambios
                </Button>
            ) : (
                <>
                    <Button type="button" variant="primary" size="md" loading={loading}
                        onClick={(e) => handleSubmit(e, 'publicado')} className="w-full justify-center">
                        Publicar
                    </Button>
                    <Button type="button" variant="secondary" size="md"
                        onClick={(e) => handleSubmit(e, 'borrador')} className="w-full justify-center">
                        Guardar borrador
                    </Button>
                </>
            )}

            {previewSlug && isPublished && (
                <a
                    href={`/blog/${previewSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 text-sm font-medium hover:bg-emerald-50 transition-colors"
                >
                    <LuExternalLink className="w-4 h-4" />
                    Ver entrada publicada
                </a>
            )}
        </>
    );
}
