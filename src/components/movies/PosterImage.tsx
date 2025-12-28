'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { cn } from '@/utils/cn';

type PosterImageProps = {
    src: string | null;
    alt: string;
    priority?: boolean;
    className?: string;
};

export default function PosterImage({ src, alt, priority, className }: PosterImageProps) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            className={cn(
                'relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--surface-2)] border border-[var(--border)]',
                className,
            )}
        >
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={priority}
                    sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 22vw, 200px"
                    className={cn(
                        'object-cover transition duration-500',
                        loaded ? 'opacity-100' : 'opacity-0',
                    )}
                    onLoadingComplete={() => setLoaded(true)}
                />
            ) : (
                <div className="absolute inset-0 grid place-items-center text-caption text-[var(--text-muted)]">
                    No image
                </div>
            )}
            <div
                className={cn(
                    'absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity duration-500',
                    loaded ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden
            />
        </div>
    );
}
