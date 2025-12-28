import React from 'react';
import Button from './Button';
import { cn } from '@/utils/cn';

type EmptyStateProps = {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
};

export default function EmptyState({
    title,
    message,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'card-surface p-6 md:p-8 text-center space-y-3 max-w-2xl mx-auto',
                className,
            )}
        >
            <p className="text-caption uppercase tracking-[0.12em]">Quiet screen</p>
            <h3 className="text-headline">{title}</h3>
            <p className="text-caption">{message}</p>
            {actionLabel && onAction ? (
                <div className="flex justify-center pt-2">
                    <Button variant="secondary" onClick={onAction}>
                        {actionLabel}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
