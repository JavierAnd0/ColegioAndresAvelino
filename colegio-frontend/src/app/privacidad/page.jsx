import MainLayout from '@/components/templates/MainLayout';
import Link from 'next/link';
import {
    LuShieldCheck, LuDatabase, LuUsers, LuLock,
    LuBell, LuUserCheck, LuMail, LuFileText,
    LuRefreshCw, LuTriangleAlert,
} from 'react-icons/lu';

const derechosTitular = [
    { label: 'Conocer', desc: 'los datos personales que la institución tiene sobre usted.' },
    { label: 'Actualizar', desc: 'sus datos cuando sean inexactos, incompletos o estén desactualizados.' },
    { label: 'Rectificar', desc: 'información incorrecta sobre usted en nuestras bases de datos.' },
    { label: 'Suprimir', desc: 'sus datos cuando no sean necesarios para la finalidad que justificó su recolección, salvo obligación legal de conservarlos.' },
    { label: 'Revocar', desc: 'la autorización de tratamiento de sus datos personales en cualquier momento.' },
    { label: 'Acceder', desc: 'gratuitamente a sus datos personales que hayan sido objeto de tratamiento.' },
    { label: 'Presentar quejas', desc: 'ante la Superintendencia de Industria y Comercio (SIC) cuando considere que sus derechos han sido vulnerados.' },
];

const tiposDatos = [
    {
        categoria: 'Datos de identificación',
        ejemplos: 'Nombre, número de documento, fecha de nacimiento.',
        finalidad: 'Identificar a estudiantes, padres, acudientes y docentes vinculados a la institución.',
    },
    {
        categoria: 'Datos de contacto',
        ejemplos: 'Dirección, teléfono, correo electrónico.',
        finalidad: 'Comunicaciones institucionales, citaciones y boletines informativos.',
    },
    {
        categoria: 'Datos académicos',
        ejemplos: 'Calificaciones, grado, historial escolar.',
        finalidad: 'Gestión del proceso educativo conforme a la Ley 115 de 1994 y el Decreto 1290 de 2009.',
    },
    {
        categoria: 'Datos de navegación',
        ejemplos: 'Dirección IP, páginas visitadas, tipo de dispositivo.',
        finalidad: 'Análisis estadístico del sitio web para mejorar la experiencia del usuario.',
    },
    {
        categoria: 'Datos del formulario de contacto',
        ejemplos: 'Nombre, correo electrónico, mensaje.',
        finalidad: 'Gestionar y responder solicitudes, peticiones o inquietudes enviadas por el usuario.',
    },
];

const sections = [
    {
        id: 'responsable',
        Icon: LuFileText,
        title: '1. Responsable del Tratamiento',
        content: [
            'El responsable del tratamiento de datos personales es el Colegio Andrés Avelino, institución educativa de Colombia, inscrita ante la Secretaría de Educación correspondiente de conformidad con la Ley 115 de 1994.',
            'Para ejercer sus derechos o realizar consultas relacionadas con el tratamiento de sus datos personales, puede contactarnos a través del formulario de nuestra página web o al correo institucional.',
        ],
    },
    {
        id: 'base-legal',
        Icon: LuShieldCheck,
        title: '2. Base Legal',
        content: [
            'El tratamiento de datos personales realizado por la institución se fundamenta en:',
        ],
        list: [
            'Ley Estatutaria 1581 de 2012 — Protección de Datos Personales.',
            'Decreto Reglamentario 1377 de 2013 — Reglamentación parcial de la Ley 1581.',
            'Decreto Único Reglamentario 1074 de 2015, Libro 2, Parte 2, Título 2 — Protección de Datos.',
            'Ley 115 de 1994 — Ley General de Educación.',
            'Ley 1581 de 2012, Art. 10 — Causales de excepción al requisito de autorización (relación contractual o legal con el titular).',
        ],
    },
    {
        id: 'tipos-datos',
        Icon: LuDatabase,
        title: '3. Datos Personales Tratados',
        content: [
            'De acuerdo con el principio de finalidad y el principio de minimización, la institución recopila únicamente los datos necesarios para cumplir sus objetivos educativos e institucionales:',
        ],
        table: tiposDatos,
    },
    {
        id: 'finalidades',
        Icon: LuUsers,
        title: '4. Finalidades del Tratamiento',
        content: [
            'Sus datos personales serán tratados para las siguientes finalidades, en estricto cumplimiento del principio de finalidad establecido en el Art. 4 de la Ley 1581 de 2012:',
        ],
        list: [
            'Gestión del proceso de matrícula, seguimiento académico y comunicación con la familia.',
            'Publicación del Cuadro de Honor (con consentimiento previo del titular o su representante legal).',
            'Envío de circulares, boletines y comunicados institucionales.',
            'Cumplimiento de obligaciones legales ante el Ministerio de Educación Nacional y la Secretaría de Educación.',
            'Mejora continua del sitio web y los servicios digitales de la institución.',
            'Respuesta a solicitudes, PQRS y solicitudes de información.',
        ],
    },
    {
        id: 'derechos',
        Icon: LuUserCheck,
        title: '5. Derechos del Titular',
        content: [
            'De conformidad con el Artículo 8 de la Ley 1581 de 2012, los titulares de datos personales tienen los siguientes derechos:',
        ],
        rights: derechosTitular,
    },
    {
        id: 'procedimiento',
        Icon: LuBell,
        title: '6. Procedimiento para Ejercer sus Derechos',
        content: [
            'Para ejercer cualquiera de sus derechos como titular, puede:',
        ],
        list: [
            'Enviar una solicitud escrita al correo electrónico institucional con asunto "Habeas Data".',
            'Radicar su solicitud presencialmente en la secretaría de la institución.',
            'Utilizar el formulario de contacto disponible en este sitio web.',
        ],
        extra: 'La institución dará respuesta a su solicitud dentro de los plazos establecidos por la Ley 1581 de 2012: diez (10) días hábiles para consultas y quince (15) días hábiles para reclamos, prorrogables según la ley.',
    },
    {
        id: 'transferencia',
        Icon: LuLock,
        title: '7. Transferencia y Transmisión de Datos',
        content: [
            'Sus datos personales no serán vendidos, cedidos ni compartidos con terceros no autorizados. Solo podrán ser transmitidos a:',
        ],
        list: [
            'Entidades gubernamentales (Ministerio de Educación, Secretarías de Educación, ICBF) cuando así lo exija la ley.',
            'Operadores de servicios tecnológicos que prestan servicios a la institución (correo, plataformas académicas), bajo acuerdos de confidencialidad.',
            'Terceros con su consentimiento previo, expreso e informado.',
        ],
    },
    {
        id: 'seguridad',
        Icon: LuShieldCheck,
        title: '8. Medidas de Seguridad',
        content: [
            'El Colegio Andrés Avelino implementa medidas técnicas, humanas y administrativas para garantizar la seguridad de sus datos personales y evitar su adulteración, pérdida, consulta, uso o acceso no autorizado, en cumplimiento del principio de seguridad de la Ley 1581 de 2012.',
        ],
    },
    {
        id: 'menores',
        Icon: LuTriangleAlert,
        title: '9. Tratamiento de Datos de Menores de Edad',
        content: [
            'El tratamiento de datos personales de menores de edad se realizará únicamente con la autorización de sus padres o representantes legales, y garantizando en todo momento el respeto por los derechos prevalentes de los niños, niñas y adolescentes, conforme a la Ley 1098 de 2006 (Código de la Infancia y la Adolescencia) y el artículo 7 de la Ley 1581 de 2012.',
        ],
    },
    {
        id: 'cookies',
        Icon: LuDatabase,
        title: '10. Cookies y Tecnologías de Rastreo',
        content: [
            'Este sitio web puede utilizar cookies técnicas necesarias para su funcionamiento. No se usan cookies de seguimiento publicitario ni se comparte información de navegación con redes publicitarias. Al continuar navegando, el usuario acepta el uso de cookies esenciales.',
        ],
    },
    {
        id: 'vigencia',
        Icon: LuRefreshCw,
        title: '11. Vigencia y Modificaciones',
        content: [
            'La presente Política de Privacidad rige a partir del 2 de abril de 2026. La institución se reserva el derecho de modificarla en cualquier momento para adaptarla a cambios legislativos o institucionales. Las actualizaciones serán publicadas en este mismo sitio.',
            'Para consultas adicionales sobre el tratamiento de sus datos, puede acudir a la Superintendencia de Industria y Comercio (SIC), autoridad colombiana de protección de datos personales.',
        ],
    },
];

export default function PrivacidadPage() {
    return (
        <MainLayout>
            {/* Hero */}
            <section className="relative min-h-[45vh] flex items-center bg-neutral-950 overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-brand-900 rounded-full opacity-30 blur-3xl pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 py-20 relative z-10 w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 bg-brand-600 rounded-xl flex items-center justify-center">
                            <LuShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest">
                            Habeas Data · Ley 1581 de 2012
                        </span>
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-tight mb-5">
                        Política de <span className="gradient-text">Privacidad</span>
                    </h1>
                    <p className="text-lg text-neutral-400 leading-relaxed max-w-xl">
                        Conoce cómo recopilamos, usamos y protegemos tu información personal, en cumplimiento de la legislación colombiana de protección de datos.
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

                    {/* Aviso GDPR-style */}
                    <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 mb-12 flex gap-4">
                        <LuShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-brand-900 mb-1">Compromiso institucional con sus datos</p>
                            <p className="text-sm text-brand-800 leading-relaxed">
                                El Colegio Andrés Avelino reconoce que la protección de datos personales es un derecho fundamental en Colombia. Esta política describe de forma transparente cómo tratamos su información.
                            </p>
                        </div>
                    </div>

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

                                    {sec.extra && (
                                        <p className="text-sm text-neutral-500 leading-relaxed bg-neutral-50 border border-neutral-200 rounded-xl p-4 mt-1">
                                            {sec.extra}
                                        </p>
                                    )}

                                    {/* Tabla de tipos de datos */}
                                    {sec.table && (
                                        <div className="overflow-x-auto mt-2 rounded-xl border border-neutral-200">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-neutral-50 border-b border-neutral-200">
                                                        <th className="text-left px-4 py-3 font-semibold text-neutral-700">Categoría</th>
                                                        <th className="text-left px-4 py-3 font-semibold text-neutral-700">Ejemplos</th>
                                                        <th className="text-left px-4 py-3 font-semibold text-neutral-700">Finalidad</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sec.table.map((row, i) => (
                                                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                                                            <td className="px-4 py-3 font-medium text-neutral-800 align-top">{row.categoria}</td>
                                                            <td className="px-4 py-3 text-neutral-500 align-top">{row.ejemplos}</td>
                                                            <td className="px-4 py-3 text-neutral-500 align-top">{row.finalidad}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Derechos del titular */}
                                    {sec.rights && (
                                        <div className="grid sm:grid-cols-2 gap-3 mt-2">
                                            {sec.rights.map((right, i) => (
                                                <div key={i} className="flex items-start gap-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                                                    <span className="h-6 w-6 bg-brand-100 border border-brand-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-xs font-bold text-brand-700">{i + 1}</span>
                                                    </span>
                                                    <div>
                                                        <span className="font-semibold text-neutral-800">{right.label}: </span>
                                                        <span className="text-neutral-500">{right.desc}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-neutral-100 mt-2" />
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-12 bg-neutral-900 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="h-12 w-12 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <LuMail className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display font-bold text-white mb-1">Ejercer sus derechos de Habeas Data</h3>
                            <p className="text-sm text-neutral-400">
                                Para solicitudes de acceso, rectificación, supresión o revocación de autorización, contáctenos directamente.
                            </p>
                        </div>
                        <Link
                            href="/contacto"
                            className="flex-shrink-0 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors duration-200"
                        >
                            Contactar
                        </Link>
                    </div>

                    {/* Enlace a SIC */}
                    <p className="text-center text-xs text-neutral-400 mt-8 leading-relaxed">
                        Autoridad de protección de datos en Colombia:{' '}
                        <span className="font-semibold text-neutral-500">
                            Superintendencia de Industria y Comercio (SIC)
                        </span>
                        {' '}— sic.gov.co
                    </p>
                </div>
            </section>
        </MainLayout>
    );
}
