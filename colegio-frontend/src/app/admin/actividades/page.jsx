'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import SelectField from '@/components/molecules/SelectField';
import AlertMessage from '@/components/molecules/AlertMessage';
import ToggleSwitch from '@/components/atoms/ToggleSwitch';
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

export default function AdminActividadesPage() {
    const [tab, setTab] = useState('actividades');
    const [alert, setAlert] = useState(null);

    // Actividades
    const [activities, setActivities] = useState([]);
    const [loadingActs, setLoadingActs] = useState(true);
    const [fetching, setFetching] = useState(false);

    // Fuentes RSS
    const [sources, setSources] = useState([]);
    const [loadingSources, setLoadingSources] = useState(true);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const [editingSource, setEditingSource] = useState(null);
    const [sourceForm, setSourceForm] = useState({ name: '', url: '', defaultType: 'otro', defaultGrades: [], isActive: true });

    // Grados disponibles
    const [grades, setGrades] = useState([]);

    useEffect(() => {
        loadGrades();
        loadActivities();
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
            await loadActivities();
        } catch {
            setAlert({ type: 'error', message: 'Error al ejecutar fetch de RSS' });
        } finally {
            setFetching(false);
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

    // Toggle featured
    const toggleFeatured = async (id, current) => {
        try {
            await activityService.update(id, { isFeatured: !current });
            setActivities((prev) => prev.map((a) => a._id === id ? { ...a, isFeatured: !current } : a));
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
            setAlert({ type: 'success', message: 'Actividad eliminada' });
        } catch {
            setAlert({ type: 'error', message: 'Error al eliminar actividad' });
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
            name: source.name,
            url: source.url,
            defaultType: source.defaultType,
            defaultGrades: source.defaultGrades || [],
            isActive: source.isActive,
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

    const toggleGradeInForm = (order) => {
        setSourceForm((prev) => ({
            ...prev,
            defaultGrades: prev.defaultGrades.includes(order)
                ? prev.defaultGrades.filter((g) => g !== order)
                : [...prev.defaultGrades, order],
        }));
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <Heading level="h1">Actividades Educativas</Heading>
                    <Button onClick={handleFetch} disabled={fetching} variant="primary" size="sm">
                        {fetching ? 'Actualizando...' : 'Actualizar desde RSS'}
                    </Button>
                </div>

                {alert && (
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-neutral-100 rounded-lg p-1 w-fit">
                    <button
                        type="button"
                        onClick={() => setTab('actividades')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer
                            ${tab === 'actividades' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                        Actividades ({activities.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('fuentes')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer
                            ${tab === 'fuentes' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                        Fuentes RSS ({sources.length})
                    </button>
                </div>

                {/* Tab: Actividades */}
                {tab === 'actividades' && (
                    <div>
                        {loadingActs ? (
                            <div className="text-center py-12 text-neutral-400">Cargando...</div>
                        ) : activities.length === 0 ? (
                            <div className="text-center py-12">
                                <Paragraph color="muted">No hay actividades. Agrega fuentes RSS y ejecuta una actualización.</Paragraph>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activities.map((act) => (
                                    <div key={act._id} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors
                                        ${act.isActive ? 'bg-white border-neutral-200' : 'bg-neutral-50 border-neutral-100 opacity-60'}`}>
                                        {/* Thumbnail */}
                                        <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                                            {act.imageUrl ? (
                                                <img src={act.imageUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-300 text-lg">
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-900 truncate">{act.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="info" size="sm">{typeOptions.find(t => t.value === act.type)?.label || act.type}</Badge>
                                                <span className="text-[0.65rem] text-neutral-400">{act.source}</span>
                                                {act.targetGrades?.length > 0 && (
                                                    <span className="text-[0.65rem] text-neutral-400">
                                                        {act.targetGrades.map(g => gradeLabels[g] || `${g}°`).join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => toggleFeatured(act._id, act.isFeatured)}
                                                title={act.isFeatured ? 'Quitar destacado' : 'Destacar'}
                                                className={`p-1.5 rounded cursor-pointer transition-colors ${act.isFeatured ? 'text-yellow-500' : 'text-neutral-300 hover:text-yellow-400'}`}
                                            >
                                                <svg className="h-4 w-4" fill={act.isFeatured ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleActive(act._id, act.isActive)}
                                                title={act.isActive ? 'Desactivar' : 'Activar'}
                                                className={`p-1.5 rounded cursor-pointer transition-colors ${act.isActive ? 'text-green-500' : 'text-neutral-300 hover:text-green-400'}`}
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    {act.isActive ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    )}
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteActivity(act._id)}
                                                title="Eliminar"
                                                className="p-1.5 rounded text-neutral-300 hover:text-red-500 cursor-pointer transition-colors"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                            <a
                                                href={act.externalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Ver recurso"
                                                className="p-1.5 rounded text-neutral-300 hover:text-blue-500 transition-colors"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
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

                        {/* Formulario de fuente */}
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
                                                onClick={() => toggleGradeInForm(g.order)}
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
                                    <Button type="button" variant="outline" size="sm" onClick={resetSourceForm}>
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Lista de fuentes */}
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
                                            <button
                                                type="button"
                                                onClick={() => handleEditSource(src)}
                                                className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer transition-colors"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSource(src._id)}
                                                className="p-1.5 rounded text-neutral-400 hover:text-red-500 cursor-pointer transition-colors"
                                            >
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
