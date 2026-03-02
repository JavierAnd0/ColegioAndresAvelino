import Skeleton from '@/components/atoms/Skeleton';

export default function BlogCardSkeleton({ variant = 'vertical' }) {
    if (variant === 'horizontal') {
        return (
            <div className="flex gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                <Skeleton className="w-32 h-24 flex-shrink-0" rounded="lg" />
                <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-4 w-20" rounded="full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        );
    }

    if (variant === 'featured') {
        return (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <Skeleton className="w-full h-56" rounded="sm" />
                <div className="p-5 flex flex-col gap-3">
                    <Skeleton className="h-4 w-24" rounded="full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-7 w-7" rounded="full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-9 w-full mt-1" rounded="md" />
                </div>
            </div>
        );
    }

    // Variante vertical (default)
    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <Skeleton className="w-full h-44" rounded="sm" />
            <div className="p-4 flex flex-col gap-2.5">
                <Skeleton className="h-4 w-20" rounded="full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" rounded="md" />
                </div>
            </div>
        </div>
    );
}