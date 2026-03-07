'use client';
import { useState, useEffect } from 'react';
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
                            {entries.length} entrada(s) este mes
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
                            grades={grades}
                            onSubmit={editing ? handleUpdate : handleCreate}
                        />
                        <Button variant="ghost" size="sm"
                            onClick={() => { setEditing(null); setShowForm(false); }}
                            className="mt-3">
                            Cancelar
                        </Button>
                    </div>
                )}

                {/* Lista de entries agrupadas por grado */}
                {loading ? (
                    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                ) : entries.length === 0 ? (
                    <div className="bg-white rounded-xl border border-neutral-200 flex flex-col items-center py-12 gap-2">
                        <span className="text-4xl">🏆</span>
                        <Paragraph color="muted">No hay entradas este mes. ¡Crea la primera!</Paragraph>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Agrupar entries por grado */}
                        {Object.values(
                            entries.reduce((acc, entry) => {
                                const gradeId = entry.grade?._id || 'sin-grado';
                                if (!acc[gradeId]) {
                                    acc[gradeId] = {
                                        grade: entry.grade,
                                        entries: [],
                                    };
                                }
                                acc[gradeId].entries.push(entry);
                                return acc;
                            }, {})
                        )
                            .sort((a, b) => (a.grade?.order ?? 99) - (b.grade?.order ?? 99))
                            .map(({ grade, entries: gradeEntries }) => (
                                <div key={grade?._id || 'sin-grado'}
                                    className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                                    {/* Header del grado */}
                                    <div className="px-5 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2">
                                        <span className="text-base">🎓</span>
                                        <h4 className="font-mono font-semibold text-sm text-neutral-800 tracking-tight">
                                            {grade?.name || 'Sin grado'}
                                        </h4>
                                        <span className="text-xs text-neutral-400 ml-auto">
                                            {gradeEntries.length}/3 categorías
                                        </span>
                                    </div>

                                    {/* Entries del grado */}
                                    <div className="divide-y divide-neutral-100">
                                        {gradeEntries.map((entry) => (
                                            <div key={entry._id}
                                                className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    {entry.photo?.url ? (
                                                        <img src={entry.photo.url} alt={entry.studentName}
                                                            className="h-10 w-10 rounded-full object-cover flex-shrink-0 border border-neutral-200" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-sm flex-shrink-0">
                                                            👤
                                                        </div>
                                                    )}
                                                    <p className="text-sm font-medium text-neutral-900 truncate">
                                                        {entry.studentName}
                                                    </p>
                                                </div>
                                                <Badge variant={categoryVariants[entry.category] || 'default'} size="sm">
                                                    {categoryLabels[entry.category] || entry.category}
                                                </Badge>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                                                        Editar
                                                    </Button>
                                                    <Button variant="danger" size="sm"
                                                        loading={deleting === entry._id}
                                                        onClick={() => handleDelete(entry._id)}>
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
