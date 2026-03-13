'use client';
import Badge from '@/components/atoms/Badge';

const categoryConfig = {
    academico: { label: 'Académico', variant: 'info', icon: '📚' },
    valores: { label: 'Valores', variant: 'success', icon: '🌟' },
    reciclaje: { label: 'Reciclaje', variant: 'warning', icon: '♻️' },
};

export default function HonorStudentCard({ studentName, photo, category }) {
    const config = categoryConfig[category] || categoryConfig.academico;

    return (
        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-neutral-100 hover:shadow-md transition-shadow">
            {/* Icono de categoría */}
            <span className="text-2xl">{config.icon}</span>

            {/* Foto */}
            <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-100 flex-shrink-0 ring-2 ring-neutral-200">
                {photo?.url ? (
                    <img
                        src={photo.url}
                        alt={studentName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-neutral-400">
                        👤
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
