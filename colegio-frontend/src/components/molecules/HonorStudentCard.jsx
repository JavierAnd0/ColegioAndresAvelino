'use client';
import Badge from '@/components/atoms/Badge';
import { LuBookOpen, LuStar, LuRecycle, LuUser } from 'react-icons/lu';

const categoryConfig = {
    academico: { label: 'Académico', variant: 'info', Icon: LuBookOpen },
    valores: { label: 'Valores', variant: 'success', Icon: LuStar },
    reciclaje: { label: 'Reciclaje', variant: 'warning', Icon: LuRecycle },
};

export default function HonorStudentCard({ studentName, photo, category }) {
    const config = categoryConfig[category] || categoryConfig.academico;

    return (
        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-neutral-100 hover:shadow-md transition-shadow">
            {/* Icono de categoría */}
            <config.Icon className="w-6 h-6 text-neutral-600" />

            {/* Foto */}
            <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0 ring-2 ring-neutral-200">
                {photo?.url ? (
                    <img
                        src={photo.url}
                        alt={studentName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <LuUser className="w-8 h-8" />
                    </div>
                )}
            </div>

            {/* Nombre */}
            <p className="font-semibold text-sm text-neutral-900 text-center leading-tight">
                {studentName}
            </p>

            {/* Badge de categoría */}
            <Badge variant={config.variant} size="sm">
                {config.label}
            </Badge>
        </div>
    );
}
