import React from 'react';
import MovieCardSkeleton from './MovieCardSkeleton';
import MovieGrid from './MovieGrid';

type MovieGridSkeletonProps = {
    count?: number;
};

export default function MovieGridSkeleton({ count = 12 }: MovieGridSkeletonProps) {
    return (
        <MovieGrid>
            {Array.from({ length: count }).map((_, idx) => (
                <MovieCardSkeleton key={idx} />
            ))}
        </MovieGrid>
    );
}
