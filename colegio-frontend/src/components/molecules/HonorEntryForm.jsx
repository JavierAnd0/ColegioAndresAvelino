'use client';
import { useState, useRef } from 'react';
import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Typography/Label';
import SelectField from '@/components/molecules/SelectField';
import Spinner from '@/components/atoms/Spinner';
import { honorService } from '@/services/honorService';

const CATEGORIES = [
    { value: 'academico', label: '📚 Mejor rendimiento académico' },
    { value: 'valores', label: '🌟 Mejores valores' },
    { value: 'reciclaje', label: '♻️ Mayor aporte al reciclaje' },
];

export default function HonorEntryForm({ onSubmit, initialData = {}, grades = [], loading = false }) {
    const now = new Date();
    const [form, setForm] = useState({
        grade: initialData.grade?._id || initialData.grade || '',
        year: initialData.year || now.getFullYear(),
        month: initialData.month || now.getMonth() + 1,
        category: initialData.category || '',
        studentName: initialData.studentName || '',
        photo: initialData.photo || { url: '', publicId: '' },
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [preview, setPreview] = useState(initialData.photo?.url || '');
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const processFile = async (file) => {
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Solo se permiten imágenes JPG, PNG o WebP.');
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            setUploadError('La imagen no puede superar 3MB.');
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setPreview(localPreview);
        setUploadError('');
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);
            const result = await honorService.uploadPhoto(formData);
            setForm(prev => ({
                ...prev,
                photo: { url: result.data.url, publicId: result.data.publicId },
            }));
            setPreview(result.data.url);
        } catch {
            setUploadError('Error al subir la foto. Verifica tu conexión.');
            setPreview('');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        processFile(e.target.files?.[0]);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        processFile(e.dataTransfer.files?.[0]);
    };

    const handleRemovePhoto = () => {
        setPreview('');
        setForm(prev => ({ ...prev, photo: { url: '', publicId: '' } }));
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.grade || !form.category || !form.studentName.trim()) return;
        onSubmit(form);
    };

    const gradeOptions = grades.map(g => ({ value: g._id, label: g.name }));

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Grado y Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                    label="Grado" name="grade"
                    value={form.grade} onChange={handleChange}
                    options={gradeOptions}
                    placeholder="Seleccionar grado..."
                    required
                />

                <SelectField
                    label="Categoría" name="category"
                    value={form.category} onChange={handleChange}
                    options={CATEGORIES}
                    placeholder="Seleccionar categoría..."
                    required
                />
            </div>

            {/* Nombre del estudiante */}
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="studentName" required>Nombre del estudiante</Label>
                <input
                    id="studentName"
                    name="studentName"
                    type="text"
                    value={form.studentName}
                    onChange={handleChange}
                    placeholder="Nombre completo del estudiante"
                    maxLength={100}
                    required
                    className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
            </div>

            {/* Foto del estudiante - Dropzone */}
            <div className="flex flex-col gap-1.5">
                <Label>Foto del estudiante</Label>
                <div className="flex flex-col gap-3">
                    <div
                        onClick={() => !uploading && fileRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`
                            relative w-full h-48 rounded-xl border-2 border-dashed
                            flex flex-col items-center justify-center gap-2
                            transition-all duration-200 overflow-hidden
                            ${preview
                                ? 'border-neutral-300'
                                : dragOver
                                    ? 'border-neutral-900 bg-neutral-100 cursor-pointer'
                                    : 'border-neutral-300 hover:border-neutral-500 cursor-pointer hover:bg-neutral-50'
                            }
                        `}
                    >
                        {preview ? (
                            <>
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Spinner size="md" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="text-3xl">📷</span>
                                <p className="text-sm text-neutral-500 text-center px-4">
                                    Click o arrastra para subir foto
                                </p>
                                <p className="text-xs text-neutral-400">
                                    JPG, PNG, WebP · Máx 3MB
                                </p>
                            </>
                        )}
                    </div>

                    {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

                    <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" loading={uploading}
                            onClick={() => fileRef.current?.click()}>
                            {preview ? 'Cambiar foto' : 'Subir foto'}
                        </Button>
                        {preview && !uploading && (
                            <Button type="button" variant="ghost" size="sm" onClick={handleRemovePhoto}>
                                Eliminar
                            </Button>
                        )}
                    </div>

                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange} className="hidden" />
                </div>
            </div>

            {/* Submit */}
            <Button type="submit" variant="primary" loading={loading} disabled={uploading}>
                {initialData._id ? 'Actualizar' : 'Crear entrada'}
            </Button>
        </form>
    );
}
