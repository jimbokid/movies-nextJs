import React from 'react';
import { cn } from '@/utils/cn';

type MovieGridProps = {
    children: React.ReactNode;
    className?: string;
};

export default function MovieGrid({ children, className }: MovieGridProps) {
    return (
        <div
            className={cn(
                'grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
                className,
            )}
        >
            {children}
        </div>
    );
}
