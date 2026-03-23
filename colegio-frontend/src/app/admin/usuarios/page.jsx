'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import AdminLayout from '@/components/templates/AdminLayout';
import Button from '@/components/atoms/Button';
import Heading from '@/components/atoms/Typography/Heading';
import AlertMessage from '@/components/molecules/AlertMessage';
import { LuPlus, LuKey, LuTrash2, LuToggleLeft, LuToggleRight, LuShield, LuUser } from 'react-icons/lu';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
    superadmin: { label: 'Super Admin', badge: 'bg-violet-100 text-violet-700', Icon: LuShield },
    admin:      { label: 'Admin',       badge: 'bg-blue-100 text-blue-700',    Icon: LuUser },
};

// ─── Modal crear usuario ───────────────────────────────────────────────────────

function CreateUserModal({ isSuperAdmin, onClose, onCreated }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.createUser(form);
            onCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear el usuario.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <Heading level="h4">Nuevo usuario</Heading>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-neutral-700">Nombre</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="Nombre completo"
                            required
                            className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-neutral-700">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                            placeholder="correo@colegio.edu.co"
                            required
                            className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-neutral-700">Contraseña inicial</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            placeholder="Mínimo 6 caracteres"
                            required
                            minLength={6}
                            className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-neutral-700">Rol</label>
                        <select
                            value={form.role}
                            onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                            className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                        >
                            <option value="admin">Admin</option>
                            {isSuperAdmin && <option value="superadmin">Super Admin</option>}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" size="sm" loading={loading} className="flex-1">
                            Crear usuario
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Modal resetear contraseña ─────────────────────────────────────────────────

function ResetPasswordModal({ targetUser, onClose, onSuccess }) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
        if (password.length < 6) { setError('Mínimo 6 caracteres.'); return; }
        setLoading(true);
        setError('');
        try {
            await authService.adminResetPassword(targetUser._id, password);
            onSuccess(`Contraseña de ${targetUser.name} actualizada.`);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al resetear la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <Heading level="h4">Resetear contraseña</Heading>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
                <p className="text-sm text-neutral-600">
                    Establece una nueva contraseña para <strong>{targetUser.name}</strong>.
                </p>

                {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Nueva contraseña"
                        required
                        className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <input
                        type="password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="Confirmar contraseña"
                        required
                        className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <div className="flex gap-3 pt-1">
                        <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button type="submit" variant="primary" size="sm" loading={loading} className="flex-1">Confirmar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Página principal ──────────────────────────────────────────────────────────

export default function UsuariosPage() {
    const { user: me, isSuperAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [resetTarget, setResetTarget] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadUsers = useCallback(async () => {
        try {
            const data = await authService.getUsers();
            setUsers(data.data || []);
        } catch {
            showToast('Error al cargar usuarios.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const toggleActive = async (targetUser) => {
        try {
            await authService.updateUser(targetUser._id, { isActive: !targetUser.isActive });
            setUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, isActive: !u.isActive } : u));
            showToast(`${targetUser.name} ${!targetUser.isActive ? 'activado' : 'desactivado'}.`);
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al actualizar.', 'error');
        }
    };

    const handleDelete = async (targetUser) => {
        try {
            await authService.deleteUser(targetUser._id);
            setUsers(prev => prev.filter(u => u._id !== targetUser._id));
            showToast(`${targetUser.name} eliminado.`);
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al eliminar.', 'error');
        } finally {
            setDeleteConfirm(null);
        }
    };

    // Determina si el usuario actual puede actuar sobre un target
    const canActOn = (target) => {
        if (target._id === me?._id) return false;
        const myLevel = me?.role === 'superadmin' ? 2 : 1;
        const targetLevel = target.role === 'superadmin' ? 2 : 1;
        return myLevel > targetLevel;
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Heading level="h2">Usuarios</Heading>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {/* Solo el superadmin puede crear usuarios */}
                    {isSuperAdmin && (
                        <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
                            <LuPlus className="w-4 h-4 mr-1.5" /> Nuevo usuario
                        </Button>
                    )}
                </div>

                {/* Toast */}
                {toast && (
                    <AlertMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />
                )}

                {/* Tabla */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-neutral-400 text-sm">
                            Cargando usuarios...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex items-center justify-center py-16 text-neutral-400 text-sm">
                            No hay usuarios registrados.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="text-left px-5 py-3 font-medium text-neutral-500">Usuario</th>
                                    <th className="text-left px-5 py-3 font-medium text-neutral-500 hidden sm:table-cell">Rol</th>
                                    <th className="text-left px-5 py-3 font-medium text-neutral-500 hidden md:table-cell">Estado</th>
                                    <th className="text-right px-5 py-3 font-medium text-neutral-500">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {users.map(u => {
                                    const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.admin;
                                    const isMe = u._id === me?._id;
                                    const canAct = canActOn(u);

                                    return (
                                        <tr key={u._id} className={`transition-colors ${isMe ? 'bg-neutral-50' : 'hover:bg-neutral-50/50'}`}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 flex-shrink-0">
                                                        {u.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-neutral-900 truncate">
                                                            {u.name}
                                                            {isMe && <span className="ml-2 text-xs text-neutral-400">(tú)</span>}
                                                        </p>
                                                        <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 hidden sm:table-cell">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${roleConf.badge}`}>
                                                    <roleConf.Icon className="w-3 h-3" />
                                                    {roleConf.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell">
                                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                                                    u.isActive
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-red-50 text-red-600'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                                                    {u.isActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {canAct && (
                                                        <>
                                                            <button
                                                                title="Resetear contraseña"
                                                                onClick={() => setResetTarget(u)}
                                                                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                                                            >
                                                                <LuKey className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                title={u.isActive ? 'Desactivar' : 'Activar'}
                                                                onClick={() => toggleActive(u)}
                                                                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                                                            >
                                                                {u.isActive
                                                                    ? <LuToggleRight className="w-4 h-4 text-emerald-500" />
                                                                    : <LuToggleLeft className="w-4 h-4" />
                                                                }
                                                            </button>
                                                            <button
                                                                title="Eliminar usuario"
                                                                onClick={() => setDeleteConfirm(u)}
                                                                className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <LuTrash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal crear — solo superadmin */}
            {showCreate && isSuperAdmin && (
                <CreateUserModal
                    isSuperAdmin={isSuperAdmin}
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { loadUsers(); showToast('Usuario creado exitosamente.'); }}
                />
            )}

            {/* Modal resetear contraseña */}
            {resetTarget && (
                <ResetPasswordModal
                    targetUser={resetTarget}
                    onClose={() => setResetTarget(null)}
                    onSuccess={(msg) => showToast(msg)}
                />
            )}

            {/* Confirmación eliminar */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4">
                        <Heading level="h4">Eliminar usuario</Heading>
                        <p className="text-sm text-neutral-600">
                            ¿Estás seguro de que quieres eliminar a <strong>{deleteConfirm.name}</strong>? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3 pt-1">
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)} className="flex-1">
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 !bg-red-600 hover:!bg-red-700"
                            >
                                Eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
