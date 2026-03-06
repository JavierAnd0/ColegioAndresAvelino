'use client';
import { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import AlertMessage from '@/components/molecules/AlertMessage';
import Spinner from '@/components/atoms/Spinner';
import { gradeService } from '@/services/honorService';

export default function GradeManager() {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', order: 0 });
    const [showAdd, setShowAdd] = useState(false);

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

    const handleSeed = async () => {
        try {
            const data = await gradeService.seed();
            setAlert({ type: 'success', message: data.message });
            fetchGrades();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al cargar grados por defecto.' });
        }
    };

    const handleAdd = async () => {
        if (!form.name.trim()) return;
        try {
            await gradeService.create(form);
            setAlert({ type: 'success', message: 'Grado creado exitosamente.' });
            setForm({ name: '', order: grades.length });
            setShowAdd(false);
            fetchGrades();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al crear el grado.' });
        }
    };

    const handleUpdate = async () => {
        if (!form.name.trim()) return;
        try {
            await gradeService.update(editingId, form);
            setAlert({ type: 'success', message: 'Grado actualizado.' });
            setEditingId(null);
            setForm({ name: '', order: 0 });
            fetchGrades();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al actualizar.' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este grado?')) return;
        try {
            await gradeService.delete(id);
            setAlert({ type: 'success', message: 'Grado eliminado.' });
            fetchGrades();
        } catch (err) {
            setAlert({ type: 'error', message: err.message || 'Error al eliminar.' });
        }
    };

    const startEdit = (grade) => {
        setEditingId(grade._id);
        setForm({ name: grade.name, order: grade.order });
        setShowAdd(false);
    };

    const inputClass = 'px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900';

    return (
        <div className="flex flex-col gap-5">
            {alert && (
                <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex items-center justify-between">
                <div>
                    <Heading level="h5">Grados</Heading>
                    <Paragraph color="muted" className="mt-1">{grades.length} grados configurados</Paragraph>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSeed}>
                        Cargar por defecto
                    </Button>
                    {!showAdd && (
                        <Button variant="primary" size="sm" onClick={() => {
                            setShowAdd(true);
                            setEditingId(null);
                            setForm({ name: '', order: grades.length });
                        }}>
                            + Nuevo grado
                        </Button>
                    )}
                </div>
            </div>

            {/* Form agregar */}
            {showAdd && (
                <div className="flex items-end gap-3 p-4 bg-neutral-50 rounded-lg">
                    <div className="flex-1">
                        <label className="text-xs font-medium text-neutral-500 mb-1 block">Nombre</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Ej: Preescolar" className={inputClass + ' w-full'} />
                    </div>
                    <div className="w-24">
                        <label className="text-xs font-medium text-neutral-500 mb-1 block">Orden</label>
                        <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                            className={inputClass + ' w-full'} min={0} />
                    </div>
                    <Button variant="primary" size="sm" onClick={handleAdd}>Guardar</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
                </div>
            )}

            {/* Lista */}
            {loading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
            ) : grades.length === 0 ? (
                <div className="text-center py-8">
                    <span className="text-4xl block mb-2">🎓</span>
                    <Paragraph color="muted">No hay grados. Usa "Cargar por defecto" para comenzar.</Paragraph>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
                    {grades.map(grade => (
                        <div key={grade._id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
                            {editingId === grade._id ? (
                                <div className="flex items-center gap-3 flex-1">
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className={inputClass} />
                                    <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                                        className={inputClass + ' w-20'} min={0} />
                                    <Button variant="primary" size="sm" onClick={handleUpdate}>Guardar</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancelar</Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-neutral-400 w-6 text-center">{grade.order}</span>
                                        <span className="text-sm font-medium text-neutral-900">{grade.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => startEdit(grade)}>Editar</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(grade._id)}>Eliminar</Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
