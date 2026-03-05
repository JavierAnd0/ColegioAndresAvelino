import Link from 'next/link';
import Button from '@/components/atoms/Button';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';

export default function HeroSection({
    title = 'Bienvenidos a Nuestro Colegio',
    subtitle = 'Formando líderes del futuro con valores, conocimiento y compromiso social.',
    primaryCTA = { label: 'Ver Blog', href: '/blog' },
    secondaryCTA = { label: 'Ver Calendario', href: '/calendario' },
}) {
    return (
        <section className="min-h-[90vh] flex items-center bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">

                {/* Texto */}
                <div className="flex flex-col gap-6">
                    <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full w-fit uppercase tracking-wide">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        Institución Educativa
                    </span>

                    <Heading level="h1" className="leading-tight">
                        {title}
                    </Heading>

                    <Paragraph size="lg" color="muted">
                        {subtitle}
                    </Paragraph>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <Link href={primaryCTA.href}>
                            <Button variant="primary" size="lg">
                                {primaryCTA.label}
                            </Button>
                        </Link>
                        <Link href={secondaryCTA.href}>
                            <Button variant="outline" size="lg">
                                {secondaryCTA.label}
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 pt-4 border-t border-neutral-200">
                        {[
                            { value: '+500', label: 'Estudiantes' },
                            { value: '+40', label: 'Docentes' },
                            { value: '25+', label: 'Años de experiencia' },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col">
                                <span className="text-2xl font-mono font-bold text-neutral-900">{stat.value}</span>
                                <span className="text-sm text-neutral-500">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Imagen / Placeholder visual */}
                <div className="relative hidden md:flex items-center justify-center">
                    <div className="w-full aspect-square max-w-md bg-neutral-200 rounded-2xl flex items-center justify-center">
                        <Paragraph color="muted">
                            Imagen del colegio
                        </Paragraph>
                    </div>
                    {/* Tarjeta flotante */}
                    <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-md p-4 flex items-center gap-3 border border-neutral-100">
                        <div className="h-10 w-10 rounded-full bg-neutral-900 flex items-center justify-center text-white text-lg">
                            📅
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-neutral-900">Próximos eventos</p>
                            <p className="text-xs text-neutral-500">Ver calendario</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}