'use client';
import EventCard from '@/components/molecules/EventCard';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';

export default function EventDetailPanel({ date, events = [], onClose }) {
    if (!date) return null;

    const formatted = new Date(date).toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    return (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-in slide-in-from-top-2">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50">
                <div>
                    <Paragraph size="sm" color="muted" className="font-mono uppercase tracking-wide text-[0.7rem]">
                        Eventos del día
                    </Paragraph>
                    <Heading level="h5" className="capitalize">{formatted}</Heading>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>

            {/* Contenido */}
            <div className="p-5">
                {events.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="text-3xl block mb-2">📭</span>
                        <Paragraph color="muted">Sin eventos programados para este día.</Paragraph>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {events.map((event) => (
                            <EventCard key={event._id} event={event} variant="compact" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
