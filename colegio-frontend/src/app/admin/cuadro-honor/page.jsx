'use client';
import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import HonorEntryForm from '@/components/molecules/HonorEntryForm';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import AlertMessage from '@/components/molecules/AlertMessage';
import Badge from '@/components/atoms/Badge';
import { honorService, gradeService } from '@/services/honorService';
import { periodService } from '@/services/periodService';
import { LuSun, LuMoon, LuUser, LuTrophy, LuCalendar, LuCheck, LuPlus, LuTrash2 } from 'react-icons/lu';

const positionLabels = { 1: 'Primer Puesto', 2: 'Segundo Puesto', 3: 'Tercer Puesto' };
const positionMedals = { 1: '🥇', 2: '🥈', 3: '🥉' };
const positionVariants = { 1: 'warning', 2: 'default', 3: 'default' };

export default function AdminCuadroHonorPage() {
    // Periodos
    const [periods, setPeriods]         = useState([]);
    const [periodId, setPeriodId]       = useState('');
    const [showPeriodForm, setShowPeriodForm] = useState(false);
    const [newPeriod, setNewPeriod]     = useState({ name: '', year: new Date().getFullYear() });
    const [savingPeriod, setSavingPeriod] = useState(false);
    const [activating, setActivating]   = useState(null);
    const [deletingPeriod, setDeletingPeriod] = useState(null);

    // Entradas
    const [entries, setEntries]         = useState([]);
    const [grades, setGrades]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [showForm, setShowForm]       = useState(false);
    const [editing, setEditing]         = useState(null);
    const [alert, setAlert]             = useState(null);
    const [deleting, setDeleting]       = useState(null);
    const [saving, setSaving]           = useState(false);
    const [jornada, setJornada]         = useState('manana');
    const [search, setSearch]           = useState('');
    const [sortField, setSortField]     = useState('studentName');
    const [sortDir, setSortDir]         = useState('asc');

    const filteredGrades = grades.filter(g => (g.jornada || 'manana') === jornada);
    const jornadaGradeIds = new Set(filteredGrades.map(g => g._id));

    const processedEntries = useMemo(() => {
        let data = entries.filter(e => {
            const gradeId = e.grade?._id || e.grade;
            return jornadaGradeIds.has(gradeId);
        });
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(e =>
                e.studentName.toLowerCase().includes(q) ||
                (e.grade?.name || '').toLowerCase().includes(q)
            );
        }
        data.sort((a, b) => {
            let valA = sortField === 'grade' ? (a.grade?.name || '') : (a[sortField] ?? '');
            let valB = sortField === 'grade' ? (b.grade?.name || '') : (b[sortField] ?? '');
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return data;
    }, [entries, search, sortField, sortDir, jornada, grades]);

    const groupedByGrade = useMemo(() => {
        return filteredGrades.map(grade => ({
            grade,
            entries: processedEntries.filter(e => (e.grade?._id || e.grade) === grade._id),
        })).filter(g => g.entries.length > 0);
    }, [filteredGrades, processedEntries]);

    const handleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className="text-neutral-300 ml-1">↕</span>;
        return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    // ── Carga inicial ──
    useEffect(() => {
        const init = async () => {
            try {
                const [periodsData, gradesData] = await Promise.all([
                    periodService.getAll(),
                    gradeService.getAll(),
                ]);
                const list = periodsData.data || [];
                setPeriods(list);
                setGrades(gradesData.data || []);
                const active = list.find(p => p.isActive) || list[0];
                if (active) setPeriodId(active._id);
            } catch {
                setAlert({ type: 'error', message: 'Error cargando datos iniciales.' });
            }
        };
        init();
    }, []);

    // ── Cargar entradas cuando cambia el periodo ──
    useEffect(() => {
        if (!periodId) { setLoading(false); return; }
        fetchEntries();
    }, [periodId]);

    const fetchEntries = async () => {
        if (!periodId) return;
        setLoading(true);
        try {
            const boardData = await honorService.getBoard(periodId);
            setEntries(boardData.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error cargando entradas.' });
        } finally {
            setLoading(false);
        }
    };

    // ── Periodos ──
    const handleCreatePeriod = async (e) => {
        e.preventDefault();
        if (!newPeriod.name.trim()) return;
        setSavingPeriod(true);
        try {
            const res = await periodService.create(newPeriod);
            const updated = [...periods, res.data];
            setPeriods(updated);
            setPeriodId(res.data._id);
            setNewPeriod({ name: '', year: new Date().getFullYear() });
            setShowPeriodForm(false);
            setAlert({ type: 'success', message: 'Periodo creado exitosamente.' });
        } catch {
            setAlert({ type: 'error', message: 'Error al crear el periodo.' });
        } finally {
            setSavingPeriod(false);
        }
    };

    const handleActivatePeriod = async (id) => {
        setActivating(id);
        try {
            await periodService.activate(id);
            setPeriods(prev => prev.map(p => ({ ...p, isActive: p._id === id })));
            setAlert({ type: 'success', message: 'Periodo activado.' });
        } catch {
            setAlert({ type: 'error', message: 'Error al activar el periodo.' });
        } finally {
            setActivating(null);
        }
    };

    const handleDeletePeriod = async (id) => {
        if (!confirm('¿Eliminar este periodo? Las entradas asociadas también se verán afectadas.')) return;
        setDeletingPeriod(id);
        try {
            await periodService.delete(id);
            const updated = periods.filter(p => p._id !== id);
            setPeriods(updated);
            if (periodId === id) {
                const next = updated[0];
                setPeriodId(next?._id || '');
            }
            setAlert({ type: 'success', message: 'Periodo eliminado.' });
        } catch {
            setAlert({ type: 'error', message: 'Error al eliminar el periodo.' });
        } finally {
            setDeletingPeriod(null);
        }
    };

    // ── Entradas ──
    const handleCreate = async (formData) => {
        setSaving(true);
        try {
            await honorService.create({ ...formData, period: periodId });
            setAlert({ type: 'success', message: 'Entrada creada exitosamente.' });
            setShowForm(false);
            fetchEntries();
        } catch (err) {
            setAlert({ type: 'error', message: err.response?.data?.message || err.message || 'Error al crear la entrada.' });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (formData) => {
        setSaving(true);
        try {
            await honorService.update(editing._id, formData);
            setAlert({ type: 'success', message: 'Entrada actualizada exitosamente.' });
            setEditing(null);
            setShowForm(false);
            fetchEntries();
        } catch (err) {
            setAlert({ type: 'error', message: err.response?.data?.message || err.message || 'Error al actualizar.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta entrada del cuadro de honor?')) return;
        setDeleting(id);
        try {
            await honorService.delete(id);
            setAlert({ type: 'success', message: 'Entrada eliminada.' });
            fetchEntries();
        } catch {
            setAlert({ type: 'error', message: 'Error al eliminar.' });
        } finally {
            setDeleting(null);
        }
    };

    const handleEdit = (entry) => {
        setEditing(entry);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const activePeriod = periods.find(p => p._id === periodId);

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Heading level="h3">Cuadro de Honor</Heading>
                        <Paragraph color="muted" className="mt-1">
                            {processedEntries.length} entrada(s) en este periodo
                        </Paragraph>
                    </div>
                    {!showForm && (
                        <Button variant="primary" onClick={() => { setShowForm(true); setEditing(null); }}>
                            + Nuevo estudiante
                        </Button>
                    )}
                </div>

                {/* ── Gestión de periodos ── */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                            <LuCalendar className="w-4 h-4 text-neutral-500" />
                            <span className="font-semibold text-sm text-neutral-700">Periodos</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPeriodForm(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer border border-neutral-200"
                        >
                            <LuPlus className="w-3.5 h-3.5" /> Nuevo periodo
                        </button>
                    </div>

                    {showPeriodForm && (
                        <form onSubmit={handleCreatePeriod} className="px-4 py-3 border-b border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-neutral-600 mb-1">Nombre del periodo</label>
                                <input
                                    type="text"
                                    value={newPeriod.name}
                                    onChange={e => setNewPeriod(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Ej: Primer Periodo, Primer Bimestre..."
                                    maxLength={100}
                                    required
                                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-medium text-neutral-600 mb-1">Año</label>
                                <input
                                    type="number"
                                    value={newPeriod.year}
                                    onChange={e => setNewPeriod(p => ({ ...p, year: parseInt(e.target.value) }))}
                                    min={2000} max={2100}
                                    required
                                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" variant="primary" size="sm" loading={savingPeriod}>
                                    Crear
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPeriodForm(false)}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    )}

                    {periods.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-neutral-400">No hay periodos creados. Crea uno para empezar.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {periods.map(period => (
                                <div key={period._id} className={`flex items-center justify-between px-4 py-3 transition-colors ${period._id === periodId ? 'bg-neutral-50' : 'hover:bg-neutral-50'}`}>
                                    <button
                                        type="button"
                                        onClick={() => setPeriodId(period._id)}
                                        className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                                    >
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${period._id === periodId ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                                        <div>
                                            <span className="font-medium text-sm text-neutral-900">{period.name}</span>
                                            <span className="text-xs text-neutral-400 ml-2">{period.year}</span>
                                        </div>
                                        {period.isActive && (
                                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                <LuCheck className="w-3 h-3" /> Activo
                                            </span>
                                        )}
                                    </button>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {!period.isActive && (
                                            <button
                                                type="button"
                                                onClick={() => handleActivatePeriod(period._id)}
                                                disabled={activating === period._id}
                                                className="px-2.5 py-1 rounded-lg text-xs font-medium text-green-700 hover:bg-green-50 border border-green-200 transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                {activating === period._id ? '...' : 'Activar'}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePeriod(period._id)}
                                            disabled={deletingPeriod === period._id}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                            title="Eliminar periodo"
                                        >
                                            <LuTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Alerta ── */}
                {alert && (
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {/* ── Formulario de entrada ── */}
                {showForm && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-6">
                        <Heading level="h5" className="mb-5">
                            {editing ? 'Editar estudiante' : 'Nuevo estudiante'}
                        </Heading>
                        <HonorEntryForm
                            initialData={editing || { period: periodId, jornada }}
                            grades={grades}
                            periods={periods}
                            onSubmit={editing ? handleUpdate : handleCreate}
                            loading={saving}
                        />
                        <Button variant="ghost" size="sm"
                            onClick={() => { setEditing(null); setShowForm(false); }}
                            className="mt-3">
                            Cancelar
                        </Button>
                    </div>
                )}

                {/* ── Tabla de entradas ── */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-neutral-100 items-center">
                        <div className="flex gap-2">
                            {[
                                { key: 'manana', label: 'Mañana', Icon: LuSun },
                                { key: 'tarde', label: 'Tarde', Icon: LuMoon },
                            ].map(j => (
                                <button key={j.key} type="button" onClick={() => setJornada(j.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                                        jornada === j.key
                                            ? 'bg-neutral-900 text-white shadow-sm'
                                            : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
                                    }`}>
                                    <j.Icon className="w-3.5 h-3.5" /> Jornada {j.label}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar estudiante o grado..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm flex-1
                                focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                        />
                    </div>

                    {!periodId ? (
                        <div className="flex flex-col items-center py-12 gap-2">
                            <LuCalendar className="w-10 h-10 text-neutral-300" />
                            <Paragraph color="muted">Crea o selecciona un periodo para ver entradas.</Paragraph>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                    ) : processedEntries.length === 0 ? (
                        <div className="flex flex-col items-center py-12 gap-2">
                            <LuTrophy className="w-10 h-10 text-neutral-300" />
                            <Paragraph color="muted">
                                {search ? 'No se encontraron resultados.' : `No hay entradas en ${activePeriod?.name || 'este periodo'} para esta jornada.`}
                            </Paragraph>
                        </div>
                    ) : (
                        <>
                        {/* Vista móvil */}
                        <div className="md:hidden divide-y divide-neutral-100">
                            {groupedByGrade.map(({ grade, entries: gradeEntries }) => (
                                <div key={grade._id}>
                                    <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                                        <LuTrophy className="w-3.5 h-3.5 text-neutral-400" />
                                        <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">{grade.name}</span>
                                        <span className="text-xs text-neutral-400">{gradeEntries.length} entrada(s)</span>
                                    </div>
                                    {gradeEntries.map(entry => (
                                        <div key={entry._id} className="p-4 flex gap-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                                            {entry.photo?.url ? (
                                                <img src={entry.photo.url} alt={entry.studentName}
                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                                                    <LuUser className="w-5 h-5 text-neutral-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-neutral-900 text-sm">{entry.studentName}</p>
                                                <div className="mt-1">
                                                    <Badge variant={positionVariants[entry.position] || 'default'} size="sm">
                                                        {positionMedals[entry.position]} {positionLabels[entry.position] || `Puesto ${entry.position}`}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <button onClick={() => handleEdit(entry)}
                                                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                                        title="Editar">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(entry._id)}
                                                        disabled={deleting === entry._id}
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                        title="Eliminar">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Vista desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                            onClick={() => handleSort('studentName')}>
                                            Estudiante <SortIcon field="studentName" />
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                            onClick={() => handleSort('grade')}>
                                            Grado <SortIcon field="grade" />
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                            onClick={() => handleSort('position')}>
                                            Posición <SortIcon field="position" />
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-neutral-600">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedByGrade.map(({ grade, entries: gradeEntries }) => (
                                        <React.Fragment key={grade._id}>
                                            <tr className="bg-neutral-50 border-y border-neutral-200">
                                                <td colSpan={4} className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <LuTrophy className="w-3.5 h-3.5 text-neutral-400" />
                                                        <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">{grade.name}</span>
                                                        <span className="text-xs text-neutral-400 ml-1">{gradeEntries.length} entrada(s)</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {gradeEntries.map(entry => (
                                                <tr key={entry._id} className="hover:bg-neutral-50 transition-colors border-b border-neutral-100">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {entry.photo?.url ? (
                                                                <img src={entry.photo.url} alt={entry.studentName}
                                                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                                                                    <LuUser className="w-4 h-4 text-neutral-400" />
                                                                </div>
                                                            )}
                                                            <span className="font-medium text-neutral-900">{entry.studentName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-neutral-600">{entry.grade?.name || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={positionVariants[entry.position] || 'default'} size="sm">
                                                            {positionMedals[entry.position]} {positionLabels[entry.position] || `Puesto ${entry.position}`}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleEdit(entry)}
                                                                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                                                title="Editar">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button onClick={() => handleDelete(entry._id)}
                                                                disabled={deleting === entry._id}
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
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        </>
                    )}

                    {!loading && processedEntries.length > 0 && (
                        <div className="px-4 py-3 border-t border-neutral-100">
                            <p className="text-xs text-neutral-500">
                                {processedEntries.length} resultado{processedEntries.length !== 1 ? 's' : ''}
                                {' · '}{groupedByGrade.length} grado{groupedByGrade.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
