import { cn } from '@/utils/cn';
import React from 'react';

type BadgeProps = {
    children: React.ReactNode;
    variant?: 'default' | 'accent' | 'muted';
    className?: string;
};

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]',
    accent: 'bg-[color-mix(in_srgb,var(--accent)_25%,transparent)] text-[var(--text)] border border-[color-mix(in_srgb,var(--accent)_40%,transparent)]',
    muted: 'bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] text-[var(--text-muted)] border border-[var(--border)]',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium tracking-tight',
                variantStyles[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}
