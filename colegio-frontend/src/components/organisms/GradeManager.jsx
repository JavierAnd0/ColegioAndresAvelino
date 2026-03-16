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
            setForm({ name: '', order: grades.length, jornada: jornadaFilter });
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
            setForm({ name: '', order: 0, jornada: 'manana' });
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

    const filteredGrades = grades.filter(g => (g.jornada || 'manana') === jornadaFilter);

    const inputClass = 'px-3 py-1.5 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900';

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
                            setForm({ name: '', order: filteredGrades.length, jornada: jornadaFilter });
                        }}>
                            + Nuevo grado
                        </Button>
                    )}
                </div>
            </div>

            {/* Jornada filter tabs */}
            <div className="flex gap-2">
                {[
                    { key: 'manana', label: 'Mañana', icon: '☀️' },
                    { key: 'tarde', label: 'Tarde', icon: '🌙' },
                ].map(j => (
                    <button
                        key={j.key}
                        type="button"
                        onClick={() => {
                            setJornadaFilter(j.key);
                            setShowAdd(false);
                            setEditingId(null);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                            jornadaFilter === j.key
                                ? 'bg-neutral-900 text-white shadow-md'
                                : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
                        }`}
                    >
                        {j.icon} {j.label}
                    </button>
                ))}
            </div>

            {/* Form agregar */}
            {showAdd && (
                <div className="flex items-end gap-3 p-4 bg-neutral-50 rounded-lg flex-wrap">
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-medium text-neutral-500 mb-1 block">Nombre</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Ej: Preescolar" className={inputClass + ' w-full'} />
                    </div>
                    <div className="w-24">
                        <label className="text-xs font-medium text-neutral-500 mb-1 block">Orden</label>
                        <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                            className={inputClass + ' w-full'} min={0} />
                    </div>
                    <div className="w-36">
                        <label className="text-xs font-medium text-neutral-500 mb-1 block">Jornada</label>
                        <select value={form.jornada} onChange={e => setForm(f => ({ ...f, jornada: e.target.value }))}
                            className={inputClass + ' w-full bg-white'}>
                            <option value="manana">☀️ Mañana</option>
                            <option value="tarde">🌙 Tarde</option>
                        </select>
                    </div>
                    <Button variant="primary" size="sm" onClick={handleAdd}>Guardar</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
                </div>
            )}

            {/* Lista */}
            {loading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
            ) : filteredGrades.length === 0 ? (
                <div className="text-center py-8">
                    <span className="text-4xl block mb-2">🎓</span>
                    <Paragraph color="muted">No hay grados en esta jornada. Usa "Cargar por defecto" o crea uno nuevo.</Paragraph>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden">
                    {filteredGrades.map(grade => (
                        <div key={grade._id} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
                            {editingId === grade._id ? (
                                <div className="flex items-center gap-3 flex-1 flex-wrap">
                                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className={inputClass} />
                                    <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                                        className={inputClass + ' w-20'} min={0} />
                                    <select value={form.jornada} onChange={e => setForm(f => ({ ...f, jornada: e.target.value }))}
                                        className={inputClass + ' bg-white'}>
                                        <option value="manana">☀️ Mañana</option>
                                        <option value="tarde">🌙 Tarde</option>
                                    </select>
                                    <Button variant="primary" size="sm" onClick={handleUpdate}>Guardar</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancelar</Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-neutral-400 w-6 text-center">{grade.order}</span>
                                        <span className="text-sm font-medium text-neutral-900">{grade.name}</span>
                                        <span className="text-xs text-neutral-400">
                                            {(grade.jornada || 'manana') === 'manana' ? '☀️' : '🌙'}
                                        </span>
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
