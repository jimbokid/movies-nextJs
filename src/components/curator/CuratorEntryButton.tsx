import Link from 'next/link';
import { ReactNode, MouseEventHandler } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md';

interface CuratorEntryButtonProps {
    href: string;
    variant?: Variant;
    size?: Size;
    children: ReactNode;
    className?: string;
    ariaLabel?: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}

const variantClasses: Record<Variant, string> = {
    primary:
        'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-[0_10px_40px_rgba(124,58,237,0.35)] hover:shadow-[0_14px_50px_rgba(124,58,237,0.45)]',
    secondary:
        'border border-white/10 bg-white/5 text-white hover:border-purple-300/60 hover:bg-purple-500/10',
    ghost: 'text-purple-100 hover:text-white hover:underline underline-offset-4',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-base',
};

export default function CuratorEntryButton({
    href,
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ariaLabel,
    onClick,
}: CuratorEntryButtonProps) {
    const baseClasses =
        'inline-flex items-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400';

    return (
        <Link
            href={href}
            aria-label={ariaLabel}
            onClick={event => {
                onClick?.(event);
                // TODO: hook up analytics event (curator_entry_click) with params from href when analytics is available.
            }}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {children}
        </Link>
    );
}
