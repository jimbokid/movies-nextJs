import { cn } from '@/utils/cn';
import React from 'react';

type PageHeaderProps = {
    title: string;
    subtitle?: string;
    rightSlot?: React.ReactNode;
    className?: string;
};

export default function PageHeader({ title, subtitle, rightSlot, className }: PageHeaderProps) {
    return (
        <div
            className={cn(
                'page-shell pb-4 md:pb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between',
                className,
            )}
        >
            <div className="space-y-2">
                <h1 className="text-display">{title}</h1>
                {subtitle ? <p className="text-caption max-w-2xl">{subtitle}</p> : null}
            </div>
            {rightSlot ? <div className="flex-shrink-0">{rightSlot}</div> : null}
        </div>
    );
}
