'use client';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import { teacherService } from '@/services/teacherService';
import {
    LuGraduationCap, LuHandshake, LuSprout, LuGlobe,
    LuTarget, LuTelescope, LuSun, LuMoon, LuUsers,
    LuAward, LuBookOpen, LuChevronRight,
} from 'react-icons/lu';

const valores = [
    {
        Icon: LuGraduationCap,
        title: 'Excelencia Académica',
        desc: 'Comprometidos con los más altos estándares de calidad educativa y formación integral.',
        accent: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    {
        Icon: LuHandshake,
        title: 'Valores y Ética',
        desc: 'Formamos personas íntegras con principios sólidos que guían su vida y sus decisiones.',
        accent: 'bg-brand-500/10 text-brand-600 border-brand-200',
    },
    {
        Icon: LuSprout,
        title: 'Desarrollo Integral',
        desc: 'Potenciamos las habilidades académicas, sociales y emocionales de cada estudiante.',
        accent: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    },
    {
        Icon: LuGlobe,
        title: 'Compromiso Social',
        desc: 'Educamos ciudadanos responsables con su comunidad, su región y su entorno natural.',
        accent: 'bg-purple-500/10 text-purple-600 border-purple-200',
    },
];

const historia = [
    {
        year: '2000',
        title: 'Fundación',
        text: 'Nace la institución con 120 estudiantes y 8 docentes comprometidos con la educación de calidad en nuestra región.',
    },
    {
        year: '2005',
        title: 'Expansión',
        text: 'Apertura de la sección de bachillerato y ampliación de la planta física, consolidando la educación básica y media.',
    },
    {
        year: '2015',
        title: 'Reconocimiento',
        text: 'Obtención del reconocimiento como institución de alto desempeño académico a nivel departamental.',
    },
    {
        year: '2024',
        title: 'Hoy',
        text: 'Más de 500 estudiantes y 40 docentes, con egresados destacados en universidades del país y el exterior.',
    },
];

export default function NosotrosPage() {
    const [jornada, setJornada] = useState('manana');
    const [teachers, setTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(true);

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoadingTeachers(true);
            try {
                const res = await teacherService.getAll(jornada);
                setTeachers(res.data?.data || []);
            } catch {
                setTeachers([]);
            } finally {
                setLoadingTeachers(false);
            }
        };
        fetchTeachers();
    }, [jornada]);

    return (
        <MainLayout>

            {/* ── Hero ── */}
            <section className="relative min-h-[60vh] flex items-center bg-neutral-950 overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-900 rounded-full opacity-30 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-yellow-900 rounded-full opacity-20 blur-3xl pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 py-24 relative z-10 w-full">
                    <div className="max-w-3xl">
                        <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest block mb-4">
                            Quiénes somos
                        </span>
                        <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-tight mb-6">
                            Más de 25 años<br />
                            <span className="gradient-text">formando líderes</span>
                        </h1>
                        <p className="text-lg text-neutral-400 leading-relaxed max-w-xl">
                            Construimos el futuro de nuestra comunidad con valores sólidos, excelencia académica y compromiso social inquebrantable.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/10">
                            {[
                                { Icon: LuUsers, value: '+500', label: 'Estudiantes activos' },
                                { Icon: LuGraduationCap, value: '+40', label: 'Docentes calificados' },
                                { Icon: LuAward, value: '25+', label: 'Años de trayectoria' },
                            ].map((s) => (
                                <div key={s.label} className="flex flex-col gap-2">
                                    <s.Icon className="w-5 h-5 text-brand-400" />
                                    <span className="font-display text-3xl font-black text-white">{s.value}</span>
                                    <span className="text-xs text-neutral-500 leading-snug">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wave bottom */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-[0]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full fill-white">
                        <path d="M0,60 L0,30 C360,0 720,60 1080,30 C1260,15 1380,30 1440,20 L1440,60 Z" />
                    </svg>
                </div>
            </section>

            {/* ── Misión y Visión ── */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest block mb-3">
                            Propósito institucional
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-neutral-900">
                            Misión y Visión
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Misión */}
                        <div className="group relative bg-white rounded-3xl p-8 border border-neutral-200 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-50 transition-all duration-300">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-brand-400 rounded-t-3xl" />
                            <div className="h-14 w-14 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-center mb-6">
                                <LuTarget className="w-7 h-7 text-brand-600" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-neutral-900 mb-4">Misión</h3>
                            <p className="text-neutral-500 leading-relaxed">
                                Formar ciudadanos íntegros, críticos y competentes mediante una educación de calidad que desarrolle sus dimensiones cognitiva, social, ética y espiritual, para que contribuyan positivamente a la transformación de su entorno.
                            </p>
                        </div>

                        {/* Visión */}
                        <div className="group relative bg-brand-900 rounded-3xl p-8 overflow-hidden">
                            <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-t-3xl" />
                            <div className="relative">
                                <div className="h-14 w-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-6">
                                    <LuTelescope className="w-7 h-7 text-yellow-400" />
                                </div>
                                <h3 className="font-display text-2xl font-bold text-white mb-4">Visión</h3>
                                <p className="text-brand-200 leading-relaxed">
                                    Para 2030 ser reconocidos como una institución educativa líder en la región, destacada por la excelencia académica, la innovación pedagógica y la formación en valores, generando egresados que impacten positivamente a la sociedad.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Valores ── */}
            <section className="py-20 bg-neutral-50 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-14">
                        <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest block mb-3">
                            Pilares
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-neutral-900">
                            Nuestros Valores
                        </h2>
                        <p className="text-neutral-500 mt-4 max-w-xl mx-auto">
                            Los principios que guían nuestra labor educativa y definen quiénes somos cada día.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {valores.map((valor) => (
                            <div
                                key={valor.title}
                                className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-neutral-200/80
                                    hover:border-neutral-300 hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className={`h-12 w-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${valor.accent}`}>
                                    <valor.Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-display font-bold text-neutral-900 mb-2">{valor.title}</h4>
                                    <p className="text-sm text-neutral-500 leading-relaxed">{valor.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Historia ── */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest block mb-3">
                            Trayectoria
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-neutral-900">
                            Nuestra Historia
                        </h2>
                    </div>

                    <div className="relative">
                        {/* Línea vertical */}
                        <div className="absolute left-[3.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-brand-500 via-brand-400 to-yellow-400 hidden sm:block" />

                        <div className="flex flex-col gap-0">
                            {historia.map((item, i) => (
                                <div key={item.year} className="relative flex items-start gap-6 sm:gap-10 pb-10 last:pb-0">
                                    {/* Año */}
                                    <div className="flex-shrink-0 w-24 sm:w-28 flex flex-col items-center gap-2">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-display font-black text-xs z-10 relative
                                            ${i === historia.length - 1 ? 'bg-yellow-400 text-yellow-900' : 'bg-brand-600 text-white'}`}>
                                            {item.year}
                                        </div>
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1 pt-2.5 pb-8">
                                        <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest">
                                            {item.title}
                                        </span>
                                        <p className="text-neutral-600 leading-relaxed mt-1.5">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Equipo ── */}
            <section className="py-20 bg-neutral-950 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 pointer-events-none leading-[0]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" className="w-full fill-white -scale-y-100">
                        <path d="M0,60 L0,30 C360,0 720,60 1080,30 C1260,15 1380,30 1440,20 L1440,60 Z" />
                    </svg>
                </div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-12">
                        <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest block mb-3">
                            Talento humano
                        </span>
                        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                            Nuestro Equipo
                        </h2>
                        <p className="text-neutral-400 max-w-xl mx-auto">
                            Las personas comprometidas que hacen posible nuestra labor educativa día a día.
                        </p>
                    </div>

                    {/* Selector de jornada */}
                    <div className="flex justify-center mb-10">
                        <div className="inline-flex bg-white/5 border border-white/10 rounded-xl p-1">
                            {[
                                { key: 'manana', label: 'Jornada Mañana', Icon: LuSun },
                                { key: 'tarde', label: 'Jornada Tarde', Icon: LuMoon },
                            ].map((j) => (
                                <button
                                    key={j.key}
                                    onClick={() => setJornada(j.key)}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2
                                        ${jornada === j.key
                                            ? 'bg-white text-neutral-900 shadow-lg'
                                            : 'text-neutral-400 hover:text-white'
                                        }`}
                                >
                                    <j.Icon className="w-4 h-4" />
                                    {j.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid de docentes */}
                    {loadingTeachers ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-white/5 rounded-2xl h-40 animate-pulse" />
                            ))}
                        </div>
                    ) : teachers.length === 0 ? (
                        <div className="text-center py-16">
                            <LuUsers className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                            <p className="text-neutral-500">No hay docentes registrados para esta jornada.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {teachers.map((teacher) => (
                                <div
                                    key={teacher._id}
                                    className="group bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-3
                                        text-center hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                                >
                                    {teacher.photo?.url ? (
                                        <img
                                            src={teacher.photo.url}
                                            alt={teacher.name}
                                            className="h-20 w-20 rounded-2xl object-cover border-2 border-white/10 group-hover:border-brand-400/50 transition-colors"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center">
                                            <span className="font-display text-white font-black text-2xl">
                                                {teacher.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-display font-semibold text-white text-sm leading-snug">{teacher.name}</p>
                                        {teacher.cargo && (
                                            <p className="text-xs text-neutral-500 mt-0.5">{teacher.cargo}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

        </MainLayout>
    );
}
