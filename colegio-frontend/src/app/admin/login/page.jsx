'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import FormField from '@/components/molecules/FormField';
import AlertMessage from '@/components/molecules/AlertMessage';
import Button from '@/components/atoms/Button';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';

export default function AdminLoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Por favor completa todos los campos.');
            return;
        }
        setLoading(true);
        try {
            await login(form.email, form.password);
            router.push('/admin');
        } catch (err) {
            setError(err.message || 'Credenciales incorrectas.');
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
                    <Heading level="h3">Panel Administrativo</Heading>
                    <Paragraph color="muted">Inicia sesión para continuar</Paragraph>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-8 flex flex-col gap-5">
                    {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <FormField label="Email" name="email" type="email"
                            placeholder="admin@colegio.edu.co"
                            value={form.email} onChange={handleChange} required />
                        <FormField label="Contraseña" name="password" type="password"
                            placeholder="••••••••"
                            value={form.password} onChange={handleChange} required />
                        <div className="flex justify-end">
                            <Link href="/admin/login/forgot-password" className="text-xs text-neutral-500 hover:text-neutral-800">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <Button type="submit" variant="primary" size="lg"
                            loading={loading} className="w-full mt-2">
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </Button>
                    </form>
                </div>

                <div className="text-center mt-4">
                    <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
                        ← Volver al sitio
                    </Link>
                </div>
            </div>
        </div>
    );
}