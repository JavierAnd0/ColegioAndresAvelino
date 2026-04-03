import MainLayout from '@/components/templates/MainLayout';
import Link from 'next/link';
import {
    LuFileText, LuShieldCheck, LuGlobe, LuAlertTriangle,
    LuScale, LuMail, LuBookOpen, LuLink, LuTriangleAlert,
} from 'react-icons/lu';

const sections = [
    {
        id: 'objeto',
        Icon: LuFileText,
        title: '1. Objeto del Sitio Web',
        content: [
            'El presente sitio web es propiedad del Colegio Andrés Avelino, institución educativa legalmente constituida en Colombia de conformidad con la Ley 115 de 1994 (Ley General de Educación) y las disposiciones del Ministerio de Educación Nacional.',
            'Este portal tiene como finalidad brindar información institucional a estudiantes, padres de familia, acudientes, docentes y comunidad en general sobre las actividades, eventos, noticias y servicios de la institución educativa.',
        ],
    },
    {
        id: 'uso-aceptable',
        Icon: LuShieldCheck,
        title: '2. Condiciones de Uso Aceptable',
        content: [
            'Al acceder y utilizar este sitio web, el usuario se compromete a:',
        ],
        list: [
            'Hacer un uso lícito, responsable y de buena fe del contenido publicado.',
            'No reproducir, distribuir ni modificar el contenido sin autorización expresa de la institución.',
            'No utilizar el sitio para fines comerciales, publicitarios ni ajenos al propósito institucional.',
            'No intentar acceder de forma no autorizada a secciones restringidas del sitio.',
            'No publicar ni transmitir contenido que vulnere derechos de terceros o la normativa colombiana vigente.',
            'Respetar los derechos de los menores de edad, en concordancia con el Código de la Infancia y la Adolescencia (Ley 1098 de 2006).',
        ],
    },
    {
        id: 'propiedad-intelectual',
        Icon: LuBookOpen,
        title: '3. Propiedad Intelectual',
        content: [
            'Todos los contenidos publicados en este sitio web — incluyendo textos, imágenes, logotipos, gráficos, videos y diseño — son propiedad del Colegio Andrés Avelino o de sus respectivos titulares, y están protegidos por la Ley 23 de 1982 y la Decisión Andina 351 de 1993 sobre derechos de autor.',
            'Queda expresamente prohibida su reproducción total o parcial sin previa autorización escrita de la institución, salvo los usos permitidos por la ley colombiana.',
        ],
    },
    {
        id: 'enlaces',
        Icon: LuLink,
        title: '4. Enlaces a Sitios Externos',
        content: [
            'Este sitio puede contener enlaces a páginas web de terceros (entidades gubernamentales, aliados académicos, etc.). El Colegio Andrés Avelino no es responsable del contenido, veracidad ni disponibilidad de dichos sitios externos, y no implica ningún tipo de respaldo o recomendación de su parte.',
        ],
    },
    {
        id: 'responsabilidad',
        Icon: LuTriangleAlert,
        title: '5. Limitación de Responsabilidad',
        content: [
            'El Colegio Andrés Avelino realiza todos los esfuerzos razonables para mantener la información actualizada y correcta, pero no garantiza la ausencia de errores, interrupciones técnicas ni la disponibilidad continua del servicio.',
            'La institución no será responsable por daños directos o indirectos derivados del acceso, uso o imposibilidad de uso de este sitio web, en la medida permitida por la legislación colombiana vigente.',
        ],
    },
    {
        id: 'privacidad',
        Icon: LuShieldCheck,
        title: '6. Protección de Datos Personales',
        content: [
            'El tratamiento de datos personales recabados a través de este sitio se rige por la Política de Privacidad de la institución, de conformidad con la Ley Estatutaria 1581 de 2012 y el Decreto Reglamentario 1377 de 2013.',
        ],
        linkLabel: 'Consultar nuestra Política de Privacidad',
        linkHref: '/privacidad',
    },
    {
        id: 'ley-aplicable',
        Icon: LuScale,
        title: '7. Ley Aplicable y Jurisdicción',
        content: [
            'Los presentes términos se rigen por las leyes de la República de Colombia. Cualquier controversia que surja en relación con el uso de este sitio web será sometida a la jurisdicción de los jueces y tribunales competentes de Colombia, sin perjuicio de los mecanismos alternativos de solución de conflictos previstos en la ley.',
        ],
    },
    {
        id: 'modificaciones',
        Icon: LuGlobe,
        title: '8. Modificaciones',
        content: [
            'El Colegio Andrés Avelino se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor desde su publicación en este sitio web. El uso continuado del sitio tras la publicación de modificaciones implica la aceptación de las nuevas condiciones.',
            'Fecha de última actualización: 2 de abril de 2026.',
        ],
    },
];

export default function TerminosPage() {
    return (
        <MainLayout>
            {/* Hero */}
            <section className="relative min-h-[45vh] flex items-center bg-neutral-950 overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                <div className="absolute -top-40 -right-40 w-[400px] h-[400px] bg-brand-900 rounded-full opacity-30 blur-3xl pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 py-20 relative z-10 w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-brand-600 rounded-xl flex items-center justify-center">
                            <LuFileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest">
                            Marco legal
                        </span>
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-tight mb-5">
                        Términos de <span className="gradient-text">Uso</span>
                    </h1>
                    <p className="text-lg text-neutral-400 leading-relaxed max-w-xl">
                        Condiciones que rigen el acceso y uso de este sitio web institucional, conforme a la legislación colombiana vigente.
                    </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full fill-white">
                        <path d="M0,60 L0,30 C360,0 720,60 1080,30 C1260,15 1380,30 1440,20 L1440,60 Z" />
                    </svg>
                </div>
            </section>

            {/* Contenido */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-4">

                    {/* Nota introductoria */}
                    <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 mb-12 flex gap-4">
                        <LuShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-brand-800 leading-relaxed">
                            Al navegar por este sitio web, el usuario acepta los presentes términos y condiciones en su totalidad. Si no está de acuerdo con alguno de ellos, le rogamos que no utilice el sitio.
                        </p>
                    </div>

                    {/* Secciones */}
                    <div className="flex flex-col gap-10">
                        {sections.map((sec) => (
                            <div key={sec.id} id={sec.id} className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <sec.Icon className="w-4 h-4 text-brand-600" />
                                    </div>
                                    <h2 className="font-display text-xl font-bold text-neutral-900">{sec.title}</h2>
                                </div>

                                <div className="pl-12 flex flex-col gap-3">
                                    {sec.content.map((p, i) => (
                                        <p key={i} className="text-neutral-600 leading-relaxed">{p}</p>
                                    ))}

                                    {sec.list && (
                                        <ul className="flex flex-col gap-2 mt-1">
                                            {sec.list.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-neutral-600">
                                                    <span className="h-1.5 w-1.5 bg-brand-500 rounded-full flex-shrink-0 mt-2" />
                                                    <span className="leading-relaxed">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {sec.linkHref && (
                                        <Link
                                            href={sec.linkHref}
                                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors mt-1"
                                        >
                                            <span className="h-px w-3 bg-brand-400 rounded-full" />
                                            {sec.linkLabel}
                                        </Link>
                                    )}
                                </div>

                                <div className="border-t border-neutral-100 mt-2" />
                            </div>
                        ))}
                    </div>

                    {/* Contacto */}
                    <div className="mt-12 bg-neutral-900 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="h-12 w-12 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <LuMail className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display font-bold text-white mb-1">¿Tienes preguntas?</h3>
                            <p className="text-sm text-neutral-400">
                                Para consultas sobre estos términos, comunícate con la institución a través de nuestro formulario de contacto.
                            </p>
                        </div>
                        <Link
                            href="/contacto"
                            className="flex-shrink-0 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors duration-200"
                        >
                            Contactar
                        </Link>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
}
