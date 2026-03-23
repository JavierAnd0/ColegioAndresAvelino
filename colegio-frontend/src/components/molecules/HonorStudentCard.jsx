'use client';
import { LuBookOpen, LuStar, LuLeaf, LuUser } from 'react-icons/lu';

const categoryConfig = {
    academico: {
        label: 'Mejor Académico',
        Icon: LuBookOpen,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-500',
        avatarRing: 'ring-blue-200',
        dot: 'bg-blue-400',
    },
    valores: {
        label: 'Mejor en Valores',
        Icon: LuStar,
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-500',
        avatarRing: 'ring-yellow-200',
        dot: 'bg-yellow-400',
    },
    reciclaje: {
        label: 'Mejor en Reciclaje',
        Icon: LuLeaf,
        bg: 'bg-brand-50',
        border: 'border-brand-200',
        badge: 'bg-brand-100 text-brand-700 border-brand-200',
        iconBg: 'bg-brand-100',
        iconColor: 'text-brand-600',
        avatarRing: 'ring-brand-200',
        dot: 'bg-brand-500',
    },
};

export default function HonorStudentCard({ studentName, photo, category }) {
    const cfg = categoryConfig[category] || categoryConfig.academico;
    const Icon = cfg.Icon;

    return (
        <div className={`relative flex flex-col items-center gap-4 p-6 rounded-2xl border
            ${cfg.bg} ${cfg.border} hover:shadow-lg transition-all duration-300 group`}>

            <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${cfg.dot}`} />

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
                <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
            </div>

            <div className={`w-28 h-28 rounded-2xl overflow-hidden ring-4 ${cfg.avatarRing}
                bg-white flex-shrink-0 shadow-md group-hover:scale-[1.02] transition-transform duration-300`}>
                {photo?.url ? (
                    <img
                        src={photo.url}
                        alt={studentName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white">
                        <LuUser className="w-12 h-12 text-neutral-300" />
                    </div>
                )}
            </div>

            <div className="text-center space-y-1.5">
                <p className="font-display font-bold text-neutral-900 text-base leading-snug">
                    {studentName}
                </p>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.6rem] font-mono font-bold
                    uppercase tracking-widest border ${cfg.badge}`}>
                    {cfg.label}
                </span>
            </div>
        </div>
    );
}
