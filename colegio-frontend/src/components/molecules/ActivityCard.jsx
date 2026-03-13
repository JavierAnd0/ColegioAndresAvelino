import Badge from '@/components/atoms/Badge';

const typeConfig = {
    cuento: { label: 'Cuento', variant: 'info', icon: BookIcon },
    colorear: { label: 'Colorear', variant: 'warning', icon: PaletteIcon },
    numeros: { label: 'Números', variant: 'success', icon: HashIcon },
    rompecabezas: { label: 'Rompecabezas', variant: 'default', icon: PuzzleIcon },
    juego: { label: 'Juego', variant: 'danger', icon: GameIcon },
    lectura: { label: 'Lectura', variant: 'info', icon: ReadIcon },
    otro: { label: 'Otro', variant: 'default', icon: StarIcon },
};

const gradeLabels = {
    0: 'Pre',
    1: '1°',
    2: '2°',
    3: '3°',
    4: '4°',
    5: '5°',
    6: '6°',
    7: '7°',
    8: '8°',
    9: '9°',
    10: '10°',
    11: '11°',
};

/* --- SVG Icons --- */
function BookIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
    );
}

function PaletteIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
    );
}

function HashIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="8" y2="21" />
            <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
    );
}

function PuzzleIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 01-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 10-3.214 3.214c.446.166.855.497.925.968a.979.979 0 01-.276.837l-1.61 1.61a2.404 2.404 0 01-1.705.707 2.402 2.402 0 01-1.704-.706l-1.568-1.568a1.026 1.026 0 00-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 11-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 00-.289-.877l-1.568-1.568A2.402 2.402 0 011.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 103.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0112 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 113.237 3.237c-.464.18-.894.527-.967 1.02z" />
        </svg>
    );
}

function GameIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="11" x2="10" y2="11" />
            <line x1="8" y1="9" x2="8" y2="13" />
            <line x1="15" y1="12" x2="15.01" y2="12" />
            <line x1="18" y1="10" x2="18.01" y2="10" />
            <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0017.32 5z" />
        </svg>
    );
}

function ReadIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
    );
}

function StarIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}

export default function ActivityCard({ activity }) {
    const { title, description, type, targetGrades, externalUrl, imageUrl, source, isNew } = activity;
    const config = typeConfig[type] || typeConfig.otro;
    const IconComponent = config.icon;

    return (
        <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white rounded-xl border border-neutral-200/60
                hover:border-neutral-300 hover:shadow-md transition-all duration-200 overflow-hidden h-full"
        >
            {/* Imagen o placeholder */}
            <div className="relative h-36 bg-neutral-100 overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                        <IconComponent className="h-12 w-12 text-neutral-300" />
                    </div>
                )}

                {/* Badge "Nuevo" */}
                {isNew && (
                    <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 text-[0.6rem] font-mono font-bold uppercase bg-green-500 text-white rounded-full">
                            Nuevo
                        </span>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-4 flex flex-col gap-2">
                {/* Tipo badge */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={config.variant} size="sm">{config.label}</Badge>
                    {targetGrades.length > 0 && targetGrades.length <= 3 && (
                        targetGrades.map((g) => (
                            <Badge key={g} variant="default" size="sm">{gradeLabels[g] || `${g}°`}</Badge>
                        ))
                    )}
                    {targetGrades.length > 3 && (
                        <Badge variant="default" size="sm">{targetGrades.length} grados</Badge>
                    )}
                </div>

                {/* Título */}
                <h3 className="font-semibold text-sm text-neutral-900 leading-snug line-clamp-2
                    group-hover:text-neutral-600 transition-colors">
                    {title}
                </h3>

                {/* Descripción */}
                {description && (
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                        {description}
                    </p>
                )}

                {/* Source */}
                {source && (
                    <p className="text-[0.65rem] text-neutral-400 mt-auto pt-1 truncate">
                        {source}
                    </p>
                )}
            </div>
        </a>
    );
}
