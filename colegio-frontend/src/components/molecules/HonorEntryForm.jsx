'use client';
import { useState, useRef } from 'react';
import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Typography/Label';
import Spinner from '@/components/atoms/Spinner';
import { safeImageUrl } from '@/lib/safeImageUrl';
import { honorService } from '@/services/honorService';
import { LuCamera } from 'react-icons/lu';

const POSITIONS = [
    { value: 1, label: 'Primer Puesto', medal: '🥇' },
    { value: 2, label: 'Segundo Puesto', medal: '🥈' },
    { value: 3, label: 'Tercer Puesto', medal: '🥉' },
];

export default function HonorEntryForm({ onSubmit, initialData = {}, grades = [], periods = [], loading = false }) {
    const [form, setForm] = useState({
        grade: initialData.grade?._id || initialData.grade || '',
        period: initialData.period?._id || initialData.period || '',
        position: initialData.position || '',
        studentName: initialData.studentName || '',
        jornada: initialData.jornada || 'manana',
        photo: initialData.photo || { url: '', publicId: '' },
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [preview, setPreview] = useState(initialData.photo?.url || '');
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
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
        if (!form.grade || !form.period || !form.position || !form.studentName.trim()) return;
        onSubmit({ ...form, position: Number(form.position), jornada: form.jornada });
    };

    const selectClass = `
        w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm
        bg-white text-neutral-900 appearance-none cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent
        font-[family-name:var(--font-inter)]
    `;

    const inputClass = `
        w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm
        text-neutral-900 placeholder:text-neutral-400
        focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent
        font-[family-name:var(--font-inter)]
    `;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Periodo y Posición */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label className="mb-1.5 block text-sm font-medium text-neutral-700">Periodo</Label>
                    <div className="relative">
                        <select
                            value={form.period}
                            onChange={(e) => handleChange('period', e.target.value)}
                            className={selectClass}
                            required
                        >
                            <option value="">Seleccionar periodo...</option>
                            {periods.map(p => (
                                <option key={p._id} value={p._id}>{p.name} {p.year}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <Label className="mb-1.5 block text-sm font-medium text-neutral-700">Posición</Label>
                    <div className="relative">
                        <select
                            value={form.position}
                            onChange={(e) => handleChange('position', e.target.value)}
                            className={selectClass}
                            required
                        >
                            <option value="">Seleccionar posición...</option>
                            {POSITIONS.map(p => (
                                <option key={p.value} value={p.value}>{p.medal} {p.label}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Jornada y Grado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label className="mb-1.5 block text-sm font-medium text-neutral-700">Jornada</Label>
                    <div className="relative">
                        <select
                            value={form.jornada}
                            onChange={(e) => {
                                handleChange('jornada', e.target.value);
                                handleChange('grade', '');
                            }}
                            className={selectClass}
                            required
                        >
                            <option value="manana">Mañana</option>
                            <option value="tarde">Tarde</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <Label className="mb-1.5 block text-sm font-medium text-neutral-700">Grado</Label>
                    <div className="relative">
                        <select
                            value={form.grade}
                            onChange={(e) => handleChange('grade', e.target.value)}
                            className={selectClass}
                            required
                        >
                            <option value="">Seleccionar grado...</option>
                            {grades.filter(g => (g.jornada || 'manana') === form.jornada).map(g => (
                                <option key={g._id} value={g._id}>{g.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nombre del estudiante */}
            <div>
                <Label className="mb-1.5 block text-sm font-medium text-neutral-700">Nombre del estudiante</Label>
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

            {/* Foto del estudiante */}
            <div>
                <Label className="mb-1.5 block text-sm font-medium text-neutral-700">Foto del estudiante</Label>
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
                                <img
                                    src={safeImageUrl(preview)}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Spinner size="md" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <LuCamera className="w-8 h-8 text-neutral-400" />
                                <p className="text-sm text-neutral-500 text-center px-4">
                                    Click o arrastra para subir foto
                                </p>
                                <p className="text-xs text-neutral-400">JPG, PNG, WebP · Máx 3MB</p>
                            </>
                        )}
                    </div>

                    {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

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

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            </div>

            <Button type="submit" variant="primary" loading={loading} disabled={uploading}>
                {initialData._id ? 'Actualizar' : 'Crear estudiante'}
            </Button>
        </form>
    );
}
