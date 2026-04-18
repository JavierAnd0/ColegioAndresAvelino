'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
    const [savedPost, setSavedPost] = useState(null);
    const [alert, setAlert] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [changingStatus, setChangingStatus] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    // DataTable state
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState('publishedAt');
    const [sortDir, setSortDir] = useState('desc');
    const [page, setPage] = useState(1);
    const perPage = 10;

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = { limit: 100, status: statusFilter };
            const data = await blogService.getAll(params);
            setPosts(data.data || []);
            setPage(1);
        } catch {
            setAlert({ type: 'error', message: 'Error cargando posts.' });
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    // Búsqueda y ordenamiento
    const processed = useMemo(() => {
        let data = [...posts];

        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(p =>
                p.title.toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q)
            );
        }

        data.sort((a, b) => {
            let valA = a[sortField] ?? '';
            let valB = b[sortField] ?? '';
            if (sortField === 'publishedAt') {
                valA = valA ? new Date(valA).getTime() : 0;
                valB = valB ? new Date(valB).getTime() : 0;
            } else {
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
            }
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [posts, search, sortField, sortDir]);

    const totalPages = Math.ceil(processed.length / perPage);
    const paginated = processed.slice((page - 1) * perPage, page * perPage);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('asc');
        }
        setPage(1);
    };

    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className="text-neutral-300 ml-1">↕</span>;
        return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    const handleCreate = async (formData) => {
        try {
            const res = await blogService.create(formData);
            setSavedPost(res.data);
            setAlert({ type: 'success', message: 'Post creado exitosamente.' });
            fetchPosts();
        } catch (err) {
            throw err;
        }
    };

    const handleUpdate = async (formData) => {
        try {
            const res = await blogService.update(editing._id, formData);
            setSavedPost(res.data);
            setAlert({ type: 'success', message: 'Post actualizado.' });
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
            await blogService.update(id, { status: newStatus });
            const labels = { publicado: 'publicado', borrador: 'movido a borrador', archivado: 'archivado' };
            setAlert({ type: 'success', message: `Post ${labels[newStatus]}.` });
            fetchPosts();
        } catch (err) {
            setAlert({ type: 'error', message: err?.message || 'Error al cambiar estado.' });
        } finally {
            setChangingStatus(null);
        }
    };

    const handleEdit = (post) => {
        setEditing(post);
        setSavedPost(null);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <Heading level="h3">Gestión de Blog</Heading>
                        <Paragraph color="muted" className="mt-1">
                            {processed.length} publicación{processed.length !== 1 ? 'es' : ''}
                        </Paragraph>
                    </div>
                    {!showForm && (
                        <Button variant="primary" onClick={() => { setSavedPost(null); setShowForm(true); }} className="self-start">
                            + Nuevo post
                        </Button>
                    )}
                </div>

                {alert && (
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                {/* Formulario */}
                {showForm && (
                    <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6">
                        <Heading level="h5" className="mb-5">
                            {editing ? 'Editar post' : 'Crear nuevo post'}
                        </Heading>
                        <BlogEditor
                            initialData={editing || {}}
                            onSubmit={editing ? handleUpdate : handleCreate}
                            savedPost={savedPost}
                        />
                        <Button variant="ghost" size="sm" className="mt-3"
                            onClick={() => { setEditing(null); setShowForm(false); setSavedPost(null); }}>
                            Cancelar
                        </Button>
                    </div>
                )}

                {/* DataTable */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">

                    {/* Pestañas de estado — móvil: pills compactos, desktop: tabs con underline */}
                    <div className="flex items-center gap-1 p-3 border-b border-neutral-100 overflow-x-auto md:px-4 md:pt-3 md:pb-0 md:gap-1">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => { setStatusFilter(tab.key); setSearch(''); }}
                                className={`
                                    px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap rounded-md
                                    md:px-3 md:py-2 md:text-sm md:rounded-none md:border-b-2 md:-mb-px
                                    ${statusFilter === tab.key
                                        ? 'bg-neutral-900 text-white md:bg-transparent md:text-neutral-900 md:border-neutral-900'
                                        : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 md:border-transparent md:hover:text-neutral-900 md:hover:border-neutral-300 md:hover:bg-transparent'
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Toolbar */}
                    <div className="p-4 border-b border-neutral-100">
                        <input
                            type="text"
                            placeholder="Buscar por título o categoría..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full sm:max-w-sm px-3 py-2 border border-neutral-200 rounded-lg text-sm
                                focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                        />
                    </div>

                    {/* Vista móvil — cards */}
                    <div className="md:hidden divide-y divide-neutral-100">
                        {loading ? (
                            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                        ) : paginated.length === 0 ? (
                            <div className="px-4 py-12 text-center text-neutral-500 text-sm">
                                {search ? 'No se encontraron resultados.' : `No hay posts${statusFilter !== 'all' ? ` con estado "${statusFilter}"` : ''}.`}
                            </div>
                        ) : paginated.map((post) => (
                            <div key={post._id} className="p-4 flex gap-3">
                                {/* Thumbnail */}
                                {post.featuredImage?.url ? (
                                    <img src={post.featuredImage.url} alt={post.title}
                                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                                ) : (
                                    <div className="w-14 h-14 rounded-lg bg-neutral-100 flex-shrink-0 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                    {/* Meta: estado + categoría + fecha */}
                                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[0.65rem] font-bold
                                            ${post.status === 'publicado' ? 'bg-green-100 text-green-700'
                                            : post.status === 'archivado' ? 'bg-amber-100 text-amber-700'
                                            : 'bg-neutral-100 text-neutral-500'}`}>
                                            {post.status}
                                        </span>
                                        {post.category && (
                                            <span className="text-xs text-neutral-400">{post.category}</span>
                                        )}
                                        {post.publishedAt && (
                                            <span className="text-xs text-neutral-400">
                                                {new Date(post.publishedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                                            </span>
                                        )}
                                    </div>

                                    <p className="font-medium text-neutral-900 text-sm leading-snug line-clamp-2">
                                        {post.title}
                                    </p>

                                    {/* Acciones */}
                                    <div className="flex items-center gap-2 mt-2.5">
                                        <select
                                            value={post.status}
                                            disabled={changingStatus === post._id}
                                            onChange={(e) => handleStatusChange(post._id, e.target.value)}
                                            className={`text-xs font-medium px-2 py-1.5 rounded-lg border cursor-pointer
                                                focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                ${post.status === 'publicado'
                                                    ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-400'
                                                    : post.status === 'archivado'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-400'
                                                    : 'bg-neutral-100 text-neutral-600 border-neutral-200 focus:ring-neutral-400'
                                                }`}
                                        >
                                            <option value="publicado">Publicado</option>
                                            <option value="borrador">Borrador</option>
                                            <option value="archivado">Archivado</option>
                                        </select>

                                        <div className="w-px h-4 bg-neutral-200 flex-shrink-0" />

                                        <button onClick={() => handleEdit(post)}
                                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                            title="Editar">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(post._id)}
                                            disabled={deleting === post._id}
                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                            title="Eliminar">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Vista desktop — tabla */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                        onClick={() => handleSort('title')}>
                                        Título <SortIcon field="title" />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                        onClick={() => handleSort('category')}>
                                        Categoría <SortIcon field="category" />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                        onClick={() => handleSort('status')}>
                                        Estado <SortIcon field="status" />
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-neutral-600 cursor-pointer select-none"
                                        onClick={() => handleSort('publishedAt')}>
                                        Fecha <SortIcon field="publishedAt" />
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
                                        <td colSpan={5} className="px-4 py-12 text-center text-neutral-500">
                                            {search ? 'No se encontraron resultados.' : `No hay posts${statusFilter !== 'all' ? ` con estado "${statusFilter}"` : ''}.`}
                                        </td>
                                    </tr>
                                ) : paginated.map((post) => (
                                    <tr key={post._id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {post.featuredImage?.url ? (
                                                    <img src={post.featuredImage.url} alt={post.title}
                                                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex-shrink-0 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <p className="font-medium text-neutral-900 truncate max-w-xs">{post.title}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600">
                                            {post.category || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={statusVariant[post.status] || 'default'} size="sm">
                                                {post.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500">
                                            {post.publishedAt
                                                ? new Date(post.publishedAt).toLocaleDateString('es-CO')
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <select
                                                    value={post.status}
                                                    disabled={changingStatus === post._id}
                                                    onChange={(e) => handleStatusChange(post._id, e.target.value)}
                                                    className={`text-xs font-medium px-2 py-1.5 rounded-lg border cursor-pointer
                                                        focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                        ${post.status === 'publicado'
                                                            ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-400'
                                                            : post.status === 'archivado'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-400'
                                                            : 'bg-neutral-100 text-neutral-600 border-neutral-200 focus:ring-neutral-400'
                                                        }`}
                                                >
                                                    <option value="publicado">Publicado</option>
                                                    <option value="borrador">Borrador</option>
                                                    <option value="archivado">Archivado</option>
                                                </select>
                                                <div className="w-px h-5 bg-neutral-200" />
                                                <button onClick={() => handleEdit(post)}
                                                    className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                                    title="Editar">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleDelete(post._id)}
                                                    disabled={deleting === post._id}
                                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                    title="Eliminar">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
