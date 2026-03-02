import Badge from '@/components/atoms/Badge';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';

const categoryVariants = {
    academico: 'info',
    deportivo: 'success',
    cultural: 'warning',
    reunion: 'default',
    festivo: 'danger',
    otro: 'default',
};

const categoryLabels = {
    academico: 'Académico',
    deportivo: 'Deportivo',
    cultural: 'Cultural',
    reunion: 'Reunión',
    festivo: 'Festivo',
    otro: 'Otro',
};

const formatDate = (date) => {
    const d = new Date(date);
    return {
        day: d.getDate().toString().padStart(2, '0'),
        month: d.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase(),
        time: d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };
};

export default function EventCard({ event, variant = 'full' }) {
    const { title, description, startDate, endDate, category, location, color } = event;
    const start = formatDate(startDate);

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200 hover:shadow-sm transition-shadow duration-200">
                {/* Bloque de fecha */}
                <div
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: color || '#171717' }}
                >
                    <span className="text-white text-lg font-bold leading-none">{start.day}</span>
                    <span className="text-white text-xs leading-none opacity-90">{start.month}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <Heading level="h6" className="line-clamp-1">{title}</Heading>
                    {location && (
                        <Paragraph size="sm" color="muted" className="line-clamp-1">
                            📍 {location}
                        </Paragraph>
                    )}
                </div>
                <Badge variant={categoryVariants[category] || 'default'} size="sm">
                    {categoryLabels[category] || category}
                </Badge>
            </div>
        );
    }

    // Variante full (default)
    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Barra de color superior */}
            <div className="h-1.5 w-full" style={{ backgroundColor: color || '#171717' }} />
            <div className="p-5 flex gap-4">
                {/* Bloque de fecha */}
                <div
                    className="flex flex-col items-center justify-center w-16 h-16 rounded-xl flex-shrink-0"
                    style={{ backgroundColor: color || '#171717' }}
                >
                    <span className="text-white text-2xl font-bold leading-none">{start.day}</span>
                    <span className="text-white text-xs leading-none opacity-90 mt-0.5">{start.month}</span>
                </div>
                {/* Contenido */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <Heading level="h5" className="line-clamp-2 flex-1">{title}</Heading>
                        <Badge variant={categoryVariants[category] || 'default'} size="sm" className="flex-shrink-0">
                            {categoryLabels[category] || category}
                        </Badge>
                    </div>
                    {description && (
                        <Paragraph size="sm" color="muted" className="line-clamp-2">{description}</Paragraph>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-auto">
                        <Paragraph size="sm" color="muted">
                            🕐 {start.time}
                        </Paragraph>
                        {location && (
                            <Paragraph size="sm" color="muted">
                                📍 {location}
                            </Paragraph>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}