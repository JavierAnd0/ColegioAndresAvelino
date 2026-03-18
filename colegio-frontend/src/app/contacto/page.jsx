'use client';
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import MainLayout from '@/components/templates/MainLayout';
import FormField from '@/components/molecules/FormField';
import AlertMessage from '@/components/molecules/AlertMessage';
import Button from '@/components/atoms/Button';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Label from '@/components/atoms/Typography/Label';
import Textarea from '@/components/atoms/Textarea';
import { LuMapPin, LuPhone, LuMail, LuClock } from 'react-icons/lu';

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

const infoCards = [
    { Icon: LuMapPin, title: 'Dirección', desc: 'KR 8 # 5-51, HUILA, RIVERA.' },
    { Icon: LuPhone, title: 'Teléfono', desc: '(+57) 000 000 0000' },
    { Icon: LuMail, title: 'Email', desc: 'contacto@colegio.edu.co' },
    { Icon: LuClock, title: 'Horario', desc: 'Lunes a Viernes: 7:00am - 5:00pm' },
];

// --- Anti-spam ---
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

// --- Teléfono colombiano ---
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

    useEffect(() => {
        setStartTime(Date.now());
    }, []);

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

        // Anti-spam
        if (detectarSpam(form.mensaje) || detectarSpam(form.asunto))
            newErrors.mensaje = 'El mensaje contiene contenido no permitido.';
        if (contarLinks(form.mensaje) > 2)
            newErrors.mensaje = 'El mensaje contiene demasiados enlaces.';
        if (form.botcheck !== '')
            newErrors.general = 'Detección de spam activada.';

        // Envío muy rápido (< 3s)
        if (startTime && (Date.now() - startTime) / 1000 < 3)
            newErrors.general = 'Por favor, tómate un momento para completar el formulario.';

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            if (newErrors.general) {
                setAlert({ type: 'error', message: newErrors.general });
            }
            return;
        }

        if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
            setAlert({
                type: 'error',
                message: 'El servicio de correo no está configurado. Contacta al administrador.',
            });
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

            // Enviar notificación al colegio
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);

            // Auto-reply al remitente (no bloquea si falla)
            if (EMAILJS_TEMPLATE_ID2) {
                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID2, templateParams, EMAILJS_PUBLIC_KEY).catch(() => {});
            }

            setAlert({
                type: 'success',
                message: '¡Mensaje enviado! Nos pondremos en contacto contigo pronto.',
            });
            setForm({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '', botcheck: '' });
            setStartTime(Date.now());
        } catch {
            setAlert({
                type: 'error',
                message: 'Error al enviar el mensaje. Intenta de nuevo o contáctanos por teléfono.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>

            {/* Hero */}
            <section className="bg-neutral-900 text-white py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-4 text-center flex flex-col gap-3">
                    <Heading level="h1" className="text-white">Contáctanos</Heading>
                    <Paragraph size="lg" className="text-neutral-300 max-w-xl mx-auto">
                        Estamos aquí para resolver tus dudas y atender tus solicitudes.
                    </Paragraph>
                </div>
            </section>

            {/* Info cards */}
            <section className="py-8 sm:py-12 bg-neutral-50">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {infoCards.map((card) => (
                        <div key={card.title}
                            className="bg-white rounded-xl p-4 sm:p-5 flex flex-col gap-1.5 sm:gap-2 border border-neutral-200">
                            <card.Icon className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />
                            <p className="font-semibold text-neutral-900 text-sm sm:text-base">{card.title}</p>
                            <Paragraph size="sm" color="muted" className="text-xs sm:text-sm">{card.desc}</Paragraph>
                        </div>
                    ))}
                </div>
            </section>

            {/* Formulario */}
            <section className="py-12 sm:py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-8 sm:mb-10">
                        <Heading level="h2">Envíanos un mensaje</Heading>
                        <Paragraph color="muted" className="mt-2">
                            Completa el formulario y te responderemos a la brevedad.
                        </Paragraph>
                    </div>

                    <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-8">
                        {alert && (
                            <div className="mb-6">
                                <AlertMessage type={alert.type} message={alert.message}
                                    onClose={() => setAlert(null)} />
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
                            {/* Honeypot - campo oculto anti-bot */}
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
                                <FormField label="Nombre completo" name="nombre"
                                    placeholder="Tu nombre" value={form.nombre}
                                    onChange={handleChange} error={errors.nombre} required />
                                <FormField label="Email" name="email" type="email"
                                    placeholder="tu@email.com" value={form.email}
                                    onChange={handleChange} error={errors.email} required />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField
                                    label="Teléfono" name="telefono"
                                    type="tel"
                                    placeholder="300 123 4567"
                                    value={formatTelefono(form.telefono)}
                                    onChange={handleChange} error={errors.telefono}
                                />
                                <FormField label="Asunto" name="asunto"
                                    placeholder="¿En qué podemos ayudarte?" value={form.asunto}
                                    onChange={handleChange} error={errors.asunto} required />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="mensaje" required>Mensaje</Label>
                                <Textarea name="mensaje" rows={5}
                                    placeholder="Escribe tu mensaje aquí..."
                                    value={form.mensaje} onChange={handleChange}
                                    error={errors.mensaje} />
                            </div>

                            <Button type="submit" variant="primary" size="lg"
                                loading={loading} className="w-full">
                                {loading ? 'Enviando...' : 'Enviar mensaje'}
                            </Button>
                        </form>
                    </div>
                </div>
            </section>

        </MainLayout>
    );
}
