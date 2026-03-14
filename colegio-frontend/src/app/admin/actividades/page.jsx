'use client';
import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import SelectField from '@/components/molecules/SelectField';
import AlertMessage from '@/components/molecules/AlertMessage';
import { activityService } from '@/services/activityService';
import { gradeService } from '@/services/honorService';

const typeOptions = [
    { value: 'cuento', label: 'Cuento' },
    { value: 'colorear', label: 'Colorear' },
    { value: 'numeros', label: 'Números' },
    { value: 'rompecabezas', label: 'Rompecabezas' },
    { value: 'juego', label: 'Juego' },
    { value: 'lectura', label: 'Lectura' },
    { value: 'otro', label: 'Otro' },
];

const gradeLabels = { 0: 'Pre', 1: '1°', 2: '2°', 3: '3°', 4: '4°', 5: '5°', 6: '6°', 7: '7°', 8: '8°', 9: '9°', 10: '10°', 11: '11°' };

const statusConfig = {
    approved: { label: 'Aprobada', variant: 'success' },
    pending: { label: 'Pendiente', variant: 'warning' },
    rejected: { label: 'Rechazada', variant: 'danger' },
    draft: { label: 'Borrador', variant: 'default' },
};

export default function AdminActividadesPage() {
    const [tab, setTab] = useState('actividades');
    const [alert, setAlert] = useState(null);

    // Actividades
    const [activities, setActivities] = useState([]);
    const [pendingActivities, setPendingActivities] = useState([]);
    const [loadingActs, setLoadingActs] = useState(true);
    const [loadingPending, setLoadingPending] = useState(true);
    const [fetching, setFetching] = useState(false);

    // Crear actividad manual
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({
        title: '', description: '', content: '', type: 'otro',
        targetGrades: [], externalUrl: '',
    });
    const [createFile, setCreateFile] = useState(null);
    const fileInputRef = useRef(null);

    // Fuentes RSS
    const [sources, setSources] = useState([]);
    const [loadingSources, setLoadingSources] = useState(true);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const [editingSource, setEditingSource] = useState(null);
    const [sourceForm, setSourceForm] = useState({ name: '', url: '', defaultType: 'otro', defaultGrades: [], isActive: true });

    const [grades, setGrades] = useState([]);

    useEffect(() => {
        loadGrades();
        loadActivities();
        loadPending();
        loadSources();
    }, []);

    const loadGrades = async () => {
        try {
            const res = await gradeService.getAll();
            setGrades((res.data || []).sort((a, b) => a.order - b.order));
        } catch { /* ignore */ }
    };

    const loadActivities = async () => {
        setLoadingActs(true);
        try {
            const res = await activityService.getAll({ limit: 100 });
            setActivities(res.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error al cargar actividades' });
        } finally {
            setLoadingActs(false);
        }
    };

    const loadPending = async () => {
        setLoadingPending(true);
        try {
            const res = await activityService.getPending({ limit: 100 });
            setPendingActivities(res.data || []);
        } catch {
            // silenciar
        } finally {
            setLoadingPending(false);
        }
    };

    const loadSources = async () => {
        setLoadingSources(true);
        try {
            const res = await activityService.getSources();
            setSources(res.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error al cargar fuentes RSS' });
        } finally {
            setLoadingSources(false);
        }
    };

    // Trigger fetch manual
    const handleFetch = async () => {
        setFetching(true);
        try {
            const res = await activityService.triggerFetch();
            const { totalNew, totalUpdated, errors } = res.data;
            setAlert({
                type: errors.length > 0 ? 'warning' : 'success',
                message: `Fetch completado: ${totalNew} nuevas, ${totalUpdated} actualizadas${errors.length > 0 ? `. Errores: ${errors.join(', ')}` : ''}`,
            });
            await Promise.all([loadActivities(), loadPending()]);
        } catch {
            setAlert({ type: 'error', message: 'Error al ejecutar fetch de RSS' });
        } finally {
            setFetching(false);
        }
    };

    // Aprobar/Rechazar pendientes
    const handleApprove = async (id) => {
        try {
            await activityService.approve(id);
            setPendingActivities((prev) => prev.filter((a) => a._id !== id));
            setAlert({ type: 'success', message: 'Actividad aprobada' });
            await loadActivities();
        } catch {
            setAlert({ type: 'error', message: 'Error al aprobar' });
        }
    };

    const handleReject = async (id) => {
        try {
            await activityService.reject(id);
            setPendingActivities((prev) => prev.filter((a) => a._id !== id));
            setAlert({ type: 'success', message: 'Actividad rechazada' });
        } catch {
            setAlert({ type: 'error', message: 'Error al rechazar' });
        }
    };

    // Toggle actividad activa
    const toggleActive = async (id, current) => {
        try {
            await activityService.update(id, { isActive: !current });
            setActivities((prev) => prev.map((a) => a._id === id ? { ...a, isActive: !current } : a));
        } catch {
            setAlert({ type: 'error', message: 'Error al actualizar actividad' });
        }
    };

    // Eliminar actividad
    const handleDeleteActivity = async (id) => {
        if (!confirm('¿Eliminar esta actividad?')) return;
        try {
            await activityService.delete(id);
            setActivities((prev) => prev.filter((a) => a._id !== id));
            setPendingActivities((prev) => prev.filter((a) => a._id !== id));
            setAlert({ type: 'success', message: 'Actividad eliminada' });
        } catch {
            setAlert({ type: 'error', message: 'Error al eliminar actividad' });
        }
    };

    // --- Crear actividad manual ---
    const resetCreateForm = () => {
        setCreateForm({ title: '', description: '', content: '', type: 'otro', targetGrades: [], externalUrl: '' });
        setCreateFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowCreateForm(false);
    };

    const toggleCreateGrade = (order) => {
        setCreateForm((prev) => ({
            ...prev,
            targetGrades: prev.targetGrades.includes(order)
                ? prev.targetGrades.filter((g) => g !== order)
                : [...prev.targetGrades, order],
        }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', createForm.title);
            if (createForm.description) formData.append('description', createForm.description);
            if (createForm.content) formData.append('content', createForm.content);
            formData.append('type', createForm.type);
            if (createForm.externalUrl) formData.append('externalUrl', createForm.externalUrl);
            createForm.targetGrades.forEach((g) => formData.append('targetGrades[]', g));
            if (createFile) formData.append('file', createFile);

            await activityService.create(formData);
            setAlert({ type: 'success', message: 'Actividad creada' });
            resetCreateForm();
            await loadActivities();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al crear actividad';
            setAlert({ type: 'error', message: msg });
        }
    };

    // --- Fuentes RSS ---
    const resetSourceForm = () => {
        setSourceForm({ name: '', url: '', defaultType: 'otro', defaultGrades: [], isActive: true });
        setEditingSource(null);
        setShowSourceForm(false);
    };

    const handleEditSource = (source) => {
        setSourceForm({
            name: source.name, url: source.url, defaultType: source.defaultType,
            defaultGrades: source.defaultGrades || [], isActive: source.isActive,
        });
        setEditingSource(source._id);
        setShowSourceForm(true);
    };

    const handleSourceSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSource) {
                await activityService.updateSource(editingSource, sourceForm);
                setAlert({ type: 'success', message: 'Fuente actualizada' });
            } else {
                await activityService.createSource(sourceForm);
                setAlert({ type: 'success', message: 'Fuente creada' });
            }
            resetSourceForm();
            await loadSources();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al guardar fuente';
            setAlert({ type: 'error', message: msg });
        }
    };

    const handleDeleteSource = async (id) => {
        if (!confirm('¿Eliminar esta fuente RSS?')) return;
        try {
            await activityService.deleteSource(id);
            setSources((prev) => prev.filter((s) => s._id !== id));
            setAlert({ type: 'success', message: 'Fuente eliminada' });
        } catch {
            setAlert({ type: 'error', message: 'Error al eliminar fuente' });
        }
    };

    const toggleSourceGrade = (order) => {
        setSourceForm((prev) => ({
            ...prev,
            defaultGrades: prev.defaultGrades.includes(order)
                ? prev.defaultGrades.filter((g) => g !== order)
                : [...prev.defaultGrades, order],
        }));
    };

    const showContentField = createForm.type === 'cuento' || createForm.type === 'lectura';
    const showFileField = createForm.type === 'colorear';

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <Heading level="h1">Actividades Educativas</Heading>
                    <div className="flex gap-2">
                        <Button onClick={() => { resetCreateForm(); setShowCreateForm(true); }} variant="primary" size="sm">
                            + Nueva actividad
                        </Button>
                        <Button onClick={handleFetch} disabled={fetching} variant="outline" size="sm">
                            {fetching ? 'Actualizando...' : 'Actualizar RSS'}
                        </Button>
                    </div>
                </div>

                {alert && (
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-neutral-100 rounded-lg p-1 w-full sm:w-fit overflow-x-auto">
                    {[
                        { key: 'actividades', label: `Aprobadas (${activities.length})` },
                        { key: 'pendientes', label: `Pendientes (${pendingActivities.length})` },
                        { key: 'fuentes', label: `RSS (${sources.length})` },
                    ].map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => setTab(t.key)}
                            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-1 sm:flex-none
                                ${tab === t.key ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Formulario crear actividad */}
                {showCreateForm && (
                    <form onSubmit={handleCreateSubmit} className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 space-y-4">
                        <Heading level="h3">Nueva Actividad Manual</Heading>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                label="Título"
                                value={createForm.title}
                                onChange={(e) => setCreateForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="Título de la actividad"
                                required
                                maxLength={200}
                            />
                            <SelectField
                                label="Tipo"
                                value={createForm.type}
                                onChange={(e) => setCreateForm(f => ({ ...f, type: e.target.value }))}
                                options={typeOptions}
                            />
                        </div>

                        <FormField
                            label="Descripción"
                            value={createForm.description}
                            onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Descripción breve"
                            maxLength={500}
                        />

                        {/* Campo de contenido para cuentos/lecturas */}
                        {showContentField && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Contenido del {createForm.type === 'cuento' ? 'cuento' : 'texto'}
                                </label>
                                <textarea
                                    value={createForm.content}
                                    onChange={(e) => setCreateForm(f => ({ ...f, content: e.target.value }))}
                                    placeholder={`Escribe aquí el ${createForm.type === 'cuento' ? 'cuento' : 'texto de lectura'}...`}
                                    rows={8}
                                    maxLength={5000}
                                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm
                                        focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400
                                        placeholder:text-neutral-400 resize-y"
                                />
                                <p className="text-xs text-neutral-400 mt-1">
                                    {createForm.content.length}/5000 caracteres
                                </p>
                            </div>
                        )}

                        {/* Campo de archivo para colorear */}
                        {showFileField && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Archivo PDF para colorear
                                </label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setCreateFile(e.target.files[0] || null)}
                                    className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4
                                        file:rounded-lg file:border-0 file:text-sm file:font-medium
                                        file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200
                                        file:cursor-pointer cursor-pointer"
                                />
                            </div>
                        )}

                        <FormField
                            label="URL externa (opcional)"
                            value={createForm.externalUrl}
                            onChange={(e) => setCreateForm(f => ({ ...f, externalUrl: e.target.value }))}
                            placeholder="https://ejemplo.com/recurso"
                        />

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Grados</label>
                            <div className="flex flex-wrap gap-2">
                                {grades.map((g) => (
                                    <button
                                        key={g._id}
                                        type="button"
                                        onClick={() => toggleCreateGrade(g.order)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                                            ${createForm.targetGrades.includes(g.order)
                                                ? 'bg-neutral-900 text-white'
                                                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                            }`}
                                    >
                                        {gradeLabels[g.order] || g.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="submit" variant="primary" size="sm">Crear actividad</Button>
                            <Button type="button" variant="outline" size="sm" onClick={resetCreateForm}>Cancelar</Button>
                        </div>
                    </form>
                )}

                {/* Tab: Actividades aprobadas */}
                {tab === 'actividades' && (
                    <div>
                        {loadingActs ? (
                            <div className="text-center py-12 text-neutral-400">Cargando...</div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-12">
                                <Paragraph color="muted">No hay actividades aprobadas.</Paragraph>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activities.map((act) => (
                                    <ActivityRow
                                        key={act._id}
                                        activity={act}
                                        onToggleActive={() => toggleActive(act._id, act.isActive)}
                                        onDelete={() => handleDeleteActivity(act._id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Pendientes */}
                {tab === 'pendientes' && (
                    <div>
                        {loadingPending ? (
                            <div className="text-center py-12 text-neutral-400">Cargando...</div>
                        ) : pendingActivities.length === 0 ? (
                            <div className="text-center py-12">
                                <Paragraph color="muted">No hay actividades pendientes de aprobación.</Paragraph>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pendingActivities.map((act) => (
                                    <div key={act._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50/50">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                                                {act.imageUrl ? (
                                                    <img src={act.imageUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 truncate">{act.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <Badge variant="warning" size="sm">Pendiente</Badge>
                                                    <Badge variant="info" size="sm">
                                                        {typeOptions.find(t => t.value === act.type)?.label || act.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0 ml-13 sm:ml-0">
                                            <button type="button" onClick={() => handleApprove(act._id)} title="Aprobar"
                                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer">
                                                Aprobar
                                            </button>
                                            <button type="button" onClick={() => handleReject(act._id)} title="Rechazar"
                                                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors cursor-pointer">
                                                Rechazar
                                            </button>
                                            {act.externalUrl && (
                                                <a href={act.externalUrl} target="_blank" rel="noopener noreferrer" title="Ver recurso"
                                                    className="p-1.5 rounded text-neutral-300 hover:text-blue-500 transition-colors">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Fuentes RSS */}
                {tab === 'fuentes' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => { resetSourceForm(); setShowSourceForm(true); }} variant="primary" size="sm">
                                + Agregar fuente
                            </Button>
                        </div>

                        {showSourceForm && (
                            <form onSubmit={handleSourceSubmit} className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 space-y-4">
                                <Heading level="h3">{editingSource ? 'Editar fuente' : 'Nueva fuente RSS'}</Heading>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        label="Nombre"
                                        value={sourceForm.name}
                                        onChange={(e) => setSourceForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="Ej: Educaplay"
                                        required
                                    />
                                    <FormField
                                        label="URL del feed RSS"
                                        value={sourceForm.url}
                                        onChange={(e) => setSourceForm(f => ({ ...f, url: e.target.value }))}
                                        placeholder="https://ejemplo.com/rss"
                                        required
                                    />
                                </div>
                                <SelectField
                                    label="Tipo por defecto"
                                    value={sourceForm.defaultType}
                                    onChange={(e) => setSourceForm(f => ({ ...f, defaultType: e.target.value }))}
                                    options={typeOptions}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">Grados por defecto</label>
                                    <div className="flex flex-wrap gap-2">
                                        {grades.map((g) => (
                                            <button
                                                key={g.order}
                                                type="button"
                                                onClick={() => toggleSourceGrade(g.order)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                                                    ${sourceForm.defaultGrades.includes(g.order)
                                                        ? 'bg-neutral-900 text-white'
                                                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                                    }`}
                                            >
                                                {gradeLabels[g.order] || g.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button type="submit" variant="primary" size="sm">
                                        {editingSource ? 'Actualizar' : 'Crear'}
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={resetSourceForm}>Cancelar</Button>
                                </div>
                            </form>
                        )}

                        {loadingSources ? (
                            <div className="text-center py-12 text-neutral-400">Cargando...</div>
                        ) : sources.length === 0 ? (
                            <div className="text-center py-12">
                                <Paragraph color="muted">No hay fuentes RSS configuradas.</Paragraph>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sources.map((src) => (
                                    <div key={src._id} className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-900">{src.name}</p>
                                            <p className="text-xs text-neutral-400 truncate">{src.url}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={src.isActive ? 'success' : 'default'} size="sm">
                                                    {src.isActive ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                                <Badge variant="info" size="sm">
                                                    {typeOptions.find(t => t.value === src.defaultType)?.label || src.defaultType}
                                                </Badge>
                                                {src.lastFetched && (
                                                    <span className="text-[0.65rem] text-neutral-400">
                                                        Último fetch: {new Date(src.lastFetched).toLocaleDateString('es-CO')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button type="button" onClick={() => handleEditSource(src)}
                                                className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer transition-colors">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button type="button" onClick={() => handleDeleteSource(src._id)}
                                                className="p-1.5 rounded text-neutral-400 hover:text-red-500 cursor-pointer transition-colors">
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function ActivityRow({ activity: act, onToggleActive, onDelete }) {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colors
            ${act.isActive ? 'bg-white border-neutral-200' : 'bg-neutral-50 border-neutral-100 opacity-60'}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                {act.imageUrl ? (
                    <img src={act.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{act.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <Badge variant={statusConfig[act.status]?.variant || 'default'} size="sm">
                        {statusConfig[act.status]?.label || act.status}
                    </Badge>
                    <Badge variant="info" size="sm">
                        {typeOptions.find(t => t.value === act.type)?.label || act.type}
                    </Badge>
                    <span className="text-[0.65rem] text-neutral-400">{act.sourceType === 'rss' ? 'RSS' : 'Manual'}</span>
                    {act.fileUrl && <Badge variant="warning" size="sm">PDF</Badge>}
                </div>
            </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-13 sm:ml-0">
                <button type="button" onClick={onToggleActive} title={act.isActive ? 'Desactivar' : 'Activar'}
                    className={`p-1.5 rounded cursor-pointer transition-colors ${act.isActive ? 'text-green-500' : 'text-neutral-300 hover:text-green-400'}`}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {act.isActive ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                    </svg>
                </button>
                <button type="button" onClick={onDelete} title="Eliminar"
                    className="p-1.5 rounded text-neutral-300 hover:text-red-500 cursor-pointer transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                {(act.externalUrl || act.fileUrl) && (
                    <a href={act.fileUrl || act.externalUrl} target="_blank" rel="noopener noreferrer" title="Ver recurso"
                        className="p-1.5 rounded text-neutral-300 hover:text-blue-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                )}
            </div>
        </div>
    );
}
