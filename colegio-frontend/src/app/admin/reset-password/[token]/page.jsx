'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import Button from '@/components/atoms/Button';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import FormField from '@/components/molecules/FormField';
import AlertMessage from '@/components/molecules/AlertMessage';

export default function ResetPasswordPage() {
    const { token } = useParams();
    const router = useRouter();
    const { setSession } = useAuth();
    const [form, setForm] = useState({ password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (form.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        setLoading(true);
        try {
            const data = await authService.resetPassword(token, form.password);
            // Auto-login después del reset
            if (data.token) {
                setSession(data);
            }
            router.push('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'El enlace es inválido o ha expirado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="h-12 w-12 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">C</span>
                    </div>
                    <Heading level="h3">Nueva contraseña</Heading>
                    <Paragraph color="muted" className="text-center">
                        Ingresa tu nueva contraseña. El enlace expira en 10 minutos.
                    </Paragraph>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-8 flex flex-col gap-5">
                    {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <FormField
                            label="Nueva contraseña"
                            name="password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={form.password}
                            onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                            required
                        />
                        <FormField
                            label="Confirmar contraseña"
                            name="confirm"
                            type="password"
                            placeholder="Repite la contraseña"
                            value={form.confirm}
                            onChange={(e) => setForm(p => ({ ...p, confirm: e.target.value }))}
                            required
                        />
                        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                            {loading ? 'Guardando...' : 'Establecer contraseña'}
                        </Button>
                    </form>
                </div>

                <div className="text-center mt-4">
                    <Link href="/admin/login" className="text-sm text-neutral-500 hover:text-neutral-900">
                        ← Volver al login
                    </Link>
                </div>
            </div>
        </div>
    );
}
