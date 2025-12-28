import { cn } from '@/utils/cn';
import React from 'react';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export default function Skeleton({ className, ...rest }: SkeletonProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-lg bg-[color-mix(in_srgb,var(--surface-2)_70%,transparent)]',
                'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-[shimmer_1.6s_infinite]',
                className,
            )}
            {...rest}
        />
    );
}
