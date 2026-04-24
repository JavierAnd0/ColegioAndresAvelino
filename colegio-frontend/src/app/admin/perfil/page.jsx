'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import AlertMessage from '@/components/molecules/AlertMessage';
import Spinner from '@/components/atoms/Spinner';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { safeImageUrl } from '@/lib/safeImageUrl';
import Link from 'next/link';
import { LuEye, LuEyeOff, LuCamera, LuCheck } from 'react-icons/lu';
import usePasteImage from '@/hooks/usePasteImage';

const ROLE_LABELS = {
    superadmin: 'Super Admin',
    admin: 'Docente',
};

const getInitials = (name = '') =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');

const PASSWORD_REQS = [
    { label: 'Mínimo 6 caracteres',          test: p => p.length >= 6 },
    { label: 'Al menos una letra',            test: p => /[a-zA-Z]/.test(p) },
    { label: 'Al menos un número o símbolo',  test: p => /[0-9!@#$%^&*()\-_=+,.?":{}|<>]/.test(p) },
];

export default function PerfilPage() {
    const auth = useAuth();

    const [activeTab, setActiveTab]         = useState('account');
    const [profileForm, setProfileForm]     = useState({ name: '', email: '', bio: '', avatar: '' });
    const [originalProfile, setOriginalProfile] = useState({});
    const [passwordForm, setPasswordForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPass, setShowPass]           = useState({ current: false, new: false, confirm: false });
    const [loading, setLoading]             = useState(true);
    const [saving, setSaving]               = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [alert, setAlert]                 = useState(null);

    const fileInputRef = useRef(null);

    // ── Load profile ────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const res = await authService.getMe();
                const u = res.data;
                const profile = {
                    name:   u.name   || '',
                    email:  u.email  || '',
                    bio:    u.bio    || '',
                    avatar: u.avatar || '',
                };
                setProfileForm(profile);
                setOriginalProfile(profile);
            } catch {
                setAlert({ type: 'error', message: 'No se pudo cargar el perfil.' });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ── Avatar upload ────────────────────────────────────────────────────────
    const handleAvatarFile = useCallback(async (file) => {
        if (!file) return;
        setAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await api.post('/upload/avatar', formData);
            const url = res.data?.data?.url;
            if (url) setProfileForm(p => ({ ...p, avatar: url }));
        } catch {
            setAlert({ type: 'error', message: 'Error al subir la imagen.' });
        } finally {
            setAvatarUploading(false);
        }
    }, []);

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleAvatarFile(file);
            e.target.value = '';
        }
    };

    // Paste avatar from clipboard (only on the account tab)
    usePasteImage(useCallback((file) => {
        if (!avatarUploading && activeTab === 'account') handleAvatarFile(file);
    }, [avatarUploading, activeTab, handleAvatarFile]));

    // ── Profile form ─────────────────────────────────────────────────────────
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileForm(p => ({ ...p, [name]: value }));
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!profileForm.name.trim()) {
            setAlert({ type: 'error', message: 'El nombre es obligatorio.' });
            return;
        }
        setSaving(true);
        try {
            const res = await authService.updateProfile({
                name:   profileForm.name.trim(),
                email:  profileForm.email.trim(),
                bio:    profileForm.bio.trim(),
                avatar: profileForm.avatar,
            });
            const updated = res.data;
            const next = {
                name:   updated.name   || '',
                email:  updated.email  || '',
                bio:    updated.bio    || '',
                avatar: updated.avatar || '',
            };
            setProfileForm(next);
            setOriginalProfile(next);
            // Sync AuthContext so the sidebar name/avatar stay current
            if (auth.user) {
                auth.setSession({ token: localStorage.getItem('token'), user: { ...auth.user, ...next } });
            }
            setAlert({ type: 'success', message: 'Perfil actualizado correctamente.' });
        } catch (err) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Error al guardar el perfil.' });
        } finally {
            setSaving(false);
        }
    };

    const handleProfileReset = () => {
        setProfileForm(originalProfile);
        setAlert(null);
    };

    // ── Password form ─────────────────────────────────────────────────────────
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(p => ({ ...p, [name]: value }));
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setAlert({ type: 'error', message: 'Completa todos los campos de contraseña.' });
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setAlert({ type: 'error', message: 'La nueva contraseña y la confirmación no coinciden.' });
            return;
        }
        const allMet = PASSWORD_REQS.every(r => r.test(passwordForm.newPassword));
        if (!allMet) {
            setAlert({ type: 'error', message: 'La nueva contraseña no cumple los requisitos.' });
            return;
        }
        setSaving(true);
        try {
            const res = await authService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword:     passwordForm.newPassword,
            });
            if (res.token && auth.user) {
                auth.setSession({ token: res.token, user: auth.user });
            }
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setAlert({ type: 'success', message: 'Contraseña actualizada correctamente.' });
        } catch (err) {
            setAlert({ type: 'error', message: err.response?.data?.message || 'Error al cambiar la contraseña.' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordReset = () => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setAlert(null);
    };

    const toggleShow = (key) => setShowPass(p => ({ ...p, [key]: !p[key] }));

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Spinner size="lg" />
                </div>
            </AdminLayout>
        );
    }

    const initials = getInitials(profileForm.name || auth.user?.name);
    const avatarSrc = safeImageUrl(profileForm.avatar);
    const roleLabel = ROLE_LABELS[auth.user?.role] || auth.user?.role || '';

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6 max-w-2xl">

                {/* Header */}
                <div>
                    <h2 className="text-xl font-bold text-neutral-900">Mi Perfil</h2>
                    <p className="text-sm text-neutral-500 mt-0.5">
                        {auth.user?.name}
                        {roleLabel && <> · <span className="text-neutral-400">{roleLabel}</span></>}
                    </p>
                </div>

                {alert && (
                    <AlertMessage
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                {/* Card */}
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">

                    {/* Tabs */}
                    <div className="flex border-b border-neutral-200">
                        {[
                            { key: 'account',  label: 'Cuenta' },
                            { key: 'security', label: 'Seguridad' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => { setActiveTab(key); setAlert(null); }}
                                className={`px-6 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer
                                    ${activeTab === key
                                        ? 'border-brand-600 text-brand-600'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* ── Account tab ── */}
                    {activeTab === 'account' && (
                        <form onSubmit={handleProfileSave} className="p-6 flex flex-col gap-6">

                            {/* Avatar */}
                            <div className="flex items-center gap-5">
                                <div className="relative flex-shrink-0">
                                    <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center">
                                        {avatarSrc ? (
                                            <img
                                                src={avatarSrc}
                                                alt={profileForm.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl font-bold text-neutral-600 select-none">
                                                {initials}
                                            </span>
                                        )}
                                        {avatarUploading && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                                                <Spinner size="sm" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={avatarUploading}
                                        title="Cambiar foto"
                                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-neutral-900 text-white
                                            flex items-center justify-center shadow-md
                                            hover:bg-neutral-700 transition-colors cursor-pointer
                                            disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <LuCamera className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-900">{profileForm.name || '—'}</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">{profileForm.email}</p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={avatarUploading}
                                        className="mt-2 text-xs font-medium text-brand-600 hover:text-brand-700
                                            transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {avatarUploading ? 'Subiendo...' : 'Subir foto'}
                                    </button>
                                </div>
                            </div>

                            {/* Fields */}
                            <div className="flex flex-col gap-4">
                                <FormField
                                    label="Nombre completo"
                                    name="name"
                                    value={profileForm.name}
                                    onChange={handleProfileChange}
                                    placeholder="Tu nombre"
                                    required
                                />
                                <FormField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={profileForm.email}
                                    onChange={handleProfileChange}
                                    placeholder="tu@email.com"
                                />
                                {/* Bio textarea — styled to match Input */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="bio" className="text-sm font-medium text-neutral-700">
                                        Biografía
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        rows={3}
                                        maxLength={500}
                                        placeholder="Cuéntanos un poco sobre ti…"
                                        value={profileForm.bio}
                                        onChange={handleProfileChange}
                                        className="w-full px-3 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg
                                            text-neutral-900 placeholder-neutral-400 resize-none
                                            transition-all duration-200 outline-none
                                            focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                                    />
                                    <p className="text-xs text-neutral-400 text-right">
                                        {profileForm.bio.length}/500
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2 border-t border-neutral-100">
                                <Button type="submit" variant="primary" loading={saving}>
                                    Guardar cambios
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* ── Security tab ── */}
                    {activeTab === 'security' && (
                        <form onSubmit={handlePasswordSave} className="p-6 flex flex-col gap-6">

                            <div className="flex flex-col gap-4">
                                {/* Current password */}
                                <PasswordInput
                                    label="Contraseña actual"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    show={showPass.current}
                                    onToggle={() => toggleShow('current')}
                                    placeholder="Tu contraseña actual"
                                />

                                {/* New password */}
                                <PasswordInput
                                    label="Nueva contraseña"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    show={showPass.new}
                                    onToggle={() => toggleShow('new')}
                                    placeholder="Mínimo 6 caracteres"
                                />

                                {/* Confirm password */}
                                <PasswordInput
                                    label="Confirmar nueva contraseña"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    show={showPass.confirm}
                                    onToggle={() => toggleShow('confirm')}
                                    placeholder="Repite la nueva contraseña"
                                />
                            </div>

                            {/* Requirements */}
                            <div className="bg-neutral-50 rounded-lg p-4 flex flex-col gap-2">
                                <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
                                    Requisitos de contraseña
                                </p>
                                {PASSWORD_REQS.map(({ label, test }) => {
                                    const met = passwordForm.newPassword ? test(passwordForm.newPassword) : false;
                                    return (
                                        <div key={label} className="flex items-center gap-2">
                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0
                                                ${met ? 'bg-emerald-500' : 'bg-neutral-200'}`}>
                                                {met && <LuCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                            </span>
                                            <span className={`text-xs ${met ? 'text-emerald-700' : 'text-neutral-500'}`}>
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2 border-t border-neutral-100">
                                <Button type="submit" variant="primary" loading={saving}>
                                    Guardar cambios
                                </Button>
                                <Button type="button" variant="outline" onClick={handlePasswordReset} disabled={saving}>
                                    Reset
                                </Button>
                            </div>

                            {/* Forgot password */}
                            <p className="text-center text-xs text-neutral-400">
                                ¿No recuerdas tu contraseña actual?{' '}
                                <Link
                                    href="/admin/login/forgot-password"
                                    className="text-brand-600 hover:text-brand-700 font-medium transition-colors"
                                >
                                    Olvidé mi contraseña
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

// ── PasswordInput ─────────────────────────────────────────────────────────────
function PasswordInput({ label, name, value, onChange, show, onToggle, placeholder }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={name} className="text-sm font-medium text-neutral-700">
                {label}
            </label>
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="w-full px-3 py-2.5 pr-10 text-sm bg-white border border-neutral-200 rounded-lg
                        text-neutral-900 placeholder-neutral-400
                        transition-all duration-200 outline-none
                        focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center px-3
                        text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                    {show ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
