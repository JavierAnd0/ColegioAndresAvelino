'use client';
import { useState } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import FormField from '@/components/molecules/FormField';
import AlertMessage from '@/components/molecules/AlertMessage';
import Button from '@/components/atoms/Button';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Label from '@/components/atoms/Typography/Label';
import Textarea from '@/components/atoms/Textarea';

const infoCards = [
    { icon: '📍', title: 'Dirección', desc: 'Dirección del colegio, Ciudad, Departamento' },
    { icon: '📞', title: 'Teléfono', desc: '(+57) 000 000 0000' },
    { icon: '✉️', title: 'Email', desc: 'contacto@colegio.edu.co' },
    { icon: '🕐', title: 'Horario', desc: 'Lunes a Viernes: 7:00am - 5:00pm' },
];

export default function ContactoPage() {
    const [form, setForm] = useState({
        nombre: '', email: '', telefono: '', asunto: '', mensaje: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (!form.email.trim()) newErrors.email = 'El email es obligatorio';
        if (!form.asunto.trim()) newErrors.asunto = 'El asunto es obligatorio';
        if (!form.mensaje.trim()) newErrors.mensaje = 'El mensaje es obligatorio';
        if (form.email && !/\S+@\S+\.\S+/.test(form.email))
            newErrors.email = 'El email no es válido';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setLoading(true);
        // Simulación de envío (aquí conectarías con tu backend o EmailJS)
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAlert({
            type: 'success',
            message: '¡Mensaje enviado! Nos pondremos en contacto contigo pronto.',
        });
        setForm({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
        setLoading(false);
    };

    return (
        <MainLayout>

            {/* Hero */}
            <section className="bg-neutral-900 text-white py-16">
                <div className="max-w-6xl mx-auto px-4 text-center flex flex-col gap-3">
                    <Heading level="h1" className="text-white">Contáctanos</Heading>
                    <Paragraph size="lg" className="text-neutral-300 max-w-xl mx-auto">
                        Estamos aquí para resolver tus dudas y atender tus solicitudes.
                    </Paragraph>
                </div>
            </section>

            {/* Info cards */}
            <section className="py-12 bg-neutral-50">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {infoCards.map((card) => (
                        <div key={card.title}
                            className="bg-white rounded-xl p-5 flex flex-col gap-2 border border-neutral-200">
                            <span className="text-2xl">{card.icon}</span>
                            <p className="font-semibold text-neutral-900">{card.title}</p>
                            <Paragraph size="sm" color="muted">{card.desc}</Paragraph>
                        </div>
                    ))}
                </div>
            </section>

            {/* Formulario */}
            <section className="py-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-10">
                        <Heading level="h2">Envíanos un mensaje</Heading>
                        <Paragraph color="muted" className="mt-2">
                            Completa el formulario y te responderemos a la brevedad.
                        </Paragraph>
                    </div>

                    <div className="bg-white rounded-2xl border border-neutral-200 p-8">
                        {alert && (
                            <div className="mb-6">
                                <AlertMessage type={alert.type} message={alert.message}
                                    onClose={() => setAlert(null)} />
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Nombre completo" name="nombre"
                                    placeholder="Tu nombre" value={form.nombre}
                                    onChange={handleChange} error={errors.nombre} required />
                                <FormField label="Email" name="email" type="email"
                                    placeholder="tu@email.com" value={form.email}
                                    onChange={handleChange} error={errors.email} required />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField label="Teléfono" name="telefono" type="tel"
                                    placeholder="(+57) 000 000 0000" value={form.telefono}
                                    onChange={handleChange} />
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