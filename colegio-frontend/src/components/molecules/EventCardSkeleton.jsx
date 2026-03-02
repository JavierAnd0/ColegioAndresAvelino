import Skeleton from '@/components/atoms/Skeleton';

export default function EventCardSkeleton({ variant = 'full' }) {
    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                <Skeleton className="w-12 h-12 flex-shrink-0" rounded="lg" />
                <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16" rounded="full" />
            </div>
        );
    }

    // Variante full (default)
    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <Skeleton className="h-1.5 w-full" rounded="sm" />
            <div className="p-5 flex gap-4">
                <Skeleton className="w-16 h-16 flex-shrink-0" rounded="xl" />
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-16" rounded="full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-3 mt-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            </div>
        </div>
    );
}