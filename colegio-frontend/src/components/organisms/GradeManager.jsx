'use client';
import { useState, useEffect, useMemo } from 'react';
import Button from '@/components/atoms/Button';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import AlertMessage from '@/components/molecules/AlertMessage';
import Spinner from '@/components/atoms/Spinner';
import { gradeService } from '@/services/honorService';
import {
    LuSun, LuMoon, LuGraduationCap,
    LuPencil, LuTrash2,
    LuChevronsUpDown, LuChevronUp, LuChevronDown,
} from 'react-icons/lu';

const jornadaConfig = {
    manana: { label: 'Jornada Mañana', Icon: LuSun,  accent: 'text-amber-600',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    tarde:  { label: 'Jornada Tarde',  Icon: LuMoon, accent: 'text-indigo-600', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

const inputClass = 'px-3 py-1.5 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900';

/* ── Tabla por jornada ─────────────────────────────────────── */
function JornadaTable({ jornada, grades, search, onEdit, onDelete, deleting, editingId, editForm, onEditChange, onEditSave, onEditCancel, showAdd, onShowAdd, onAddChange, addForm, onAddSave, onAddCancel }) {
    const cfg = jornadaConfig[jornada];

    const [sortField, setSortField] = useState('order');
    const [sortDir, setSortDir]   = useState('asc');

    const handleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <LuChevronsUpDown className="w-3.5 h-3.5 text-neutral-300 ml-1 inline" />;
        return sortDir === 'asc'
            ? <LuChevronUp   className="w-3.5 h-3.5 ml-1 inline" />
            : <LuChevronDown className="w-3.5 h-3.5 ml-1 inline" />;
    };

    const filtered = useMemo(() => {
        let data = [...grades];
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(g => g.name.toLowerCase().includes(q));
        }
        data.sort((a, b) => {
            let vA = a[sortField] ?? '';
            let vB = b[sortField] ?? '';
            if (typeof vA === 'string') vA = vA.toLowerCase();
            if (typeof vB === 'string') vB = vB.toLowerCase();
            if (vA < vB) return sortDir === 'asc' ? -1 : 1;
            if (vA > vB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return data;
    }, [grades, search, sortField, sortDir]);

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col">

            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                    <cfg.Icon className={`w-5 h-5 ${cfg.accent}`} />
                    <span className="font-semibold text-neutral-900 text-sm">{cfg.label}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                        {grades.length}
                    </span>
                </div>
                {!showAdd && (
                    <button
                        onClick={onShowAdd}
                        className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                    >
                        + Agregar
                    </button>
                )}
            </div>

            {/* Form agregar */}
            {showAdd && (
                <div className="flex items-end gap-3 p-4 bg-neutral-50 border-b border-neutral-100 flex-wrap">
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-xs font-medium text-neutral-500 mb-1 block">Nombre</label>
                        <input
                            value={addForm.name}
                            onChange={e => onAddChange({ ...addForm, name: e.target.value })}
                            placeholder="Ej: 1°"
                            className={inputClass + ' w-full'}
                        />
                    </div>
                    <div className="w-20">
                        <label className="text-xs font-medium text-neutral-500 mb-1 block">Orden</label>
                        <input
                            type="number"
                            value={addForm.order}
                            onChange={e => onAddChange({ ...addForm, order: parseInt(e.target.value) || 0 })}
                            className={inputClass + ' w-full'}
                            min={0}
                        />
                    </div>
                    <div className="flex gap-2 pb-0.5">
                        <Button variant="primary" size="sm" onClick={onAddSave}>Guardar</Button>
                        <Button variant="ghost"   size="sm" onClick={onAddCancel}>Cancelar</Button>
                    </div>
                </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th
                                className="px-4 py-3 text-left font-medium text-neutral-500 cursor-pointer select-none w-16 text-xs uppercase tracking-wide"
                                onClick={() => handleSort('order')}
                            >
                                Orden <SortIcon field="order" />
                            </th>
                            <th
                                className="px-4 py-3 text-left font-medium text-neutral-500 cursor-pointer select-none text-xs uppercase tracking-wide"
                                onClick={() => handleSort('name')}
                            >
                                Nombre <SortIcon field="name" />
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-neutral-500 text-xs uppercase tracking-wide">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center">
                                    <LuGraduationCap className="w-8 h-8 mx-auto mb-2 text-neutral-200" />
                                    <p className="text-neutral-400 text-xs">Sin grados registrados</p>
                                </td>
                            </tr>
                        ) : filtered.map(grade => (
                            <tr key={grade._id} className="hover:bg-neutral-50 transition-colors">
                                {editingId === grade._id ? (
                                    <td colSpan={3} className="px-4 py-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <input
                                                value={editForm.name}
                                                onChange={e => onEditChange({ ...editForm, name: e.target.value })}
                                                placeholder="Nombre"
                                                className={inputClass}
                                            />
                                            <input
                                                type="number"
                                                value={editForm.order}
                                                onChange={e => onEditChange({ ...editForm, order: parseInt(e.target.value) || 0 })}
                                                className={inputClass + ' w-20'}
                                                min={0}
                                            />
                                            <Button variant="primary" size="sm" onClick={onEditSave}>Guardar</Button>
                                            <Button variant="ghost"   size="sm" onClick={onEditCancel}>Cancelar</Button>
                                        </div>
                                    </td>
                                ) : (
                                    <>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                                                {grade.order}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-neutral-900">
                                            {grade.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => onEdit(grade)}
                                                    className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                                    title="Editar"
                                                >
                                                    <LuPencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(grade._id)}
                                                    disabled={deleting === grade._id}
                                                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                    title="Eliminar"
                                                >
                                                    <LuTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ── Componente principal ──────────────────────────────────── */
export default function GradeManager() {
    const [grades, setGrades]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert]     = useState(null);
    const [search, setSearch]   = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm]   = useState({ name: '', order: 0, jornada: 'manana' });

    const [showAddJornada, setShowAddJornada] = useState(null); // 'manana' | 'tarde' | null
    const [addForm, setAddForm]               = useState({ name: '', order: 0, jornada: 'manana' });

    const [deleting, setDeleting] = useState(null);

    const fetchGrades = async () => {
        setLoading(true);
        try {
            const data = await gradeService.getAll();
            setGrades(data.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error cargando grados.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGrades(); }, []);

    const gradesByJornada = useMemo(() => ({
        manana: grades.filter(g => (g.jornada || 'manana') === 'manana'),
        tarde:  grades.filter(g => g.jornada === 'tarde'),
    }), [grades]);

    /* ── Agregar ── */
    const openAdd = (jornada) => {
        setShowAddJornada(jornada);
        setEditingId(null);
        setAddForm({ name: '', order: gradesByJornada[jornada].length, jornada });
    };

    const handleAdd = async () => {
        if (!addForm.name.trim()) return;
        try {
            await gradeService.create(addForm);
            setAlert({ type: 'success', message: 'Grado creado exitosamente.' });
            setShowAddJornada(null);
            fetchGrades();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al crear el grado.' });
        }
    };

    /* ── Editar ── */
    const startEdit = (grade) => {
        setEditingId(grade._id);
        setEditForm({ name: grade.name, order: grade.order, jornada: grade.jornada || 'manana' });
        setShowAddJornada(null);
    };

    const handleUpdate = async () => {
        if (!editForm.name.trim()) return;
        try {
            await gradeService.update(editingId, editForm);
            setAlert({ type: 'success', message: 'Grado actualizado.' });
            setEditingId(null);
            fetchGrades();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al actualizar.' });
        }
    };

    /* ── Eliminar ── */
    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este grado?')) return;
        setDeleting(id);
        try {
            await gradeService.delete(id);
            setAlert({ type: 'success', message: 'Grado eliminado.' });
            fetchGrades();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al eliminar.' });
        } finally {
            setDeleting(null);
        }
    };

    const handleSeed = async () => {
        try {
            const data = await gradeService.seed();
            setAlert({ type: 'success', message: data.message });
            fetchGrades();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al cargar grados por defecto.' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {alert && (
                <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <Heading level="h5">Grados</Heading>
                    <Paragraph color="muted" className="mt-1">{grades.length} grados configurados</Paragraph>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Buscar grado..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="px-3 py-2 border border-neutral-200 rounded-lg text-sm w-48
                            focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    />
                    <Button variant="outline" size="sm" onClick={handleSeed}>
                        Cargar por defecto
                    </Button>
                </div>
            </div>

            {/* Dos paneles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {(['manana', 'tarde']).map(jornada => (
                    <JornadaTable
                        key={jornada}
                        jornada={jornada}
                        grades={gradesByJornada[jornada]}
                        search={search}
                        onEdit={startEdit}
                        onDelete={handleDelete}
                        deleting={deleting}
                        editingId={editingId}
                        editForm={editForm}
                        onEditChange={setEditForm}
                        onEditSave={handleUpdate}
                        onEditCancel={() => setEditingId(null)}
                        showAdd={showAddJornada === jornada}
                        onShowAdd={() => openAdd(jornada)}
                        addForm={addForm}
                        onAddChange={setAddForm}
                        onAddSave={handleAdd}
                        onAddCancel={() => setShowAddJornada(null)}
                    />
                ))}
            </div>
        </div>
    );
}
