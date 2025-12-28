import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function MovieDetailSkeleton() {
    return (
        <div className="page-shell space-y-8">
            <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
                <Skeleton className="aspect-[2/3] rounded-2xl" />
                <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                    <div className="flex gap-3">
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-28 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <Skeleton key={idx} className="h-4 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-28 rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
