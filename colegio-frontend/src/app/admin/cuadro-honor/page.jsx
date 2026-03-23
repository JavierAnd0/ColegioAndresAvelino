'use client';
import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import HonorEntryForm from '@/components/molecules/HonorEntryForm';
import MonthSelector from '@/components/molecules/MonthSelector';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import AlertMessage from '@/components/molecules/AlertMessage';
import Badge from '@/components/atoms/Badge';
import { honorService, gradeService } from '@/services/honorService';
import { LuSun, LuMoon, LuUser, LuTrophy } from 'react-icons/lu';

const categoryVariants = {
    academico: 'info',
    valores: 'success',
    reciclaje: 'warning',
};

const categoryLabels = {
    academico: 'Académico',
    valores: 'Valores',
    reciclaje: 'Reciclaje',
};

export default function AdminCuadroHonorPage() {
    const now = new Date();
    const [entries, setEntries] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [alert, setAlert] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [jornada, setJornada] = useState('manana');

    // DataTable state
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('studentName');
    const [sortDir, setSortDir] = useState('asc');

    // Filtrar grados por jornada seleccionada
    const filteredGrades = grades.filter(g => (g.jornada || 'manana') === jornada);
    const jornadaGradeIds = new Set(filteredGrades.map(g => g._id));

    // Filtrar, buscar y ordenar entries
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

    // Agrupar por grado (según el orden de filteredGrades)
    const groupedByGrade = useMemo(() => {
        return filteredGrades.map(grade => ({
            grade,
            entries: processedEntries.filter(e => (e.grade?._id || e.grade) === grade._id),
        })).filter(g => g.entries.length > 0);
    }, [filteredGrades, processedEntries]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className="text-neutral-300 ml-1">↕</span>;
        return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [boardData, gradesData] = await Promise.all([
                honorService.getBoard(year, month),
                gradeService.getAll(),
            ]);
            setEntries(boardData.data || []);
            setGrades(gradesData.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error cargando datos.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [year, month]);

    const handleCreate = async (formData) => {
        try {
            await honorService.create(formData);
            setAlert({ type: 'success', message: 'Entrada creada exitosamente.' });
            setShowForm(false);
            fetchData();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al crear la entrada.' });
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await honorService.update(editing._id, formData);
            setAlert({ type: 'success', message: 'Entrada actualizada exitosamente.' });
            setEditing(null);
            setShowForm(false);
            fetchData();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al actualizar.' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta entrada del cuadro de honor?')) return;
        setDeleting(id);
        try {
            await honorService.delete(id);
            setAlert({ type: 'success', message: 'Entrada eliminada.' });
            fetchData();
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

    const handleMonthChange = (newYear, newMonth) => {
        setYear(newYear);
        setMonth(newMonth);
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Heading level="h3">Cuadro de Honor</Heading>
                        <Paragraph color="muted" className="mt-1">
                            {processedEntries.length} entrada(s) este mes
                        </Paragraph>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <MonthSelector year={year} month={month} onChange={handleMonthChange} />
                        {!showForm && (
                            <Button variant="primary" onClick={() => { setShowForm(true); setEditing(null); }}>
                                + Nueva entrada
                            </Button>
                        )}
                    </div>
                </div>

                {/* Jornada selector */}
                <div className="flex gap-2">
                    {[
                        { key: 'manana', label: 'Mañana', Icon: LuSun },
                        { key: 'tarde', label: 'Tarde', Icon: LuMoon },
                    ].map(j => (
                        <button
                            key={j.key}
                            type="button"
                            onClick={() => setJornada(j.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                                jornada === j.key
                                    ? 'bg-neutral-900 text-white shadow-md'
                                    : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
                            }`}
                        >
                            <j.Icon className="w-4 h-4" /> Jornada {j.label}
                        </button>
                    ))}
                </div>

                {/* Alerta */}
                {alert && (
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {/* Formulario */}
                {showForm && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-6">
                        <Heading level="h5" className="mb-5">
                            {editing ? 'Editar entrada' : 'Nueva entrada'}
                        </Heading>
                        <HonorEntryForm
                            initialData={editing || { year, month }}
                            grades={filteredGrades}
                            onSubmit={editing ? handleUpdate : handleCreate}
                        />
                        <Button variant="ghost" size="sm"
                            onClick={() => { setEditing(null); setShowForm(false); }}
                            className="mt-3">
                            Cancelar
                        </Button>
                    </div>
                )}

                {/* DataTable */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-neutral-100">
                        <input
                            type="text"
                            placeholder="Buscar estudiante o grado..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm flex-1
                                focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                    ) : processedEntries.length === 0 ? (
                        <div className="flex flex-col items-center py-12 gap-2">
                            <LuTrophy className="w-10 h-10 text-neutral-300" />
                            <Paragraph color="muted">
                                {search ? 'No se encontraron resultados.' : 'No hay entradas este mes para esta jornada. ¡Crea la primera!'}
                            </Paragraph>
                        </div>
                    ) : (
                        <>
                        {/* Vista móvil — cards por grado */}
                        <div className="md:hidden divide-y divide-neutral-100">
                            {groupedByGrade.map(({ grade, entries: gradeEntries }) => (
                                <div key={grade._id}>
                                    <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                                        <LuTrophy className="w-3.5 h-3.5 text-neutral-400" />
                                        <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                                            {grade.name}
                                        </span>
                                        <span className="text-xs text-neutral-400">
                                            {gradeEntries.length} entrada(s)
                                        </span>
                                    </div>
                                    {gradeEntries.map((entry) => (
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
                                                    <Badge variant={categoryVariants[entry.category] || 'default'} size="sm">
                                                        {categoryLabels[entry.category] || entry.category}
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

                        {/* Vista desktop — tabla */}
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
                                            onClick={() => handleSort('category')}>
                                            Categoría <SortIcon field="category" />
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-neutral-600">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedByGrade.map(({ grade, entries: gradeEntries }) => (
                                        <React.Fragment key={grade._id}>
                                            {/* Fila separadora de grado */}
                                            <tr className="bg-neutral-50 border-y border-neutral-200">
                                                <td colSpan={4} className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <LuTrophy className="w-3.5 h-3.5 text-neutral-400" />
                                                        <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                                                            {grade.name}
                                                        </span>
                                                        <span className="text-xs text-neutral-400 ml-1">
                                                            {gradeEntries.length} entrada(s)
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {/* Filas de estudiantes */}
                                            {gradeEntries.map((entry) => (
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
                                                    <td className="px-4 py-3 text-neutral-600">
                                                        {entry.grade?.name || '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={categoryVariants[entry.category] || 'default'} size="sm">
                                                            {categoryLabels[entry.category] || entry.category}
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

                    {/* Footer con total */}
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
