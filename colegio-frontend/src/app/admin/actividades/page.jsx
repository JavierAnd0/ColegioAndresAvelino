'use client';
import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
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

const VALID_TYPES = typeOptions.map((t) => t.value);

const gradeLabels = {
    0: 'Pre', 1: '1°', 2: '2°', 3: '3°', 4: '4°', 5: '5°',
    6: '6°', 7: '7°', 8: '8°', 9: '9°', 10: '10°', 11: '11°',
};

const statusConfig = {
    approved: { label: 'Aprobada', variant: 'success' },
    pending: { label: 'Pendiente', variant: 'warning' },
    rejected: { label: 'Rechazada', variant: 'danger' },
    draft: { label: 'Borrador', variant: 'default' },
};

// Tipos que soportan PDF adjunto
const FILE_TYPES = ['colorear', 'numeros', 'lectura', 'cuento', 'rompecabezas'];

// ─── CSV parser ────────────────────────────────────────────────────────────────
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { result.push(current); current = ''; }
        else { current += ch; }
    }
    result.push(current);
    return result;
}

function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
        return row;
    }).filter((row) => row.titulo || row.title);
}

function csvRowToActivity(row) {
    const title = row.titulo || row.title || '';
    const description = row.descripcion || row.description || '';
    const rawType = (row.tipo || row.type || 'otro').toLowerCase();
    const type = VALID_TYPES.includes(rawType) ? rawType : 'otro';
    const gradesStr = row.grados || row.grades || '';
    const targetGrades = gradesStr
        ? gradesStr.split(',').map((g) => parseInt(g.trim(), 10)).filter((n) => !isNaN(n))
        : [];
    const externalUrl = row.url_externa || row.url || '';
    return { title, description, type, targetGrades, externalUrl };
}

const CSV_TEMPLATE = `titulo,descripcion,tipo,grados,url_externa
El patito feo,Cuento clásico para niños,cuento,"0,1,2",
Suma del 1 al 10,Fichas de sumas básicas para primer grado,numeros,"1,2",
Colorear animales de la selva,Fichas para colorear con animales,colorear,"0,1",
Comprensión lectora básica,Texto corto con preguntas,lectura,"2,3",`;

// ─── Componente principal ──────────────────────────────────────────────────────
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
        targetGrades: [], externalUrl: '', imageUrl: '',
    });
    const [createFile, setCreateFile] = useState(null);
    const fileInputRef = useRef(null);

    // Buscador de imágenes en el formulario
    const [imgSuggestions, setImgSuggestions] = useState([]);
    const [loadingImgs, setLoadingImgs] = useState(false);

    // Importación CSV
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [csvRows, setCsvRows] = useState([]);
    const [importing, setImporting] = useState(false);
    const csvFileRef = useRef(null);

    // Fuentes RSS
    const [sources, setSources] = useState([]);
    const [loadingSources, setLoadingSources] = useState(true);
    const [showSourceForm, setShowSourceForm] = useState(false);
    const [editingSource, setEditingSource] = useState(null);
    const [sourceForm, setSourceForm] = useState({ name: '', url: '', defaultType: 'otro', defaultGrades: [], isActive: true });
    const [validating, setValidating] = useState(false);
    const [validateResult, setValidateResult] = useState(null);

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
        } finally { setLoadingActs(false); }
    };

    const loadPending = async () => {
        setLoadingPending(true);
        try {
            const res = await activityService.getPending({ limit: 100 });
            setPendingActivities(res.data || []);
        } catch { /* silenciar */ }
        finally { setLoadingPending(false); }
    };

    const loadSources = async () => {
        setLoadingSources(true);
        try {
            const res = await activityService.getSources();
            setSources(res.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error al cargar fuentes RSS' });
        } finally { setLoadingSources(false); }
    };

    // ── Fetch RSS ──
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
        } finally { setFetching(false); }
    };

    // ── Aprobar / Rechazar ──
    const handleApprove = async (id) => {
        try {
            await activityService.approve(id);
            setPendingActivities((prev) => prev.filter((a) => a._id !== id));
            setAlert({ type: 'success', message: 'Actividad aprobada' });
            await loadActivities();
        } catch { setAlert({ type: 'error', message: 'Error al aprobar' }); }
    };

    const handleReject = async (id) => {
        try {
            await activityService.reject(id);
            setPendingActivities((prev) => prev.filter((a) => a._id !== id));
            setAlert({ type: 'success', message: 'Actividad rechazada' });
        } catch { setAlert({ type: 'error', message: 'Error al rechazar' }); }
    };

    // ── Toggle / Delete ──
    const toggleActive = async (id, current) => {
        try {
            await activityService.update(id, { isActive: !current });
            setActivities((prev) => prev.map((a) => a._id === id ? { ...a, isActive: !current } : a));
        } catch { setAlert({ type: 'error', message: 'Error al actualizar actividad' }); }
    };

    const handleDeleteActivity = async (id) => {
        if (!confirm('¿Eliminar esta actividad?')) return;
        try {
            await activityService.delete(id);
            setActivities((prev) => prev.filter((a) => a._id !== id));
            setPendingActivities((prev) => prev.filter((a) => a._id !== id));
            setAlert({ type: 'success', message: 'Actividad eliminada' });
        } catch { setAlert({ type: 'error', message: 'Error al eliminar actividad' }); }
    };

    // ── Crear actividad manual ──
    const resetCreateForm = () => {
        setCreateForm({ title: '', description: '', content: '', type: 'otro', targetGrades: [], externalUrl: '', imageUrl: '' });
        setCreateFile(null);
        setImgSuggestions([]);
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

    const handleSearchImages = async () => {
        if (!createForm.title.trim() && !createForm.type) return;
        setLoadingImgs(true);
        setImgSuggestions([]);
        try {
            const res = await activityService.suggestImages({
                category: createForm.type,
                title: createForm.title,
                count: 6,
                context: 'activity',
            });
            setImgSuggestions(res.data || []);
            if ((res.data || []).length === 0) {
                setAlert({ type: 'info', message: 'No se encontraron imágenes. Intenta con otro título.' });
            }
        } catch {
            setAlert({ type: 'error', message: 'Error al buscar imágenes' });
        } finally { setLoadingImgs(false); }
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
            if (createForm.imageUrl) formData.append('imageUrl', createForm.imageUrl);
            createForm.targetGrades.forEach((g) => formData.append('targetGrades[]', g));
            if (createFile) formData.append('file', createFile);

            await activityService.create(formData);
            setAlert({ type: 'success', message: 'Actividad creada' });
            resetCreateForm();
            await loadActivities();
        } catch (err) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Error al crear actividad' });
        }
    };

    // ── Bulk Import (CSV o Excel) ──
    const handleCSVFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const isExcel = /\.(xlsx|xls)$/i.test(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (isExcel) {
                const workbook = XLSX.read(ev.target.result, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
                // Normalizar claves a minúsculas para que funcione csvRowToActivity
                const rows = json.map((row) => {
                    const normalized = {};
                    for (const k of Object.keys(row)) normalized[k.toLowerCase().trim()] = String(row[k]);
                    return csvRowToActivity(normalized);
                }).filter((r) => r.title);
                setCsvRows(rows);
            } else {
                const rows = parseCSV(ev.target.result).map(csvRowToActivity);
                setCsvRows(rows);
            }
        };
        if (isExcel) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file, 'UTF-8');
        }
    };

    const handleBulkImport = async () => {
        if (csvRows.length === 0) return;
        setImporting(true);
        try {
            const res = await activityService.bulkCreate(csvRows);
            const { created, errors } = res.data;
            setAlert({
                type: errors.length > 0 ? 'warning' : 'success',
                message: `Importadas ${created} actividad(es)${errors.length > 0 ? `. Errores: ${errors.join(' | ')}` : ''}`,
            });
            setCsvRows([]);
            setShowBulkImport(false);
            if (csvFileRef.current) csvFileRef.current.value = '';
            await loadActivities();
        } catch {
            setAlert({ type: 'error', message: 'Error al importar actividades' });
        } finally { setImporting(false); }
    };

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'plantilla_actividades_docente.csv';
        a.click();
    };

    // ── Fuentes RSS ──
    const resetSourceForm = () => {
        setSourceForm({ name: '', url: '', defaultType: 'otro', defaultGrades: [], isActive: true });
        setEditingSource(null);
        setShowSourceForm(false);
        setValidateResult(null);
    };

    const handleEditSource = (source) => {
        setSourceForm({ name: source.name, url: source.url, defaultType: source.defaultType, defaultGrades: source.defaultGrades || [], isActive: source.isActive });
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
            setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar fuente' });
        }
    };

    const handleDeleteSource = async (id) => {
        if (!confirm('¿Eliminar esta fuente RSS?')) return;
        try {
            await activityService.deleteSource(id);
            setSources((prev) => prev.filter((s) => s._id !== id));
            setAlert({ type: 'success', message: 'Fuente eliminada' });
        } catch { setAlert({ type: 'error', message: 'Error al eliminar fuente' }); }
    };

    const toggleSourceGrade = (order) => {
        setSourceForm((prev) => ({
            ...prev,
            defaultGrades: prev.defaultGrades.includes(order)
                ? prev.defaultGrades.filter((g) => g !== order)
                : [...prev.defaultGrades, order],
        }));
    };

    const handleValidateUrl = async () => {
        if (!sourceForm.url.trim()) return;
        setValidating(true);
        setValidateResult(null);
        try {
            const res = await activityService.validateSource(sourceForm.url.trim());
            setValidateResult(res.data);
        } catch {
            setValidateResult({ valid: false, error: 'No se pudo conectar al servidor' });
        } finally { setValidating(false); }
    };

    const showContentField = createForm.type === 'cuento' || createForm.type === 'lectura';
    const showFileField = FILE_TYPES.includes(createForm.type);

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <Heading level="h1">Actividades Educativas</Heading>
                    <div className="flex gap-2 flex-wrap">
                        <Button onClick={() => { resetCreateForm(); setShowCreateForm(true); setShowBulkImport(false); }} variant="primary" size="sm">
                            + Nueva actividad
                        </Button>
                        <Button onClick={() => { setShowBulkImport((v) => !v); setShowCreateForm(false); }} variant="outline" size="sm">
                            Importar CSV
                        </Button>
                        <Button onClick={handleFetch} disabled={fetching} variant="outline" size="sm">
                            {fetching ? 'Actualizando...' : 'Actualizar RSS'}
                        </Button>
                    </div>
                </div>

                {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

                {/* ── Importación CSV ── */}
                {showBulkImport && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <Heading level="h3">Importar actividades desde CSV</Heading>
                            <button type="button" onClick={downloadTemplate}
                                className="text-xs text-blue-600 hover:underline cursor-pointer">
                                Descargar plantilla
                            </button>
                        </div>

                        <p className="text-sm text-neutral-500">
                            El archivo debe tener las columnas: <code className="bg-neutral-100 px-1 rounded text-xs">titulo, descripcion, tipo, grados, url_externa</code>.
                            Los grados van separados por coma: <code className="bg-neutral-100 px-1 rounded text-xs">1,2,3</code>.
                            Tipos válidos: {VALID_TYPES.join(', ')}.
                        </p>

                        <input ref={csvFileRef} type="file" accept=".csv,.xlsx,.xls,text/csv"
                            onChange={handleCSVFile}
                            className="text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0 file:text-sm file:font-medium
                                file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 file:cursor-pointer" />

                        {csvRows.length > 0 && (
                            <>
                                <div className="overflow-x-auto rounded-lg border border-neutral-200">
                                    <table className="w-full text-xs">
                                        <thead className="bg-neutral-50 border-b border-neutral-200">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium text-neutral-600">Título</th>
                                                <th className="px-3 py-2 text-left font-medium text-neutral-600">Tipo</th>
                                                <th className="px-3 py-2 text-left font-medium text-neutral-600">Grados</th>
                                                <th className="px-3 py-2 text-left font-medium text-neutral-600">URL</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {csvRows.map((row, i) => (
                                                <tr key={i} className="hover:bg-neutral-50">
                                                    <td className="px-3 py-2 text-neutral-900 max-w-xs truncate">{row.title}</td>
                                                    <td className="px-3 py-2">
                                                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                                                            {typeOptions.find((t) => t.value === row.type)?.label || row.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-neutral-500">
                                                        {row.targetGrades.map((g) => gradeLabels[g] || g).join(', ') || '—'}
                                                    </td>
                                                    <td className="px-3 py-2 text-neutral-400 max-w-xs truncate">{row.externalUrl || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button type="button" variant="primary" size="sm" loading={importing} onClick={handleBulkImport}>
                                        Importar {csvRows.length} actividad(es)
                                    </Button>
                                    <Button type="button" variant="outline" size="sm"
                                        onClick={() => { setCsvRows([]); if (csvFileRef.current) csvFileRef.current.value = ''; }}>
                                        Limpiar
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── Formulario crear actividad ── */}
                {showCreateForm && (
                    <form onSubmit={handleCreateSubmit} className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 space-y-4">
                        <Heading level="h3">Nueva Actividad</Heading>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField label="Título" value={createForm.title} required maxLength={200}
                                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="Título de la actividad" />
                            <SelectField label="Tipo" value={createForm.type}
                                onChange={(e) => setCreateForm((f) => ({ ...f, type: e.target.value }))}
                                options={typeOptions} />
                        </div>

                        <FormField label="Descripción" value={createForm.description} maxLength={500}
                            onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="Descripción breve" />

                        {/* Buscador de imágenes */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-neutral-700">Imagen</label>

                            {createForm.imageUrl ? (
                                <div className="flex items-center gap-3">
                                    <img src={createForm.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover border border-neutral-200" />
                                    <button type="button" onClick={() => { setCreateForm((f) => ({ ...f, imageUrl: '' })); setImgSuggestions([]); }}
                                        className="text-xs text-red-500 hover:underline cursor-pointer">
                                        Quitar imagen
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button type="button" onClick={handleSearchImages}
                                        disabled={loadingImgs || (!createForm.title.trim())}
                                        className="self-start inline-flex items-center gap-2 px-3 py-2 text-sm text-neutral-600
                                            bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100
                                            transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                                        {loadingImgs ? (
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M7.76 7.76L4.93 4.93" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        )}
                                        {loadingImgs ? 'Buscando...' : 'Buscar imagen automáticamente'}
                                    </button>

                                    {imgSuggestions.length > 0 && (
                                        <div>
                                            <p className="text-xs text-neutral-500 mb-2">Selecciona una imagen:</p>
                                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                                {imgSuggestions.map((img, i) => (
                                                    <button key={i} type="button"
                                                        onClick={() => { setCreateForm((f) => ({ ...f, imageUrl: img.url })); setImgSuggestions([]); }}
                                                        className="relative group rounded-lg overflow-hidden border-2 border-transparent
                                                            hover:border-neutral-900 transition-all cursor-pointer aspect-square">
                                                        <img src={img.thumbnailUrl || img.url} alt={img.alt || ''}
                                                            className="w-full h-full object-cover" loading="lazy" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors
                                                            flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Contenido para cuentos/lectura */}
                        {showContentField && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Contenido del {createForm.type === 'cuento' ? 'cuento' : 'texto de lectura'}
                                </label>
                                <textarea value={createForm.content}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, content: e.target.value }))}
                                    placeholder={`Escribe aquí el ${createForm.type === 'cuento' ? 'cuento' : 'texto'}...`}
                                    rows={8} maxLength={5000}
                                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm
                                        focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400
                                        placeholder:text-neutral-400 resize-y" />
                                <p className="text-xs text-neutral-400 mt-1">{createForm.content.length}/5000</p>
                            </div>
                        )}

                        {/* PDF para tipos que lo soportan */}
                        {showFileField && (
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Archivo PDF adjunto
                                    <span className="ml-1 text-xs text-neutral-400 font-normal">(opcional)</span>
                                </label>
                                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={(e) => setCreateFile(e.target.files[0] || null)}
                                    className="w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4
                                        file:rounded-lg file:border-0 file:text-sm file:font-medium
                                        file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 file:cursor-pointer" />
                                {createFile && <p className="text-xs text-neutral-400 mt-1">{createFile.name}</p>}
                            </div>
                        )}

                        <FormField label="URL externa (opcional)" value={createForm.externalUrl}
                            onChange={(e) => setCreateForm((f) => ({ ...f, externalUrl: e.target.value }))}
                            placeholder="https://ejemplo.com/recurso" />

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Grados</label>
                            <div className="flex flex-wrap gap-2">
                                {grades.map((g) => (
                                    <button key={g._id} type="button" onClick={() => toggleCreateGrade(g.order)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                                            ${createForm.targetGrades.includes(g.order)
                                                ? 'bg-neutral-900 text-white'
                                                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                                        {gradeLabels[g.order] ?? g.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2 border-t border-neutral-100">
                            <Button type="submit" variant="primary" size="sm">Crear actividad</Button>
                            <Button type="button" variant="outline" size="sm" onClick={resetCreateForm}>Cancelar</Button>
                        </div>
                    </form>
                )}

                {/* ── Tabs ── */}
                <div className="flex gap-1 mb-6 bg-neutral-100 rounded-lg p-1 w-full sm:w-fit overflow-x-auto">
                    {[
                        { key: 'actividades', label: `Aprobadas (${activities.length})` },
                        { key: 'pendientes', label: `Pendientes (${pendingActivities.length})` },
                        { key: 'fuentes', label: `RSS (${sources.length})` },
                    ].map((t) => (
                        <button key={t.key} type="button" onClick={() => setTab(t.key)}
                            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex-1 sm:flex-none
                                ${tab === t.key ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Aprobadas ── */}
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
                                    <ActivityRow key={act._id} activity={act}
                                        onToggleActive={() => toggleActive(act._id, act.isActive)}
                                        onDelete={() => handleDeleteActivity(act._id)} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab: Pendientes ── */}
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
                                                {act.imageUrl
                                                    ? <img src={act.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    : <PlaceholderIcon />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 truncate">{act.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <Badge variant="warning" size="sm">Pendiente</Badge>
                                                    <Badge variant="info" size="sm">
                                                        {typeOptions.find((t) => t.value === act.type)?.label || act.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 ml-13 sm:ml-0">
                                            <button type="button" onClick={() => handleApprove(act._id)}
                                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer">
                                                Aprobar
                                            </button>
                                            <button type="button" onClick={() => handleReject(act._id)}
                                                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors cursor-pointer">
                                                Rechazar
                                            </button>
                                            {act.externalUrl && <ExternalLink href={act.externalUrl} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Tab: Fuentes RSS ── */}
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

                                <FormField label="Nombre" value={sourceForm.name} required
                                    onChange={(e) => setSourceForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Ej: Cuentos Infantiles" />

                                <div className="flex flex-col gap-1.5">
                                    <label className="block text-sm font-medium text-neutral-700">URL del feed RSS</label>
                                    <div className="flex gap-2">
                                        <input type="url" value={sourceForm.url} required
                                            onChange={(e) => { setSourceForm((f) => ({ ...f, url: e.target.value })); setValidateResult(null); }}
                                            placeholder="https://ejemplo.com/feed"
                                            className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm
                                                focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent" />
                                        <button type="button" onClick={handleValidateUrl}
                                            disabled={validating || !sourceForm.url.trim()}
                                            className="px-3 py-2 text-sm font-medium bg-neutral-100 text-neutral-700 rounded-lg
                                                hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                                            {validating ? 'Probando...' : 'Probar URL'}
                                        </button>
                                    </div>
                                    {validateResult && (
                                        <div className={`rounded-lg p-3 text-sm ${validateResult.valid ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                                            {validateResult.valid ? (
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-medium">✓ Feed válido — {validateResult.itemCount} artículo(s){validateResult.feedTitle && ` · "${validateResult.feedTitle}"`}</p>
                                                    {validateResult.sampleItems.length > 0 && (
                                                        <ul className="text-xs text-green-700 mt-1 space-y-0.5 list-disc list-inside">
                                                            {validateResult.sampleItems.map((t, i) => <li key={i} className="truncate">{t}</li>)}
                                                        </ul>
                                                    )}
                                                </div>
                                            ) : (
                                                <p>✗ {validateResult.error}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <SelectField label="Tipo por defecto" value={sourceForm.defaultType}
                                        onChange={(e) => setSourceForm((f) => ({ ...f, defaultType: e.target.value }))}
                                        options={typeOptions} />
                                    <div className="flex flex-col justify-end">
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input type="checkbox" checked={sourceForm.isActive}
                                                onChange={(e) => setSourceForm((f) => ({ ...f, isActive: e.target.checked }))}
                                                className="w-4 h-4 rounded border-neutral-300 accent-neutral-900 cursor-pointer" />
                                            <span className="text-sm font-medium text-neutral-700">Fuente activa</span>
                                        </label>
                                        <p className="text-xs text-neutral-400 mt-1">Solo las fuentes activas se procesan automáticamente</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Grados por defecto</label>
                                    <p className="text-xs text-neutral-400 mb-2">El sistema también detecta el tipo automáticamente por palabras clave</p>
                                    <div className="flex flex-wrap gap-2">
                                        {grades.map((g) => (
                                            <button key={g._id} type="button" onClick={() => toggleSourceGrade(g.order)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer
                                                    ${sourceForm.defaultGrades.includes(g.order) ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                                                {gradeLabels[g.order] ?? g.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2 border-t border-neutral-100">
                                    <Button type="submit" variant="primary" size="sm">{editingSource ? 'Actualizar' : 'Crear fuente'}</Button>
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
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <Badge variant={src.isActive ? 'success' : 'default'} size="sm">
                                                    {src.isActive ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                                <Badge variant="info" size="sm">
                                                    {typeOptions.find((t) => t.value === src.defaultType)?.label || src.defaultType}
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

// ─── Subcomponentes ────────────────────────────────────────────────────────────

function PlaceholderIcon() {
    return (
        <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        </div>
    );
}

function ExternalLink({ href }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" title="Ver recurso"
            className="p-1.5 rounded text-neutral-300 hover:text-blue-500 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
    );
}

function ActivityRow({ activity: act, onToggleActive, onDelete }) {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colors
            ${act.isActive ? 'bg-white border-neutral-200' : 'bg-neutral-50 border-neutral-100 opacity-60'}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                    {act.imageUrl ? <img src={act.imageUrl} alt="" className="w-full h-full object-cover" /> : <PlaceholderIcon />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{act.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <Badge variant={statusConfig[act.status]?.variant || 'default'} size="sm">
                            {statusConfig[act.status]?.label || act.status}
                        </Badge>
                        <Badge variant="info" size="sm">
                            {typeOptions.find((t) => t.value === act.type)?.label || act.type}
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
                        {act.isActive
                            ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            : <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        }
                    </svg>
                </button>
                <button type="button" onClick={onDelete} title="Eliminar"
                    className="p-1.5 rounded text-neutral-300 hover:text-red-500 cursor-pointer transition-colors">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                {(act.externalUrl || act.fileUrl) && <ExternalLink href={act.fileUrl || act.externalUrl} />}
            </div>
        </div>
    );
}
