'use client';
import { useState } from 'react';
import FormField from '@/components/molecules/FormField';
import SelectField from '@/components/molecules/SelectField';
import RichTextarea from '@/components/molecules/RichTextarea';
import AlertMessage from '@/components/molecules/AlertMessage';
import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Typography/Label';
import Textarea from '@/components/atoms/Textarea';
import ImageUploader from '@/components/molecules/ImageUploader';
import ToggleSwitch from '@/components/atoms/ToggleSwitch';
import { blogService } from '@/services/blogService';


const categories = [
    { value: 'noticias', label: 'Noticias' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'actividades', label: 'Actividades' },
    { value: 'logros', label: 'Logros' },
    { value: 'anuncios', label: 'Anuncios' },
    { value: 'general', label: 'General' },
];

const statusOptions = [
    { value: 'borrador', label: 'Borrador', color: 'bg-neutral-200 text-neutral-700' },
    { value: 'publicado', label: 'Publicado', color: 'bg-green-100 text-green-700' },
    { value: 'archivado', label: 'Archivado', color: 'bg-yellow-100 text-yellow-700' },
];

export default function BlogEditor({ onSubmit, initialData = {}, loading = false }) {
    const [form, setForm] = useState({
        title: initialData.title || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        category: initialData.category || 'general',
        tags: initialData.tags?.join(', ') || '',
        status: initialData.status || 'borrador',
        isFeatured: initialData.isFeatured || false,
        featuredImage: initialData.featuredImage || { url: '', alt: '' },
    });

    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);

    // Estado para sugerencias de imágenes
    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleImageUpload = (imageData) => {
        setForm(prev => ({
            ...prev,
            featuredImage: imageData
                ? { url: imageData.url, alt: prev.title || '' }
                : { url: '', alt: '' },
        }));
        setSuggestions([]);
    };

    const handleSuggestImages = async () => {
        if (!form.title.trim() && !form.category) return;
        setLoadingSuggestions(true);
        try {
            const res = await blogService.suggestImages({
                category: form.category,
                title: form.title,
                count: 3,
            });
            setSuggestions(res.data || []);
            if ((res.data || []).length === 0) {
                setAlert({ type: 'info', message: 'No se encontraron imágenes sugeridas. Intenta con otro título.' });
            }
        } catch {
            setAlert({ type: 'error', message: 'Error al buscar imágenes. Verifica que PEXELS_API_KEY esté configurada.' });
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleSelectSuggestion = (image) => {
        setForm(prev => ({
            ...prev,
            featuredImage: { url: image.url, alt: form.title || image.alt },
        }));
        setSuggestions([]);
    };

    const generateExcerpt = () => {
        if (!form.content.trim()) return;
        // Limpiar markdown y tomar primeros ~280 caracteres
        const clean = form.content
            .replace(/#{1,6}\s/g, '')      // headings
            .replace(/\*\*(.*?)\*\*/g, '$1') // bold
            .replace(/_(.*?)_/g, '$1')       // italic
            .replace(/<u>(.*?)<\/u>/g, '$1') // underline
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
            .replace(/^- /gm, '')            // list items
            .trim();

        const truncated = clean.length > 280
            ? clean.substring(0, 280).replace(/\s+\S*$/, '') + '...'
            : clean;

        setForm(prev => ({ ...prev, excerpt: truncated }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = 'El título es obligatorio';
        if (!form.excerpt.trim()) newErrors.excerpt = 'El extracto es obligatorio';
        if (!form.content.trim()) newErrors.content = 'El contenido es obligatorio';
        return newErrors;
    };

    const handleSubmit = async (e, statusOverride = null) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-3xl">
            {alert && (
                <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <FormField label="Título" name="title" value={form.title}
                onChange={handleChange} error={errors.title} required
                placeholder="Título del post..." />

            {/* --- Contenido con editor enriquecido --- */}
            <RichTextarea
                label="Contenido"
                name="content"
                value={form.content}
                onChange={handleChange}
                error={errors.content}
                rows={14}
                placeholder="Escribe el contenido del post..."
                required
            />

            {/* --- Extracto con generación automática --- */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="excerpt" required>Extracto / Resumen</Label>
                    <button
                        type="button"
                        onClick={generateExcerpt}
                        disabled={!form.content.trim()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
                            text-neutral-500 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100
                            rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                        </svg>
                        Generar desde contenido
                    </button>
                </div>
                <Textarea name="excerpt" placeholder="Breve resumen del post (máx. 300 caracteres)..."
                    value={form.excerpt} onChange={handleChange} error={errors.excerpt} rows={2} />
                <span className="text-xs text-neutral-400 text-right">{form.excerpt.length}/300</span>
            </div>

            {/* --- Imagen destacada con búsqueda automática --- */}
            <div className="flex flex-col gap-1.5">
                <Label>Imagen destacada</Label>
                <ImageUploader
                    onUpload={handleImageUpload}
                    currentImage={form.featuredImage?.url}
                    endpoint="/upload/blog"
                />

                {/* Botón buscar imagen automáticamente */}
                {!form.featuredImage?.url && (
                    <button
                        type="button"
                        onClick={handleSuggestImages}
                        disabled={loadingSuggestions || !form.title.trim()}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm text-neutral-600
                            bg-neutral-50 border border-neutral-200 rounded-lg
                            hover:bg-neutral-100 hover:text-neutral-900 transition-colors
                            disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer mt-1"
                    >
                        {loadingSuggestions ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                        {loadingSuggestions ? 'Buscando...' : 'Buscar imagen automáticamente'}
                    </button>
                )}

                {/* Sugerencias de imágenes */}
                {suggestions.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-neutral-500 mb-2">Selecciona una imagen:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {suggestions.map((img, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectSuggestion(img)}
                                    className="relative group rounded-lg overflow-hidden border-2 border-transparent
                                        hover:border-neutral-900 transition-all cursor-pointer"
                                >
                                    <img
                                        src={img.thumbnailUrl}
                                        alt={img.alt}
                                        className="w-full h-24 object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors
                                        flex items-center justify-center">
                                        <svg className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    {img.photographer && (
                                        <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 bg-black/50 text-[0.55rem] text-white truncate">
                                            {img.photographer}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[0.6rem] text-neutral-400 mt-1">
                            Fotos de Pexels (uso gratuito)
                        </p>
                    </div>
                )}
            </div>

            <hr className="border-neutral-100" />

            {/* --- Sección: Publicación --- */}
            <section className="flex flex-col gap-4">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    Publicación
                </h4>

                {/* Status como pills */}
                <div className="flex flex-col gap-1.5">
                    <Label>Estado</Label>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm(p => ({ ...p, status: opt.value }))}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                    ${form.status === opt.value
                                        ? `${opt.color} ring-2 ring-neutral-900 ring-offset-1`
                                        : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                                    }
                                `}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                        label="Categoría" name="category"
                        value={form.category} onChange={handleChange}
                        options={categories}
                    />

                    <FormField
                        label="Tags (separados por coma)" name="tags"
                        placeholder="Ej: deportes, cultura, noticias"
                        value={form.tags} onChange={handleChange}
                    />
                </div>

                {/* Tags preview */}
                {form.tags.trim() && (
                    <div className="flex gap-1.5 flex-wrap">
                        {form.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <ToggleSwitch
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    label="Destacar en página principal"
                />
            </section>

            <div className="flex gap-3 pt-2 border-t border-neutral-100">
                {initialData._id ? (
                    /* Editando: un solo botón que respeta el estado seleccionado */
                    <Button
                        type="button" variant="primary" size="md" loading={loading}
                        onClick={(e) => handleSubmit(e)}
                    >
                        Guardar cambios
                    </Button>
                ) : (
                    /* Creando: botones para publicar o guardar borrador */
                    <>
                        <Button
                            type="button" variant="primary" size="md" loading={loading}
                            onClick={(e) => handleSubmit(e, 'publicado')}
                        >
                            Publicar
                        </Button>
                        <Button
                            type="button" variant="secondary" size="md"
                            onClick={(e) => handleSubmit(e, 'borrador')}
                        >
                            Guardar borrador
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
}
