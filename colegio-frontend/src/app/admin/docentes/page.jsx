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
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { LuShieldCheck, LuCopy, LuRefreshCw } from 'react-icons/lu';

const jornadaOptions = [
    { value: 'manana', label: 'Mañana' },
    { value: 'tarde', label: 'Tarde' },
    { value: 'ambas', label: 'Ambas jornadas' },
];

const cargoOptions = [
    { value: 'Docente', label: 'Docente' },
    { value: 'Docente de Matemáticas', label: 'Docente de Matemáticas' },
    { value: 'Docente de Español y Literatura', label: 'Docente de Español y Literatura' },
    { value: 'Docente de Ciencias Naturales', label: 'Docente de Ciencias Naturales' },
    { value: 'Docente de Ciencias Sociales', label: 'Docente de Ciencias Sociales' },
    { value: 'Docente de Inglés', label: 'Docente de Inglés' },
    { value: 'Docente de Educación Física', label: 'Docente de Educación Física' },
    { value: 'Docente de Arte', label: 'Docente de Arte' },
    { value: 'Docente de Tecnología e Informática', label: 'Docente de Tecnología e Informática' },
    { value: 'Docente de Música', label: 'Docente de Música' },
    { value: 'Docente de Preescolar', label: 'Docente de Preescolar' },
    { value: 'Coordinador(a)', label: 'Coordinador(a)' },
    { value: 'Director(a) de Grupo', label: 'Director(a) de Grupo' },
    { value: 'Rector(a)', label: 'Rector(a)' },
    { value: 'Psicólogo(a)', label: 'Psicólogo(a)' },
    { value: 'Orientador(a)', label: 'Orientador(a)' },
];

const jornadaLabels = { manana: 'Mañana', tarde: 'Tarde', ambas: 'Ambas' };
const jornadaColors = {
    manana: 'bg-amber-100 text-amber-700',
    tarde: 'bg-indigo-100 text-indigo-700',
    ambas: 'bg-green-100 text-green-700',
};

const emptyForm = { name: '', cargo: 'Docente', jornada: 'manana', email: '', order: 0 };

// Genera contraseña segura de 12 caracteres
const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    const randomValues = new Uint32Array(12);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues, (n) => chars[n % chars.length]).join('');
};

export default function AdminDocentesPage() {
    const { user: me, isSuperAdmin } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [photoFile, setPhotoFile] = useState(null);
    const [alert, setAlert] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [createAccount, setCreateAccount] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [credentials, setCredentials] = useState(null); // modal post-creación
    const [copied, setCopied] = useState(false);

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

    // Detecta si el usuario logueado es un docente (su email coincide con un registro de docente)
    const isDocente = useMemo(() => {
        if (isSuperAdmin) return false;
        return teachers.some(t => t.email && t.email.toLowerCase() === me?.email?.toLowerCase());
    }, [teachers, me, isSuperAdmin]);

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
        setCreateAccount(false);
        setGeneratedPassword('');
    };

    const handleToggleAccount = (enabled) => {
        setCreateAccount(enabled);
        if (enabled) setGeneratedPassword(generatePassword());
        else setGeneratedPassword('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.cargo.trim()) {
            setAlert({ type: 'error', message: 'Nombre y cargo son obligatorios.' });
            return;
        }
        if (createAccount && !form.email.trim()) {
            setAlert({ type: 'error', message: 'El email es obligatorio para crear una cuenta de acceso.' });
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
                setAlert({ type: 'success', message: 'Docente actualizado.' });
                resetForm();
                fetchTeachers();
                return;
            }

            // Crear docente
            await teacherService.create(formData);

            // Crear cuenta de admin si se activó el toggle
            if (createAccount && form.email.trim()) {
                try {
                    await authService.createUser({
                        name: form.name,
                        email: form.email.trim(),
                        password: generatedPassword,
                        role: 'admin',
                    });
                    // Mostrar credenciales generadas
                    setCredentials({
                        name: form.name,
                        email: form.email.trim(),
                        password: generatedPassword,
                    });
                } catch (accErr) {
                    // El docente se creó pero la cuenta falló
                    setAlert({
                        type: 'error',
                        message: `Docente creado, pero la cuenta falló: ${accErr.response?.data?.message || 'Email ya existe.'}`,
                    });
                }
            } else {
                setAlert({ type: 'success', message: 'Docente creado.' });
            }

            resetForm();
            fetchTeachers();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al guardar.' });
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
                    {!showForm && !isDocente && (
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
                                <SelectField label="Cargo" name="cargo"
                                    value={form.cargo} onChange={handleChange}
                                    options={cargoOptions} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SelectField label="Jornada" name="jornada"
                                    value={form.jornada} onChange={handleChange}
                                    options={jornadaOptions} />
                                <FormField label="Email" name="email" type="email"
                                    value={form.email} onChange={handleChange}
                                    placeholder="email@colegio.edu.co" />
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

                            {/* Toggle cuenta de acceso — solo superadmin al crear */}
                            {!editing && isSuperAdmin && (
                                <div className={`rounded-xl border p-4 transition-colors ${createAccount ? 'border-violet-200 bg-violet-50' : 'border-neutral-200 bg-neutral-50'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer select-none">
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={createAccount}
                                            onClick={() => handleToggleAccount(!createAccount)}
                                            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${createAccount ? 'bg-violet-600' : 'bg-neutral-300'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${createAccount ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                        <div>
                                            <span className="text-sm font-medium text-neutral-800 flex items-center gap-1.5">
                                                <LuShieldCheck className="w-4 h-4 text-violet-600" />
                                                Crear acceso al panel administrativo
                                            </span>
                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                Genera una cuenta de admin para este docente. Requiere email.
                                            </p>
                                        </div>
                                    </label>

                                    {createAccount && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            <label className="text-xs font-medium text-neutral-600">
                                                Contraseña generada automáticamente
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <code className="flex-1 px-3 py-2 bg-white border border-violet-200 rounded-lg text-sm font-mono text-neutral-800 tracking-wider">
                                                    {generatedPassword}
                                                </code>
                                                <button
                                                    type="button"
                                                    title="Regenerar"
                                                    onClick={() => setGeneratedPassword(generatePassword())}
                                                    className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 transition-colors"
                                                >
                                                    <LuRefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Copiar"
                                                    onClick={() => copyToClipboard(generatedPassword)}
                                                    className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-500 transition-colors"
                                                >
                                                    <LuCopy className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-neutral-400">
                                                Guarda esta contraseña antes de continuar. Se la deberás compartir al docente.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2 border-t border-neutral-100">
                                <Button type="submit" variant="primary" loading={saving}>
                                    {editing ? 'Actualizar' : createAccount ? 'Crear docente y cuenta' : 'Crear docente'}
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

                    {/* Vista móvil — cards */}
                    <div className="md:hidden divide-y divide-neutral-100">
                        {loading ? (
                            <div className="px-4 py-8 text-center text-neutral-500">Cargando...</div>
                        ) : paginated.length === 0 ? (
                            <div className="px-4 py-8 text-center text-neutral-500 text-sm">No se encontraron docentes</div>
                        ) : paginated.map((t) => (
                            <div key={t._id} className="p-4 flex gap-3 hover:bg-neutral-50 transition-colors">
                                {t.photo?.url ? (
                                    <img src={t.photo.url} alt={t.name}
                                        className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                                        <span className="text-base font-bold text-neutral-600">
                                            {t.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-neutral-900 text-sm">{t.name}</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">{t.cargo}</p>
                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${jornadaColors[t.jornada]}`}>
                                            {jornadaLabels[t.jornada]}
                                        </span>
                                        {t.email && (
                                            <span className="text-xs text-neutral-400 truncate max-w-[160px]">{t.email}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        {(!isDocente || t.email?.toLowerCase() === me?.email?.toLowerCase()) && (
                                            <button onClick={() => handleEdit(t)}
                                                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                                title="Editar">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        )}
                                        {!isDocente && (
                                            <button onClick={() => handleDelete(t._id)}
                                                disabled={deleting === t._id}
                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                title="Eliminar">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Vista desktop — tabla */}
                    <div className="hidden md:block overflow-x-auto">
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
                                                {(!isDocente || t.email?.toLowerCase() === me?.email?.toLowerCase()) && (
                                                    <button onClick={() => handleEdit(t)}
                                                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                                        title="Editar">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {!isDocente && (
                                                    <button onClick={() => handleDelete(t._id)}
                                                        disabled={deleting === t._id}
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                        title="Eliminar">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
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
            {/* Modal credenciales generadas */}
            {credentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                <LuShieldCheck className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-neutral-900">Cuenta creada</p>
                                <p className="text-xs text-neutral-500">Comparte estas credenciales con el docente</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-neutral-500">Nombre</span>
                                <span className="text-sm text-neutral-800">{credentials.name}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-neutral-500">Email</span>
                                <span className="text-sm text-neutral-800">{credentials.email}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-neutral-500">Contraseña inicial</span>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-mono tracking-wider">
                                        {credentials.password}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(credentials.password)}
                                        className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-500 transition-colors"
                                        title="Copiar contraseña"
                                    >
                                        {copied
                                            ? <span className="text-xs text-emerald-600 font-medium px-1">✓</span>
                                            : <LuCopy className="w-4 h-4" />
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            Esta contraseña no se volverá a mostrar. El docente deberá cambiarla en su primer acceso.
                        </p>

                        <Button
                            variant="primary"
                            onClick={() => setCredentials(null)}
                        >
                            Entendido
                        </Button>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
