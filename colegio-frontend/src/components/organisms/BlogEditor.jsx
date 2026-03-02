'use client';
import { useState } from 'react';
import FormField from '@/components/molecules/FormField';
import AlertMessage from '@/components/molecules/AlertMessage';
import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Typography/Label';
import Textarea from '@/components/atoms/Textarea';
import ImageUploader from '@/components/molecules/ImageUploader';


const categories = ['noticias', 'eventos', 'actividades', 'logros', 'anuncios', 'general'];

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
                // Si se pasa un status override, usarlo
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-3xl">
            {alert && (
                <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <FormField label="Título" name="title" value={form.title}
                onChange={handleChange} error={errors.title} required
                placeholder="Título del post..." />

            <div className="flex flex-col gap-1.5">
                <Label>Imagen destacada</Label>
                <ImageUploader
                    onUpload={handleImageUpload}
                    currentImage={form.featuredImage?.url}
                    endpoint="/upload/blog"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="excerpt" required>Extracto / Resumen</Label>
                <Textarea name="excerpt" placeholder="Breve resumen del post (máx. 300 caracteres)..."
                    value={form.excerpt} onChange={handleChange} error={errors.excerpt} rows={2} />
                <span className="text-xs text-neutral-400 text-right">{form.excerpt.length}/300</span>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="content" required>Contenido</Label>
                <Textarea name="content" placeholder="Escribe el contenido completo del post..."
                    value={form.content} onChange={handleChange} error={errors.content} rows={12} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label>Categoría</Label>
                    <select name="category" value={form.category} onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:border-neutral-900">
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Estado</Label>
                    <select name="status" value={form.status} onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:border-neutral-900">
                        <option value="borrador">Borrador</option>
                        <option value="publicado">Publicado</option>
                        <option value="archivado">Archivado</option>
                    </select>
                </div>
            </div>

            <FormField label="Tags (separados por coma)" name="tags"
                placeholder="Ej: deportes, cultura, noticias"
                value={form.tags} onChange={handleChange} />

            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange}
                    className="h-4 w-4 rounded border-neutral-300" />
                <span className="text-sm text-neutral-700">Destacar en página principal</span>
            </label>

            <div className="flex gap-3 pt-2 border-t border-neutral-100">
                {/* Botón Publicar - siempre envía status: publicado */}
                <Button
                    type="button"
                    variant="primary"
                    size="md"
                    loading={loading}
                    onClick={(e) => handleSubmit(e, 'publicado')}
                >
                    {initialData._id ? 'Actualizar y publicar' : 'Publicar'}
                </Button>

                {/* Botón Borrador - guarda como borrador */}
                <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={(e) => handleSubmit(e, 'borrador')}
                >
                    Guardar borrador
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => {
                        setEditing?.(null);
                        setShowForm?.(false);
                    }}
                >
                    Cancelar
                </Button>
            </div>
        </form>

    );
}
