import MainLayout from '@/components/templates/MainLayout';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';

const valores = [
    {
        icon: '🎓', title: 'Excelencia Académica',
        desc: 'Comprometidos con los más altos estándares de calidad educativa.'
    },
    {
        icon: '🤝', title: 'Valores y Ética',
        desc: 'Formamos personas íntegras con principios sólidos para la vida.'
    },
    {
        icon: '🌱', title: 'Desarrollo Integral',
        desc: 'Potenciamos las habilidades académicas, sociales y emocionales.'
    },
    {
        icon: '🌍', title: 'Compromiso Social',
        desc: 'Educamos ciudadanos responsables con su comunidad y entorno.'
    },
];

const equipo = [
    { nombre: 'María González', cargo: 'Rectora', inicial: 'M' },
    { nombre: 'Carlos Ramírez', cargo: 'Coordinador Académico', inicial: 'C' },
    { nombre: 'Ana Martínez', cargo: 'Coordinadora de Convivencia', inicial: 'A' },
    { nombre: 'Luis Hernández', cargo: 'Coordinador Administrativo', inicial: 'L' },
];

export default function NosotrosPage() {
    return (
        <MainLayout>

            {/* Hero */}
            <section className="bg-neutral-900 text-white py-20">
                <div className="max-w-6xl mx-auto px-4 text-center flex flex-col gap-4">
                    <Heading level="h1" className="text-white">
                        Nuestra Institución
                    </Heading>
                    <Paragraph size="lg" className="text-neutral-300 max-w-2xl mx-auto">
                        Más de 25 años formando líderes con valores, conocimiento
                        y compromiso social para transformar nuestra comunidad.
                    </Paragraph>
                </div>
            </section>

            {/* Misión y Visión */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
                    <div className="bg-neutral-50 rounded-2xl p-8 flex flex-col gap-4">
                        <div className="h-12 w-12 bg-neutral-900 rounded-xl flex items-center justify-center text-2xl">
                            🎯
                        </div>
                        <Heading level="h3">Misión</Heading>
                        <Paragraph color="muted">
                            Formar ciudadanos íntegros, críticos y competentes mediante
                            una educación de calidad que desarrolle sus dimensiones
                            cognitiva, social, ética y espiritual, para que contribuyan
                            positivamente a la transformación de su entorno.
                        </Paragraph>
                    </div>
                    <div className="bg-neutral-900 rounded-2xl p-8 flex flex-col gap-4">
                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-2xl">
                            🔭
                        </div>
                        <Heading level="h3" className="text-white">Visión</Heading>
                        <Paragraph className="text-neutral-300">
                            Para 2030 ser reconocidos como una institución educativa líder
                            en la región, destacada por la excelencia académica, la
                            innovación pedagógica y la formación en valores, generando
                            egresados que impacten positivamente a la sociedad.
                        </Paragraph>
                    </div>
                </div>
            </section>

            {/* Valores */}
            <section className="bg-neutral-50 py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <Heading level="h2">Nuestros Valores</Heading>
                        <Paragraph color="muted" className="mt-2 max-w-xl mx-auto">
                            Los principios que guían nuestra labor educativa cada día.
                        </Paragraph>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {valores.map((valor) => (
                            <div key={valor.title}
                                className="bg-white rounded-xl p-6 flex flex-col gap-3 border border-neutral-200 hover:shadow-md transition-shadow">
                                <span className="text-3xl">{valor.icon}</span>
                                <Heading level="h5">{valor.title}</Heading>
                                <Paragraph size="sm" color="muted">{valor.desc}</Paragraph>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Historia */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 flex flex-col gap-6">
                    <div className="text-center">
                        <Heading level="h2">Nuestra Historia</Heading>
                    </div>
                    <div className="flex flex-col gap-6">
                        {[
                            { year: '1998', text: 'Fundación de la institución con apenas 120 estudiantes y un equipo de 8 docentes comprometidos con la educación de calidad.' },
                            { year: '2005', text: 'Ampliación de la planta física y apertura de la sección de bachillerato, consolidando la educación básica y media.' },
                            { year: '2015', text: 'Obtención del reconocimiento como institución de alto desempeño académico a nivel departamental.' },
                            { year: '2024', text: 'Más de 500 estudiantes y 40 docentes, con egresados destacados en universidades del país y el exterior.' },
                        ].map((item) => (
                            <div key={item.year} className="flex gap-6 items-start">
                                <div className="flex-shrink-0 w-16 h-16 bg-neutral-900 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">{item.year}</span>
                                </div>
                                <div className="flex-1 pt-3">
                                    <Paragraph color="muted">{item.text}</Paragraph>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Equipo directivo */}
            <section className="bg-neutral-50 py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <Heading level="h2">Equipo Directivo</Heading>
                        <Paragraph color="muted" className="mt-2">
                            Las personas que lideran nuestra institución.
                        </Paragraph>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {equipo.map((persona) => (
                            <div key={persona.nombre}
                                className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 border border-neutral-200 text-center">
                                <div className="h-16 w-16 rounded-full bg-neutral-900 flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">{persona.inicial}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-neutral-900">{persona.nombre}</p>
                                    <p className="text-sm text-neutral-500 mt-0.5">{persona.cargo}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </MainLayout>
    );
}