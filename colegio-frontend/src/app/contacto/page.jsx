'use client';
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import MainLayout from '@/components/templates/MainLayout';
import FormField from '@/components/molecules/FormField';
import AlertMessage from '@/components/molecules/AlertMessage';
import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Typography/Label';
import Textarea from '@/components/atoms/Textarea';
import { LuMapPin, LuPhone, LuMail, LuClock, LuSend, LuMessageSquare } from 'react-icons/lu';

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

const infoCards = [
    {
        Icon: LuMapPin,
        title: 'Dirección',
        desc: 'KR 8 # 5-51, HUILA, RIVERA.',
        accent: 'bg-brand-50 text-brand-600 border-brand-200',
    },
    {
        Icon: LuPhone,
        title: 'Teléfono',
        desc: '(+57) 000 000 0000',
        accent: 'bg-brand-50 text-brand-600 border-brand-200',
    },
    {
        Icon: LuMail,
        title: 'Correo',
        desc: 'contacto@colegio.edu.co',
        accent: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
        Icon: LuClock,
        title: 'Horario',
        desc: 'Lun–Vie: 7:00am – 5:00pm',
        accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
];

const spamWords = [
    'viagra', 'casino', 'bitcoin', 'loan', 'crypto', 'seo service',
    'free money', 'click here', 'buy now', 'lottery', 'winner',
];
const detectarSpam = (texto) => {
    const lower = texto.toLowerCase();
    return spamWords.some((word) => lower.includes(word));
};
const contarLinks = (texto) => {
    const matches = texto.match(/(https?:\/\/[^\s]+)/g);
    return matches ? matches.length : 0;
};
const telefonoRegex = /^3\d{9}$/;
const formatTelefono = (value) => {
    const numeros = value.replace(/\D/g, '').slice(0, 10);
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return `${numeros.slice(0, 3)} ${numeros.slice(3)}`;
    return `${numeros.slice(0, 3)} ${numeros.slice(3, 6)} ${numeros.slice(6)}`;
};

export default function ContactoPage() {
    const [form, setForm] = useState({
        nombre: '', email: '', telefono: '', asunto: '', mensaje: '', botcheck: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [startTime, setStartTime] = useState(null);

    useEffect(() => { setStartTime(Date.now()); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'telefono') {
            const limpio = value.replace(/\D/g, '').slice(0, 10);
            setForm(prev => ({ ...prev, telefono: limpio }));
            setErrors(prev => ({ ...prev, telefono: '' }));
            return;
        }
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (!form.email.trim()) newErrors.email = 'El email es obligatorio';
        if (!form.asunto.trim()) newErrors.asunto = 'El asunto es obligatorio';
        if (!form.mensaje.trim()) newErrors.mensaje = 'El mensaje es obligatorio';
        if (form.email && !/\S+@\S+\.\S+/.test(form.email))
            newErrors.email = 'El email no es válido';
        if (form.telefono && !telefonoRegex.test(form.telefono))
            newErrors.telefono = 'Debe ser un celular colombiano válido (10 dígitos, empieza por 3)';
        if (detectarSpam(form.mensaje) || detectarSpam(form.asunto))
            newErrors.mensaje = 'El mensaje contiene contenido no permitido.';
        if (contarLinks(form.mensaje) > 2)
            newErrors.mensaje = 'El mensaje contiene demasiados enlaces.';
        if (form.botcheck !== '')
            newErrors.general = 'Detección de spam activada.';
        if (startTime && (Date.now() - startTime) / 1000 < 3)
            newErrors.general = 'Por favor, tómate un momento para completar el formulario.';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (newErrors.general) setAlert({ type: 'error', message: newErrors.general });
            return;
        }
        if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
            setAlert({ type: 'error', message: 'El servicio de correo no está configurado. Contacta al administrador.' });
            return;
        }
        setLoading(true);
        setAlert(null);
        try {
            const templateParams = {
                nombre: form.nombre,
                email: form.email,
                telefono: form.telefono ? formatTelefono(form.telefono) : 'No proporcionado',
                asunto: form.asunto,
                mensaje: form.mensaje,
            };
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, { publicKey: EMAILJS_PUBLIC_KEY });
            setAlert({ type: 'success', message: '¡Mensaje enviado! Nos pondremos en contacto contigo pronto.' });
            setForm({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '', botcheck: '' });
            setStartTime(Date.now());
        } catch {
            setAlert({ type: 'error', message: 'Error al enviar el mensaje. Intenta de nuevo o contáctanos por teléfono.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>

            {/* ── Hero ── */}
            <section className="relative bg-neutral-950 overflow-hidden py-24">
                <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-900 rounded-full opacity-25 blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="max-w-2xl">
                        <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest block mb-4">
                            Comunícate con nosotros
                        </span>
                        <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-tight mb-5">
                            Estamos aquí<br />
                            <span className="gradient-text">para ayudarte</span>
                        </h1>
                        <p className="text-neutral-400 text-lg leading-relaxed">
                            Resuelve tus dudas, solicita información o simplemente salúdanos. Nuestro equipo responderá a la brevedad.
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full fill-white">
                        <path d="M0,60 L0,30 C360,60 720,0 1080,30 C1260,45 1380,20 1440,30 L1440,60 Z" />
                    </svg>
                </div>
            </section>

            {/* ── Info Cards ── */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {infoCards.map((card) => (
                            <div
                                key={card.title}
                                className="bg-white rounded-2xl p-5 border border-neutral-200/80 hover:border-neutral-300
                                    hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                            >
                                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${card.accent}`}>
                                    <card.Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-display font-bold text-neutral-900 text-sm mb-0.5">{card.title}</p>
                                    <p className="text-xs text-neutral-500 leading-relaxed">{card.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Formulario ── */}
            <section className="py-4 pb-20">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
                        {/* Header del formulario */}
                        <div className="px-8 pt-8 pb-6 border-b border-neutral-100 flex items-center gap-4">
                            <div className="h-12 w-12 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                <LuMessageSquare className="w-6 h-6 text-brand-600" />
                            </div>
                            <div>
                                <h2 className="font-display text-xl font-bold text-neutral-900">Envíanos un mensaje</h2>
                                <p className="text-sm text-neutral-500 mt-0.5">Completa el formulario y te responderemos pronto.</p>
                            </div>
                        </div>

                        <div className="px-8 py-8">
                            {alert && (
                                <div className="mb-6">
                                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                {/* Honeypot */}
                                <input
                                    type="text"
                                    name="botcheck"
                                    value={form.botcheck}
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        label="Nombre completo"
                                        name="nombre"
                                        placeholder="Tu nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        error={errors.nombre}
                                        required
                                    />
                                    <FormField
                                        label="Email"
                                        name="email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        error={errors.email}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        label="Teléfono"
                                        name="telefono"
                                        type="tel"
                                        placeholder="300 123 4567"
                                        value={formatTelefono(form.telefono)}
                                        onChange={handleChange}
                                        error={errors.telefono}
                                    />
                                    <FormField
                                        label="Asunto"
                                        name="asunto"
                                        placeholder="¿En qué podemos ayudarte?"
                                        value={form.asunto}
                                        onChange={handleChange}
                                        error={errors.asunto}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="mensaje" required>Mensaje</Label>
                                    <Textarea
                                        name="mensaje"
                                        rows={5}
                                        placeholder="Escribe tu mensaje aquí..."
                                        value={form.mensaje}
                                        onChange={handleChange}
                                        error={errors.mensaje}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    loading={loading}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    {!loading && <LuSend className="w-4 h-4" />}
                                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

        </MainLayout>
    );
}
