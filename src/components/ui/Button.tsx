import React from 'react';
import { cn } from '@/utils/cn';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
};

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
        'bg-[var(--accent)] text-[var(--bg)] border border-transparent hover:brightness-110 shadow-[0_12px_30px_rgba(143,136,255,0.35)]',
    secondary:
        'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:border-[color-mix(in_srgb,var(--accent)_30%,transparent)]',
    ghost:
        'bg-transparent text-[var(--text)] border border-transparent hover:border-[var(--border)]',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    className,
    disabled,
    children,
    ...rest
}: ButtonProps) {
    return (
        <button
            type="button"
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]',
                'active:translate-y-[1px]',
                sizeStyles[size],
                variantStyles[variant],
                disabled && 'opacity-60 cursor-not-allowed shadow-none',
                className,
            )}
            disabled={disabled}
            {...rest}
        >
            {children}
        </button>
    );
}
