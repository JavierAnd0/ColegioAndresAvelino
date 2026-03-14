'use client';
import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import BlogEditor from '@/components/organisms/BlogEditor';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import AlertMessage from '@/components/molecules/AlertMessage';
import Badge from '@/components/atoms/Badge';
import { blogService } from '@/services/blogService';

const statusTabs = [
    { key: 'all', label: 'Todos' },
    { key: 'publicado', label: 'Publicados' },
    { key: 'borrador', label: 'Borradores' },
    { key: 'archivado', label: 'Archivados' },
];

const statusVariant = {
    publicado: 'success',
    borrador: 'default',
    archivado: 'warning',
};

export default function AdminBlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [alert, setAlert] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [changingStatus, setChangingStatus] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = { limit: 50 };
            params.status = statusFilter;
            const data = await blogService.getAll(params);
            setPosts(data.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error cargando posts.' });
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handleCreate = async (formData) => {
        try {
            await blogService.create(formData);
            setAlert({ type: 'success', message: 'Post creado exitosamente.' });
            setShowForm(false);
            fetchPosts();
        } catch (err) {
            throw err;
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await blogService.update(editing._id, formData);
            setAlert({ type: 'success', message: 'Post actualizado.' });
            setEditing(null);
            setShowForm(false);
            fetchPosts();
        } catch (err) {
            throw err;
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este post permanentemente?')) return;
        setDeleting(id);
        try {
            await blogService.delete(id);
            setAlert({ type: 'success', message: 'Post eliminado.' });
            fetchPosts();
        } catch {
            setAlert({ type: 'error', message: 'Error al eliminar.' });
        } finally {
            setDeleting(null);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setChangingStatus(id);
        try {
            const result = await blogService.update(id, { status: newStatus });
            console.log('Status change result:', result);
            const labels = { publicado: 'publicado', borrador: 'movido a borrador', archivado: 'archivado' };
            setAlert({ type: 'success', message: `Post ${labels[newStatus]}.` });
            fetchPosts();
        } catch (err) {
            console.error('Status change error:', err);
            setAlert({ type: 'error', message: err?.message || 'Error al cambiar estado.' });
        } finally {
            setChangingStatus(null);
        }
    };

    const handleEdit = (post) => {
        setEditing(post);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <Heading level="h3">Gestión de Blog</Heading>
                        <Paragraph color="muted" className="mt-1">
                            {posts.length} publicaciones
                        </Paragraph>
                    </div>
                    {!showForm && (
                        <Button variant="primary" onClick={() => setShowForm(true)} className="self-start">
                            + Nuevo post
                        </Button>
                    )}
                </div>

                {alert && (
                    <AlertMessage type={alert.type} message={alert.message}
                        onClose={() => setAlert(null)} />
                )}

                {showForm && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-6">
                        <Heading level="h5" className="mb-5">
                            {editing ? 'Editar post' : 'Crear nuevo post'}
                        </Heading>
                        <BlogEditor
                            initialData={editing || {}}
                            onSubmit={editing ? handleUpdate : handleCreate}
                        />
                        <Button variant="ghost" size="sm" className="mt-3"
                            onClick={() => { setEditing(null); setShowForm(false); }}>
                            Cancelar
                        </Button>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                    {/* Status filter tabs */}
                    <div className="flex items-center gap-1 px-5 py-3 border-b border-neutral-100 overflow-x-auto">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => { setStatusFilter(tab.key); }}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                    statusFilter === tab.key
                                        ? 'bg-neutral-900 text-white'
                                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="flex flex-col items-center py-12 gap-2">
                            <Paragraph color="muted">
                                {statusFilter !== 'all'
                                    ? `No hay posts con estado "${statusFilter}".`
                                    : 'No hay posts aún.'}
                            </Paragraph>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {posts.map((post) => (
                                <div key={post._id}
                                    className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-4 hover:bg-neutral-50">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 truncate">
                                            {post.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <p className="text-xs text-neutral-500">
                                                {post.category}
                                                {post.publishedAt && (
                                                    <span className="ml-2">
                                                        {new Date(post.publishedAt).toLocaleDateString('es-CO')}
                                                    </span>
                                                )}
                                            </p>
                                            <Badge variant={statusVariant[post.status] || 'default'} size="sm">
                                                {post.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {/* Quick status actions */}
                                        <div className="flex items-center gap-1">
                                            {post.status !== 'publicado' && (
                                                <button title="Publicar" disabled={changingStatus === post._id}
                                                    onClick={() => handleStatusChange(post._id, 'publicado')}
                                                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors cursor-pointer disabled:opacity-30">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            )}
                                            {post.status !== 'borrador' && (
                                                <button title="Mover a borrador" disabled={changingStatus === post._id}
                                                    onClick={() => handleStatusChange(post._id, 'borrador')}
                                                    className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-30">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                            )}
                                            {post.status !== 'archivado' && (
                                                <button title="Archivar" disabled={changingStatus === post._id}
                                                    onClick={() => handleStatusChange(post._id, 'archivado')}
                                                    className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-30">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Edit / Delete */}
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                                            Editar
                                        </Button>
                                        <Button variant="danger" size="sm"
                                            loading={deleting === post._id}
                                            onClick={() => handleDelete(post._id)}>
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
