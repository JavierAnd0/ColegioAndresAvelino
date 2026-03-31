'use client';
import { useState } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import emailjs from '@emailjs/browser';
import { authService } from '@/services/authService';
import Button from '@/components/atoms/Button';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import AlertMessage from '@/components/molecules/AlertMessage';

export default function ForgotPasswordPage() {
    const [email, setEmail]   = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent]     = useState(false);
    const [error, setError]   = useState('');

    const sendEmailjs = async (url, recipientEmail, name) => {
        try {
            emailjs.init({ publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY });
            await emailjs.send(
                process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
                process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_RESET_ID,
                { email: recipientEmail, name, reset_link: url, expiry: '10 minutos' },
            );
        } catch (e) {
            Sentry.captureException(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setError('');

        try {
            const data = await authService.forgotPassword(email);
            if (data.resetUrl) {
                sendEmailjs(data.resetUrl, email, data.userName || '');
            }
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al procesar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
                <div className="w-full max-w-md flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 bg-neutral-900 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                        <Heading level="h3">Revisa tu correo</Heading>
                    </div>
                    <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center flex flex-col gap-4">
                        <p className="text-sm text-neutral-600">
                            Si <strong>{email}</strong> está registrado en el sistema, recibirás el enlace de recuperación en breve.
                        </p>
                        <Link href="/admin/login">
                            <Button variant="primary" className="w-full">Volver al login</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="h-12 w-12 bg-neutral-900 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">C</span>
                    </div>
                    <Heading level="h3">Recuperar contraseña</Heading>
                    <Paragraph color="muted" className="text-center">
                        Ingresa tu email y te enviaremos un enlace de recuperación.
                    </Paragraph>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-8 flex flex-col gap-5">
                    {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-neutral-700">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                className="px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            />
                        </div>
                        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
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
