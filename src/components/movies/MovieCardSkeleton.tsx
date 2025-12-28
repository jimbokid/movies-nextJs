import Skeleton from '@/components/ui/Skeleton';
import React from 'react';

export default function MovieCardSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="aspect-[2/3] rounded-xl" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
    );
}
