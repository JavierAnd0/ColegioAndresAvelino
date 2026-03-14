'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import EventForm from '@/components/organisms/EventForm';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import AlertMessage from '@/components/molecules/AlertMessage';
import Badge from '@/components/atoms/Badge';
import { eventService } from '@/services/eventService';

const categoryVariants = {
    academico: 'info', deportivo: 'success',
    cultural: 'warning', reunion: 'default',
    festivo: 'danger', otro: 'default',
};

export default function AdminEventosPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [alert, setAlert] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await eventService.getAll({ limit: 100 });
            setEvents(data.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error cargando eventos.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

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

    const formatDate = (date) => new Date(date).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <Heading level="h3">Gestión de Eventos</Heading>
                        <Paragraph color="muted" className="mt-1">
                            {events.length} eventos en total
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
                    <AlertMessage type={alert.type} message={alert.message}
                        onClose={() => setAlert(null)} />
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
                        <Button variant="ghost" size="sm"
                            onClick={() => { setEditing(null); setShowForm(false); }}
                            className="mt-3">
                            Cancelar
                        </Button>
                    </div>
                )}

                {/* Lista de eventos */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-100">
                        <Heading level="h6">Todos los eventos</Heading>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                    ) : events.length === 0 ? (
                        <div className="flex flex-col items-center py-12 gap-2">
                            <span className="text-4xl">📅</span>
                            <Paragraph color="muted">No hay eventos. ¡Crea el primero!</Paragraph>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {events.map((event) => (
                                <div key={event._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 hover:bg-neutral-50">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="h-9 w-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                            style={{ backgroundColor: event.color || '#171717' }}>
                                            {new Date(event.startDate).getDate()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-neutral-900 truncate">{event.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs text-neutral-500">{formatDate(event.startDate)}</p>
                                                <Badge variant={categoryVariants[event.category] || 'default'} size="sm">
                                                    {event.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-12 sm:ml-0">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                                            Editar
                                        </Button>
                                        <Button variant="danger" size="sm"
                                            loading={deleting === event._id}
                                            onClick={() => handleDelete(event._id)}>
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
