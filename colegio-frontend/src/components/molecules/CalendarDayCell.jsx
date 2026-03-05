'use client';

const categoryColors = {
    academico: 'bg-blue-500',
    deportivo: 'bg-green-500',
    cultural: 'bg-yellow-500',
    reunion: 'bg-neutral-500',
    festivo: 'bg-red-500',
    otro: 'bg-neutral-400',
};

export default function CalendarDayCell({
    day,
    isCurrentMonth = true,
    isToday = false,
    isSelected = false,
    events = [],
    onClick,
}) {
    if (!day) {
        return <div className="min-h-[80px] sm:min-h-[100px] bg-neutral-50/50" />;
    }

    const hasEvents = events.length > 0;
    const visibleDots = events.slice(0, 3);
    const extraCount = events.length - 3;

    return (
        <button
            onClick={() => onClick?.(day)}
            className={`
                min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 flex flex-col items-start
                border border-neutral-100 transition-all duration-150 cursor-pointer text-left
                ${!isCurrentMonth ? 'bg-neutral-50 opacity-40' : 'bg-white hover:bg-neutral-50'}
                ${isSelected ? 'ring-2 ring-neutral-900 bg-neutral-50 z-10' : ''}
                ${isToday && !isSelected ? 'bg-blue-50/50' : ''}
            `}
        >
            {/* Número del día */}
            <span className={`
                font-mono text-sm font-semibold leading-none
                ${isToday ? 'bg-neutral-900 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}
                ${!isCurrentMonth ? 'text-neutral-300' : 'text-neutral-700'}
                ${isSelected && !isToday ? 'text-neutral-900 font-bold' : ''}
            `}>
                {day}
            </span>

            {/* Dots de eventos */}
            {hasEvents && (
                <div className="flex flex-wrap gap-0.5 mt-auto pt-1">
                    {visibleDots.map((event, i) => (
                        <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${categoryColors[event.category] || 'bg-neutral-400'}`}
                            title={event.title}
                        />
                    ))}
                    {extraCount > 0 && (
                        <span className="text-[0.55rem] font-mono text-neutral-400 leading-none ml-0.5">
                            +{extraCount}
                        </span>
                    )}
                </div>
            )}
        </button>
    );
}
