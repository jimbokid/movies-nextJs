import React from 'react';
import Button from './Button';
import { cn } from '@/utils/cn';

type ErrorStateProps = {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
};

export default function ErrorState({
    title = 'Something didn’t load.',
    message = 'Try again or adjust filters.',
    onRetry,
    className,
}: ErrorStateProps) {
    return (
        <div
            className={cn(
                'card-surface p-6 md:p-8 text-center space-y-3 max-w-2xl mx-auto',
                className,
            )}
        >
            <p className="text-caption uppercase tracking-[0.12em] text-amber-200">Heads up</p>
            <h3 className="text-headline">{title}</h3>
            <p className="text-caption">{message}</p>
            {onRetry ? (
                <div className="flex justify-center pt-2">
                    <Button variant="primary" onClick={onRetry}>
                        Retry
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
