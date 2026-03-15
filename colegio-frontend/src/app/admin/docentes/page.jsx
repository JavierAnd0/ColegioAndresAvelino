'use client';
import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import SelectField from '@/components/molecules/SelectField';
import AlertMessage from '@/components/molecules/AlertMessage';
import ImageUploader from '@/components/molecules/ImageUploader';
import { teacherService } from '@/services/teacherService';

const jornadaOptions = [
    { value: 'manana', label: 'Mañana' },
    { value: 'tarde', label: 'Tarde' },
    { value: 'ambas', label: 'Ambas jornadas' },
];

const jornadaLabels = { manana: 'Mañana', tarde: 'Tarde', ambas: 'Ambas' };
const jornadaColors = {
    manana: 'bg-amber-100 text-amber-700',
    tarde: 'bg-indigo-100 text-indigo-700',
    ambas: 'bg-green-100 text-green-700',
};

const emptyForm = { name: '', cargo: '', jornada: 'manana', email: '', order: 0 };

export default function AdminDocentesPage() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [photoFile, setPhotoFile] = useState(null);
    const [alert, setAlert] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);

    // DataTable state
    const [search, setSearch] = useState('');
    const [filterJornada, setFilterJornada] = useState('todas');
    const [sortField, setSortField] = useState('order');
    const [sortDir, setSortDir] = useState('asc');
    const [page, setPage] = useState(1);
    const perPage = 10;

    const fetchTeachers = async () => {
        try {
            const res = await teacherService.getAllAdmin();
            setTeachers(res.data?.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error al cargar docentes' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTeachers(); }, []);

    // Filtrado, búsqueda y ordenamiento
    const processed = useMemo(() => {
        let data = [...teachers];

        // Filtro jornada
        if (filterJornada !== 'todas') {
            data = data.filter(t => t.jornada === filterJornada);
        }

        // Búsqueda
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.cargo.toLowerCase().includes(q) ||
                (t.email && t.email.toLowerCase().includes(q))
            );
        }

        // Orden
        data.sort((a, b) => {
            let valA = a[sortField] ?? '';
            let valB = b[sortField] ?? '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [teachers, filterJornada, search, sortField, sortDir]);

    const totalPages = Math.ceil(processed.length / perPage);
    const paginated = processed.slice((page - 1) * perPage, page * perPage);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
        setPage(1);
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className="text-neutral-300 ml-1">↕</span>;
        return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'order' ? parseInt(value) || 0 : value }));
    };

    const handlePhotoUpload = (imageData) => {
        if (imageData?.file) {
            setPhotoFile(imageData.file);
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setPhotoFile(null);
        setEditing(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.cargo.trim()) {
            setAlert({ type: 'error', message: 'Nombre y cargo son obligatorios' });
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('cargo', form.cargo);
            formData.append('jornada', form.jornada);
            formData.append('email', form.email);
            formData.append('order', form.order);
            if (photoFile) formData.append('photo', photoFile);

            if (editing) {
                await teacherService.update(editing._id, formData);
                setAlert({ type: 'success', message: 'Docente actualizado' });
            } else {
                await teacherService.create(formData);
                setAlert({ type: 'success', message: 'Docente creado' });
            }
            resetForm();
            fetchTeachers();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al guardar' });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (teacher) => {
        setForm({
            name: teacher.name,
            cargo: teacher.cargo,
            jornada: teacher.jornada,
            email: teacher.email || '',
            order: teacher.order || 0,
        });
        setPhotoFile(null);
        setEditing(teacher);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este docente?')) return;
        setDeleting(id);
        try {
            await teacherService.delete(id);
            setAlert({ type: 'success', message: 'Docente eliminado' });
            fetchTeachers();
        } catch {
            setAlert({ type: 'error', message: 'Error al eliminar' });
        } finally {
            setDeleting(null);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <Heading level="h3">Gestión de Docentes</Heading>
                        <Paragraph color="muted" className="mt-1">
                            {teachers.length} docentes registrados
                        </Paragraph>
                    </div>
                    {!showForm && (
                        <Button variant="primary" onClick={() => setShowForm(true)} className="self-start">
                            + Nuevo docente
                        </Button>
                    )}
                </div>

                {alert && (
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {/* Formulario */}
                {showForm && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-5">
                        <h4 className="text-base font-semibold mb-4">
                            {editing ? 'Editar docente' : 'Nuevo docente'}
                        </h4>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-2xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Nombre completo" name="name"
                                    value={form.name} onChange={handleChange} required
                                    placeholder="Nombre del docente" />
                                <FormField label="Cargo" name="cargo"
                                    value={form.cargo} onChange={handleChange} required
                                    placeholder="Ej: Docente de Matemáticas" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <SelectField label="Jornada" name="jornada"
                                    value={form.jornada} onChange={handleChange}
                                    options={jornadaOptions} />
                                <FormField label="Email" name="email" type="email"
                                    value={form.email} onChange={handleChange}
                                    placeholder="email@colegio.edu.co" />
                                <FormField label="Orden" name="order" type="number"
                                    value={form.order} onChange={handleChange} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-neutral-700">Foto</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => setPhotoFile(e.target.files[0])}
                                    className="text-sm text-neutral-600 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg
                                        file:border-0 file:text-sm file:font-medium file:bg-neutral-100
                                        file:text-neutral-700 hover:file:bg-neutral-200 file:cursor-pointer"
                                />
                                {(editing?.photo?.url || photoFile) && (
                                    <p className="text-xs text-neutral-500">
                                        {photoFile ? `Nueva: ${photoFile.name}` : 'Foto actual guardada'}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2 border-t border-neutral-100">
                                <Button type="submit" variant="primary" loading={saving}>
                                    {editing ? 'Actualizar' : 'Crear docente'}
                                </Button>
                                <Button type="button" variant="secondary" onClick={resetForm}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* DataTable */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-neutral-100">
                        <input
                            type="text"
                            placeholder="Buscar docente..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm flex-1
                                focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                        />
                        <select
                            value={filterJornada}
                            onChange={(e) => { setFilterJornada(e.target.value); setPage(1); }}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white
                                focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                            <option value="todas">Todas las jornadas</option>
                            <option value="manana">Mañana</option>
                            <option value="tarde">Tarde</option>
                            <option value="ambas">Ambas</option>
                        </select>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                        onClick={() => handleSort('name')}>
                                        Docente <SortIcon field="name" />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none hidden sm:table-cell"
                                        onClick={() => handleSort('cargo')}>
                                        Cargo <SortIcon field="cargo" />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                        onClick={() => handleSort('jornada')}>
                                        Jornada <SortIcon field="jornada" />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 hidden md:table-cell cursor-pointer select-none"
                                        onClick={() => handleSort('email')}>
                                        Email <SortIcon field="email" />
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-neutral-600">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Cargando...</td></tr>
                                ) : paginated.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No se encontraron docentes</td></tr>
                                ) : paginated.map((t) => (
                                    <tr key={t._id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {t.photo?.url ? (
                                                    <img src={t.photo.url} alt={t.name}
                                                        className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-sm font-bold text-neutral-600">
                                                            {t.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-medium text-neutral-900 truncate">{t.name}</p>
                                                    <p className="text-xs text-neutral-500 sm:hidden">{t.cargo}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-700 hidden sm:table-cell">{t.cargo}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${jornadaColors[t.jornada]}`}>
                                                {jornadaLabels[t.jornada]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">
                                            {t.email || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(t)}
                                                    className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                                    title="Editar">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleDelete(t._id)}
                                                    disabled={deleting === t._id}
                                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                    title="Eliminar">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
                            <p className="text-xs text-neutral-500">
                                {processed.length} resultado{processed.length !== 1 ? 's' : ''}
                                {' · '}Página {page} de {totalPages}
                            </p>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-2.5 py-1 text-xs rounded-md border border-neutral-200 hover:bg-neutral-50
                                        disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-2.5 py-1 text-xs rounded-md border border-neutral-200 hover:bg-neutral-50
                                        disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
