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

    const excerptPercent = Math.min(100, Math.round((form.excerpt.length / 300) * 100));

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {alert && (
                <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            {/* --- Sección: Contenido --- */}
            <section className="flex flex-col gap-4">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    Contenido
                </h4>

                <FormField
                    label="Título" name="title" value={form.title}
                    onChange={handleChange} error={errors.title} required
                    placeholder="Título del post..."
                />

                <RichTextarea
                    label="Contenido"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    error={errors.content}
                    required
                    placeholder="Escribe el contenido del post. Usa la barra de herramientas para dar formato..."
                    rows={14}
                />
            </section>

            <hr className="border-neutral-100" />

            {/* --- Sección: Resumen --- */}
            <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                        Resumen
                    </h4>
                    <button
                        type="button"
                        onClick={generateExcerpt}
                        disabled={!form.content.trim()}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium
                            text-neutral-600 bg-neutral-100 rounded-md
                            hover:bg-neutral-200 hover:text-neutral-900
                            disabled:opacity-40 disabled:cursor-not-allowed
                            transition-colors duration-150 cursor-pointer"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                        </svg>
                        Generar desde contenido
                    </button>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="excerpt" required>Extracto / Resumen</Label>
                    <Textarea
                        name="excerpt" placeholder="Breve resumen del post (máx. 300 caracteres)..."
                        value={form.excerpt} onChange={handleChange} error={errors.excerpt} rows={2}
                    />
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                    excerptPercent > 90 ? 'bg-red-400' : excerptPercent > 70 ? 'bg-yellow-400' : 'bg-neutral-400'
                                }`}
                                style={{ width: `${excerptPercent}%` }}
                            />
                        </div>
                        <span className={`text-xs tabular-nums ${
                            excerptPercent > 90 ? 'text-red-500' : 'text-neutral-400'
                        }`}>
                            {form.excerpt.length}/300
                        </span>
                    </div>
                </div>
            </section>

            <hr className="border-neutral-100" />

            {/* --- Sección: Media --- */}
            <section className="flex flex-col gap-4">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    Imagen destacada
                </h4>

                <ImageUploader
                    onUpload={handleImageUpload}
                    currentImage={form.featuredImage?.url}
                    endpoint="/upload/blog"
                />
            </section>

            <hr className="border-neutral-100" />

            {/* --- Sección: Publicación --- */}
            <section className="flex flex-col gap-4">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    Publicación
                </h4>

                {/* Status como pills */}
                <div className="flex flex-col gap-1.5">
                    <Label>Estado</Label>
                    <div className="flex gap-2">
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

            {/* --- Acciones --- */}
            <div className="flex gap-3 pt-4 border-t border-neutral-100">
                <Button
                    type="button" variant="primary" size="md" loading={loading}
                    onClick={(e) => handleSubmit(e, 'publicado')}
                >
                    {initialData._id ? 'Actualizar y publicar' : 'Publicar'}
                </Button>

                <Button
                    type="button" variant="secondary" size="md"
                    onClick={(e) => handleSubmit(e, 'borrador')}
                >
                    Guardar borrador
                </Button>
            </div>
        </form>
    );
}
