'use client';
import { useState } from 'react';
import FormField from '@/components/molecules/FormField';
import SelectField from '@/components/molecules/SelectField';
import CalendarPicker from '@/components/molecules/CalendarPicker';
import AlertMessage from '@/components/molecules/AlertMessage';
import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Typography/Label';
import Textarea from '@/components/atoms/Textarea';
import ToggleSwitch from '@/components/atoms/ToggleSwitch';

const categories = [
    { value: 'academico', label: 'Académico' },
    { value: 'deportivo', label: 'Deportivo' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'reunion', label: 'Reunión' },
    { value: 'festivo', label: 'Festivo' },
    { value: 'otro', label: 'Otro' },
];

const colorOptions = [
    { value: '#171717', label: 'Negro' },
    { value: '#2563eb', label: 'Azul' },
    { value: '#16a34a', label: 'Verde' },
    { value: '#dc2626', label: 'Rojo' },
    { value: '#9333ea', label: 'Morado' },
    { value: '#ea580c', label: 'Naranja' },
    { value: '#0891b2', label: 'Cian' },
];

function toLocalParts(isoStr) {
    if (!isoStr) return { date: '', time: '' };
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return { date: '', time: '' };
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return {
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
    };
}

export default function EventForm({ onSubmit, initialData = {}, loading = false }) {
    const startParts = toLocalParts(initialData.startDate);
    const endParts = toLocalParts(initialData.endDate);

    const [form, setForm] = useState({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: startParts.date,
        startTime: startParts.time,
        endDate: endParts.date,
        endTime: endParts.time,
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

        if (form.startDate && form.endDate) {
            const startFull = `${form.startDate}T${form.startTime || '00:00'}`;
            const endFull = `${form.endDate}T${form.endTime || '23:59'}`;
            if (endFull < startFull) newErrors.endDate = 'Debe ser posterior al inicio';
        }
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
            const payload = {
                title: form.title,
                description: form.description,
                startDate: `${form.startDate}T${form.isAllDay ? '00:00' : (form.startTime || '00:00')}`,
                endDate: `${form.endDate}T${form.isAllDay ? '23:59' : (form.endTime || '23:59')}`,
                location: form.location,
                category: form.category,
                color: form.color,
                isAllDay: form.isAllDay,
                isPublic: form.isPublic,
            };
            await onSubmit(payload);
            setAlert({ type: 'success', message: 'Evento guardado exitosamente.' });
        } catch (error) {
            setAlert({ type: 'error', message: error.message || 'Error al guardar el evento.' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {alert && (
                <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            {/* --- Información del evento --- */}
            <section className="flex flex-col gap-4">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    Información del evento
                </h4>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="title" required>Título</Label>
                    <input
                        id="title" name="title" value={form.title}
                        onChange={handleChange} maxLength={100}
                        placeholder="Ej: Día de la ciencia"
                        className={`w-full px-3 py-2 text-base bg-white border rounded-md text-neutral-900
                            placeholder-neutral-400 transition-all duration-200 outline-none
                            ${errors.title
                                ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                : 'border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100'
                            }`}
                    />
                    <div className="flex justify-between">
                        {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
                        <span className={`text-xs ml-auto ${form.title.length > 80 ? 'text-amber-500' : 'text-neutral-400'}`}>
                            {form.title.length}/100
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="description" required>Descripción</Label>
                    <Textarea
                        name="description" placeholder="Describe el evento, actividades, público objetivo..."
                        value={form.description} onChange={handleChange}
                        error={errors.description} rows={3} maxLength={500}
                    />
                    <span className={`text-xs self-end -mt-1 ${form.description.length > 400 ? 'text-amber-500' : 'text-neutral-400'}`}>
                        {form.description.length}/500
                    </span>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="location">Ubicación</Label>
                    <input
                        id="location" name="location" value={form.location}
                        onChange={handleChange} maxLength={200}
                        placeholder="Ej: Auditorio principal, Cancha deportiva"
                        className="w-full px-3 py-2 text-base bg-white border rounded-md text-neutral-900
                            placeholder-neutral-400 transition-all duration-200 outline-none
                            border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100"
                    />
                    <span className={`text-xs self-end ${form.location.length > 160 ? 'text-amber-500' : 'text-neutral-400'}`}>
                        {form.location.length}/200
                    </span>
                </div>
            </section>

            <hr className="border-neutral-100" />

            {/* --- Fecha y hora --- */}
            <section className="flex flex-col gap-4">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    Fecha y hora
                </h4>

                <ToggleSwitch
                    name="isAllDay"
                    checked={form.isAllDay}
                    onChange={handleChange}
                    label="Evento de todo el día"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CalendarPicker
                        label="Inicio"
                        date={form.startDate}
                        time={form.startTime}
                        onDateChange={(val) => setForm(p => ({ ...p, startDate: val }))}
                        onTimeChange={(val) => setForm(p => ({ ...p, startTime: val }))}
                        includeTime={!form.isAllDay}
                        error={errors.startDate}
                        required
                    />
                    <CalendarPicker
                        label="Fin"
                        date={form.endDate}
                        time={form.endTime}
                        onDateChange={(val) => setForm(p => ({ ...p, endDate: val }))}
                        onTimeChange={(val) => setForm(p => ({ ...p, endTime: val }))}
                        includeTime={!form.isAllDay}
                        error={errors.endDate}
                        required
                    />
                </div>
            </section>

            <hr className="border-neutral-100" />

            {/* --- Apariencia --- */}
            <section className="flex flex-col gap-4">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    Apariencia
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                        label="Categoría" name="category"
                        value={form.category} onChange={handleChange}
                        options={categories}
                    />

                    <div className="flex flex-col gap-1.5">
                        <Label>Color del evento</Label>
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                            {colorOptions.map(({ value: color, label }) => (
                                <button
                                    key={color}
                                    type="button"
                                    title={label}
                                    onClick={() => setForm(p => ({ ...p, color }))}
                                    className={`
                                        h-8 w-8 rounded-full transition-all duration-200 cursor-pointer border-2
                                        ${form.color === color
                                            ? 'border-neutral-900 scale-110 shadow-md'
                                            : 'border-transparent hover:scale-105 hover:border-neutral-300'
                                        }
                                    `}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <ToggleSwitch
                    name="isPublic"
                    checked={form.isPublic}
                    onChange={handleChange}
                    label="Visible para todos (evento público)"
                />
            </section>

            {/* --- Acciones --- */}
            <div className="flex gap-3 pt-4 border-t border-neutral-100">
                <Button type="submit" variant="primary" size="md" loading={loading}>
                    {initialData._id ? 'Actualizar evento' : 'Crear evento'}
                </Button>
            </div>
        </form>
    );
}
