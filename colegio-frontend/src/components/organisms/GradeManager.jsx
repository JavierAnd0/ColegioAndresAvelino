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
    const [form, setForm] = useState({ name: '', order: 0, jornada: 'manana' });
    const [showAdd, setShowAdd] = useState(false);
    const [jornadaFilter, setJornadaFilter] = useState('manana');

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
            setForm({ name: '', order: filteredGrades.length, jornada: jornadaFilter });
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
            setForm({ name: '', order: 0, jornada: jornadaFilter });
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
        setForm({ name: grade.name, order: grade.order, jornada: grade.jornada || 'manana' });
        setShowAdd(false);
    };

    const filteredGrades = grades.filter(g => g.jornada === jornadaFilter || (!g.jornada && jornadaFilter === 'manana'));

    const inputClass = 'px-3 py-1.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900';
    const jornadaTabClass = (j) => `px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${jornadaFilter === j ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`;

    return (
        <div className="flex flex-col gap-5">
            {alert && (
                <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Heading level="h5">Grados</Heading>
                        <Paragraph color="muted" className="mt-1">{filteredGrades.length} grados en jornada {jornadaFilter === 'manana' ? 'mañana' : 'tarde'}</Paragraph>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSeed}>
                            Cargar por defecto
                        </Button>
                        {!showAdd && (
                            <Button variant="primary" size="sm" onClick={() => {
                                setShowAdd(true);
                                setEditingId(null);
                                setForm({ name: '', order: filteredGrades.length, jornada: jornadaFilter });
                            }}>
                                + Nuevo grado
                            </Button>
                        )}
                    </div>
                </div>

                {/* Selector de jornada */}
                <div className="flex gap-2">
                    <button type="button" className={jornadaTabClass('manana')} onClick={() => setJornadaFilter('manana')}>
                        ☀️ Mañana
                    </button>
                    <button type="button" className={jornadaTabClass('tarde')} onClick={() => setJornadaFilter('tarde')}>
                        🌙 Tarde
                    </button>
                </div>
            </div>

            {/* Form agregar */}
            {showAdd && (
                <div className="flex flex-wrap items-end gap-3 p-4 bg-neutral-50 rounded-lg">
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-xs font-medium text-neutral-500 mb-1 block">Nombre</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Ej: Preescolar" className={inputClass + ' w-full'} />
                    </div>
                    <div className="w-24">
                        <label className="text-xs font-medium text-neutral-500 mb-1 block">Orden</label>
                        <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                            className={inputClass + ' w-full'} min={0} />
                    </div>
                    <div className="w-32">
                        <label className="text-xs font-medium text-neutral-500 mb-1 block">Jornada</label>
                        <select value={form.jornada} onChange={e => setForm(f => ({ ...f, jornada: e.target.value }))}
                            className={inputClass + ' w-full'}>
                            <option value="manana">Mañana</option>
                            <option value="tarde">Tarde</option>
                        </select>
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
                    {filteredGrades.map(grade => (
                        <div key={grade._id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
                            {editingId === grade._id ? (
                                <div className="flex flex-wrap items-center gap-3 flex-1">
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className={inputClass} />
                                    <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                                        className={inputClass + ' w-20'} min={0} />
                                    <select value={form.jornada} onChange={e => setForm(f => ({ ...f, jornada: e.target.value }))}
                                        className={inputClass}>
                                        <option value="manana">Mañana</option>
                                        <option value="tarde">Tarde</option>
                                    </select>
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
