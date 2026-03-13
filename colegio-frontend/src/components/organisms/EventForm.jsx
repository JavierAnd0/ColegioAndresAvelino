'use client';
import { useState } from 'react';
import FormField from '@/components/molecules/FormField';
import AlertMessage from '@/components/molecules/AlertMessage';
import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Typography/Label';
import Textarea from '@/components/atoms/Textarea';

const categories = ['academico', 'deportivo', 'cultural', 'reunion', 'festivo', 'otro'];
const colors = ['#171717', '#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2'];

// Convert ISO/UTC date string to local datetime-local format (YYYY-MM-DDThh:mm)
function toLocalDatetime(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EventForm({ onSubmit, initialData = {}, loading = false }) {
    const [form, setForm] = useState({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: toLocalDatetime(initialData.startDate),
        endDate: toLocalDatetime(initialData.endDate),
        location: initialData.location || '',
        category: initialData.category || 'otro',
        color: initialData.color || '#171717',
        isAllDay: initialData.isAllDay || false,
        isPublic: initialData.isPublic ?? true,
    });
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = 'El título es obligatorio';
        if (!form.description.trim()) newErrors.description = 'La descripción es obligatoria';
        if (!form.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria';
        if (!form.endDate) newErrors.endDate = 'La fecha de fin es obligatoria';
        if (form.startDate && form.endDate && form.endDate < form.startDate)
            newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        try {
            await onSubmit(form);
            setAlert({ type: 'success', message: 'Evento guardado exitosamente.' });
        } catch (error) {
            setAlert({ type: 'error', message: error.message || 'Error al guardar el evento.' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
            {alert && (
                <AlertMessage
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            <FormField label="Título" name="title" value={form.title}
                onChange={handleChange} error={errors.title} required />

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="description" required>Descripción</Label>
                <Textarea name="description" placeholder="Descripción del evento..."
                    value={form.description} onChange={handleChange}
                    error={errors.description} rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Fecha de inicio" name="startDate" type="datetime-local"
                    value={form.startDate} onChange={handleChange} error={errors.startDate} required />
                <FormField label="Fecha de fin" name="endDate" type="datetime-local"
                    value={form.endDate} onChange={handleChange} error={errors.endDate} required />
            </div>

            <FormField label="Ubicación" name="location" placeholder="Ej: Auditorio principal"
                value={form.location} onChange={handleChange} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="category">Categoría</Label>
                    <select name="category" value={form.category} onChange={handleChange}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:border-neutral-900">
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Color del evento</Label>
                    <div className="flex gap-2 flex-wrap">
                        {colors.map(color => (
                            <button key={color} type="button" onClick={() => setForm(p => ({ ...p, color }))}
                                className={`h-7 w-7 rounded-full transition-all duration-200 cursor-pointer
                  ${form.color === color ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110' : 'hover:scale-105'}`}
                                style={{ backgroundColor: color }} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isAllDay" checked={form.isAllDay} onChange={handleChange}
                        className="h-4 w-4 rounded border-neutral-300" />
                    <span className="text-sm text-neutral-700">Todo el día</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange}
                        className="h-4 w-4 rounded border-neutral-300" />
                    <span className="text-sm text-neutral-700">Evento público</span>
                </label>
            </div>

            <div className="flex gap-3 pt-2 border-t border-neutral-100">
                <Button type="submit" variant="primary" size="md" loading={loading}>
                    {initialData._id ? 'Actualizar evento' : 'Crear evento'}
                </Button>
                <Button type="button" variant="ghost" size="md">
                    Cancelar
                </Button>
            </div>
        </form>
    );
}