'use client';
import { useState, useRef } from 'react';
import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Typography/Label';
import { honorService } from '@/services/honorService';

const MONTHS = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' }, { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
];

const CATEGORIES = [
    { value: 'academico', label: 'Académico' },
    { value: 'valores', label: 'Valores' },
    { value: 'reciclaje', label: 'Reciclaje' },
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
    const fileRef = useRef(null);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const result = await honorService.uploadPhoto(formData);
            setForm(prev => ({
                ...prev,
                photo: { url: result.data.url, publicId: result.data.publicId },
            }));
        } catch {
            alert('Error al subir la foto');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.grade || !form.category || !form.studentName.trim()) return;
        onSubmit(form);
    };

    const inputClass = 'w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Grado */}
                <div>
                    <Label>Grado</Label>
                    <select
                        value={form.grade}
                        onChange={(e) => handleChange('grade', e.target.value)}
                        className={inputClass}
                        required
                    >
                        <option value="">Seleccionar grado...</option>
                        {grades.map(g => (
                            <option key={g._id} value={g._id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                {/* Categoría */}
                <div>
                    <Label>Categoría</Label>
                    <select
                        value={form.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className={inputClass}
                        required
                    >
                        <option value="">Seleccionar categoría...</option>
                        {CATEGORIES.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>

                {/* Año */}
                <div>
                    <Label>Año</Label>
                    <input
                        type="number"
                        value={form.year}
                        onChange={(e) => handleChange('year', parseInt(e.target.value))}
                        min={2000}
                        max={2100}
                        className={inputClass}
                        required
                    />
                </div>

                {/* Mes */}
                <div>
                    <Label>Mes</Label>
                    <select
                        value={form.month}
                        onChange={(e) => handleChange('month', parseInt(e.target.value))}
                        className={inputClass}
                        required
                    >
                        {MONTHS.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Nombre del estudiante */}
            <div>
                <Label>Nombre del estudiante</Label>
                <input
                    type="text"
                    value={form.studentName}
                    onChange={(e) => handleChange('studentName', e.target.value)}
                    placeholder="Nombre completo del estudiante"
                    maxLength={100}
                    className={inputClass}
                    required
                />
            </div>

            {/* Foto */}
            <div>
                <Label>Foto del estudiante</Label>
                <div className="flex items-center gap-4">
                    {form.photo?.url && (
                        <img
                            src={form.photo.url}
                            alt="Preview"
                            className="w-16 h-16 rounded-full object-cover border border-neutral-200"
                        />
                    )}
                    <div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoUpload}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileRef.current?.click()}
                            loading={uploading}
                        >
                            {form.photo?.url ? 'Cambiar foto' : 'Subir foto'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <Button type="submit" variant="primary" loading={loading} disabled={uploading}>
                {initialData._id ? 'Actualizar' : 'Crear entrada'}
            </Button>
        </form>
    );
}
