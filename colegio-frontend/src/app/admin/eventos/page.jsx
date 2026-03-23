'use client';
import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import EventForm from '@/components/organisms/EventForm';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import AlertMessage from '@/components/molecules/AlertMessage';
import { eventService } from '@/services/eventService';
import { LuCalendar } from 'react-icons/lu';

// ─── Constantes ───────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const CATEGORY_VARIANTS = {
    academico: 'info',
    deportivo: 'success',
    cultural:  'warning',
    reunion:   'default',
    festivo:   'danger',
    otro:      'default',
};

const CATEGORY_OPTIONS = [
    { value: '',          label: 'Todas las categorías' },
    { value: 'academico', label: 'Académico' },
    { value: 'deportivo', label: 'Deportivo' },
    { value: 'cultural',  label: 'Cultural' },
    { value: 'reunion',   label: 'Reunión' },
    { value: 'festivo',   label: 'Festivo' },
    { value: 'otro',      label: 'Otro' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SortIcon({ field, sortField, sortDir }) {
    if (sortField !== field) return <span className="text-neutral-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

function StatusPill({ isPast }) {
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
            isPast ? 'bg-neutral-100 text-neutral-500' : 'bg-green-100 text-green-700'
        }`}>
            {isPast ? 'Pasado' : 'Próximo'}
        </span>
    );
}

function EditIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    );
}

function DeleteIcon() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminEventosPage() {
    const [events,   setEvents]   = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing,  setEditing]  = useState(null);
    const [alert,    setAlert]    = useState(null);
    const [deleting, setDeleting] = useState(null);

    // DataTable state
    const [search,    setSearch]    = useState('');
    const [category,  setCategory]  = useState('');
    const [sortField, setSortField] = useState('startDate');
    const [sortDir,   setSortDir]   = useState('asc');
    const [page,      setPage]      = useState(1);

    // ─── Fetch ────────────────────────────────────────────────────────────────

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await eventService.getAll({ limit: 500 });
            setEvents(data.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error cargando eventos.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    // ─── Procesamiento (filtro → búsqueda → orden) ────────────────────────────

    const processed = useMemo(() => {
        let data = [...events];

        if (category) {
            data = data.filter(e => e.category === category);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(e =>
                e.title?.toLowerCase().includes(q) ||
                e.description?.toLowerCase().includes(q)
            );
        }

        data.sort((a, b) => {
            let valA = a[sortField] ?? '';
            let valB = b[sortField] ?? '';
            if (sortField === 'startDate') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            } else {
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
            }
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [events, category, search, sortField, sortDir]);

    const totalPages = Math.ceil(processed.length / PER_PAGE);
    const paginated  = processed.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
        setPage(1);
    };

    const handleCreate = async (formData) => {
        await eventService.create(formData);
        setAlert({ type: 'success', message: 'Evento creado exitosamente.' });
        setShowForm(false);
        fetchEvents();
    };

    const handleUpdate = async (formData) => {
        await eventService.update(editing._id, formData);
        setAlert({ type: 'success', message: 'Evento actualizado exitosamente.' });
        setEditing(null);
        setShowForm(false);
        fetchEvents();
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este evento?')) return;
        setDeleting(id);
        try {
            await eventService.delete(id);
            setAlert({ type: 'success', message: 'Evento eliminado.' });
            fetchEvents();
        } catch {
            setAlert({ type: 'error', message: 'Error al eliminar el evento.' });
        } finally {
            setDeleting(null);
        }
    };

    const handleEdit = (event) => {
        setEditing(event);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const now = new Date();

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <Heading level="h3">Gestión de Eventos</Heading>
                        <Paragraph color="muted" className="mt-1">
                            {processed.length} de {events.length} eventos
                        </Paragraph>
                    </div>
                    {!showForm && (
                        <Button variant="primary" onClick={() => setShowForm(true)} className="self-start">
                            + Nuevo evento
                        </Button>
                    )}
                </div>

                {/* Alerta */}
                {alert && (
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {/* Formulario */}
                {showForm && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-6">
                        <Heading level="h5" className="mb-5">
                            {editing ? 'Editar evento' : 'Crear nuevo evento'}
                        </Heading>
                        <EventForm
                            initialData={editing || {}}
                            onSubmit={editing ? handleUpdate : handleCreate}
                        />
                        <Button variant="ghost" size="sm" className="mt-3"
                            onClick={() => { setEditing(null); setShowForm(false); }}>
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
                            placeholder="Buscar por título..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm flex-1
                                focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                        />
                        <select
                            value={category}
                            onChange={e => { setCategory(e.target.value); setPage(1); }}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white
                                focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                            {CATEGORY_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Vista móvil — cards */}
                    <div className="md:hidden divide-y divide-neutral-100">
                        {loading ? (
                            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                        ) : paginated.length === 0 ? (
                            <div className="px-4 py-12 text-center flex flex-col items-center gap-2 text-neutral-400">
                                <LuCalendar className="w-8 h-8" />
                                <p className="text-sm">
                                    {events.length === 0 ? 'No hay eventos. ¡Crea el primero!' : 'Sin resultados para esta búsqueda.'}
                                </p>
                            </div>
                        ) : paginated.map((event) => {
                            const isPast = new Date(event.startDate) < now;
                            return (
                                <div key={event._id} className={`p-4 flex gap-3 ${isPast ? 'opacity-60' : ''}`}>
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white"
                                        style={{ backgroundColor: event.color || '#171717' }}>
                                        <span className="text-base font-black leading-none">
                                            {new Date(event.startDate).getDate()}
                                        </span>
                                        <span className="text-[0.55rem] uppercase font-bold tracking-wider opacity-80">
                                            {new Date(event.startDate).toLocaleDateString('es-CO', { month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-neutral-900 text-sm leading-snug">{event.title}</p>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <Badge variant={CATEGORY_VARIANTS[event.category] || 'default'} size="sm">
                                                {event.category}
                                            </Badge>
                                            <StatusPill isPast={isPast} />
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <button onClick={() => handleEdit(event)}
                                                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                                title="Editar">
                                                <EditIcon />
                                            </button>
                                            <button onClick={() => handleDelete(event._id)}
                                                disabled={deleting === event._id}
                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                title="Eliminar">
                                                <DeleteIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Vista desktop — tabla */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                        onClick={() => handleSort('title')}>
                                        Evento <SortIcon field="title" sortField={sortField} sortDir={sortDir} />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                        onClick={() => handleSort('startDate')}>
                                        Fecha <SortIcon field="startDate" sortField={sortField} sortDir={sortDir} />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none hidden sm:table-cell"
                                        onClick={() => handleSort('category')}>
                                        Categoría <SortIcon field="category" sortField={sortField} sortDir={sortDir} />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-neutral-600">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">
                                            <div className="flex justify-center"><Spinner size="lg" /></div>
                                        </td>
                                    </tr>
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2 text-neutral-400">
                                                <LuCalendar className="w-8 h-8" />
                                                <p className="text-sm">
                                                    {events.length === 0
                                                        ? 'No hay eventos. ¡Crea el primero!'
                                                        : 'Sin resultados para esta búsqueda.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginated.map((event) => {
                                    const isPast = new Date(event.startDate) < now;
                                    return (
                                        <tr key={event._id}
                                            className={`hover:bg-neutral-50 transition-colors ${isPast ? 'opacity-60' : ''}`}>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                                        style={{ backgroundColor: event.color || '#171717' }}>
                                                        {new Date(event.startDate).getDate()}
                                                    </div>
                                                    <p className="font-medium text-neutral-900 truncate max-w-[200px]">
                                                        {event.title}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">
                                                {formatDate(event.startDate)}
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <Badge variant={CATEGORY_VARIANTS[event.category] || 'default'} size="sm">
                                                    {event.category}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusPill isPast={isPast} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(event)}
                                                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                                        title="Editar">
                                                        <EditIcon />
                                                    </button>
                                                    <button onClick={() => handleDelete(event._id)}
                                                        disabled={deleting === event._id}
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                        title="Eliminar">
                                                        <DeleteIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {!loading && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
                            <p className="text-xs text-neutral-500">
                                {processed.length} resultado{processed.length !== 1 ? 's' : ''}
                                {totalPages > 1 && ` · Página ${page} de ${totalPages}`}
                            </p>
                            {totalPages > 1 && (
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-2.5 py-1 text-xs rounded-md border border-neutral-200 hover:bg-neutral-50
                                            disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-2.5 py-1 text-xs rounded-md border border-neutral-200 hover:bg-neutral-50
                                            disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
