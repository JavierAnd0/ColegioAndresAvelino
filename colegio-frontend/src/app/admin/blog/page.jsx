'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import BlogEditor from '@/components/organisms/BlogEditor';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import AlertMessage from '@/components/molecules/AlertMessage';
import Badge from '@/components/atoms/Badge';
import { blogService } from '@/services/blogService';

export default function AdminBlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [alert, setAlert] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await blogService.getAll({ limit: 50 });
            setPosts(data.data || []);
        } catch {
            setAlert({ type: 'error', message: 'Error cargando posts.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleCreate = async (formData) => {
        await blogService.create(formData);
        setAlert({ type: 'success', message: 'Post creado exitosamente.' });
        setShowForm(false);
        fetchPosts();
    };

    const handleUpdate = async (formData) => {
        await blogService.update(editing._id, formData);
        setAlert({ type: 'success', message: 'Post actualizado.' });
        setEditing(null);
        setShowForm(false);
        fetchPosts();
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este post?')) return;
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

    const handleEdit = (post) => {
        setEditing(post);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const statusVariant = {
        publicado: 'success',
        borrador: 'default',
        archivado: 'warning',
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">

                <div className="flex items-center justify-between">
                    <div>
                        <Heading level="h3">Gestión de Blog</Heading>
                        <Paragraph color="muted" className="mt-1">
                            {posts.length} publicaciones en total
                        </Paragraph>
                    </div>
                    {!showForm && (
                        <Button variant="primary" onClick={() => setShowForm(true)}>
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
                    <div className="px-5 py-4 border-b border-neutral-100">
                        <Heading level="h6">Todas las publicaciones</Heading>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="flex flex-col items-center py-12 gap-2">
                            <span className="text-4xl">📝</span>
                            <Paragraph color="muted">No hay posts aún. ¡Crea el primero!</Paragraph>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {posts.map((post) => (
                                <div key={post._id}
                                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-neutral-900 truncate">
                                            {post.title}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {post.category}
                                        </p>
                                    </div>
                                    <Badge variant={statusVariant[post.status] || 'default'} size="sm">
                                        {post.status}
                                    </Badge>
                                    <div className="flex items-center gap-2 flex-shrink-0">
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
