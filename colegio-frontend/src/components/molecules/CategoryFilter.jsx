'use client';

export default function CategoryFilter({
    categories = [],
    activeCategory = 'all',
    onCategoryChange,
    className = '',
}) {
    const allCategories = [{ value: 'all', label: 'Todos' }, ...categories];

    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {allCategories.map((cat) => (
                <button
                    key={cat.value}
                    onClick={() => onCategoryChange?.(cat.value)}
                    className={`
            px-4 py-1.5 rounded-full text-sm font-medium
            transition-all duration-200 cursor-pointer
            ${activeCategory === cat.value
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                        }
          `}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
}