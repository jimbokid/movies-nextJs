'use client';

import React from 'react';
import Link from 'next/link';
import { MovieItem } from '@/types/dashboard';
import PosterImage from './movies/PosterImage';
import Badge from './ui/Badge';
import { cn } from '@/utils/cn';

interface MovieProps {
    movie: MovieItem;
    type?: string; // e.g. "detail" or "tv"
    priority?: boolean;
}

const MovieCard: React.FC<MovieProps> = ({ movie, type = 'movie', priority = false }) => {
    const title = movie.title || movie.name || movie.original_name;
    const linkHref = `/detail/${type}/${movie.id}`;
    const year =
        movie.release_date || movie.first_air_date
            ? new Date(movie.release_date || movie.first_air_date || '').getFullYear()
            : null;
    const rating =
        typeof movie.vote_average === 'number' && movie.vote_average > 0
            ? movie.vote_average.toFixed(1)
            : null;
    const posterSrc = movie.poster_path
        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
        : null;

    return (
        <Link
            href={linkHref}
            className={cn(
                'group relative flex h-full flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm transition-transform duration-200',
                'hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]',
            )}
            prefetch
            aria-label={title}
        >
            <PosterImage src={posterSrc} alt={title} priority={priority} />

            <div className="flex items-start gap-3 px-1 pb-1">
                <div className="space-y-1">
                    <p className="text-caption">{year ?? '—'}</p>
                    <h3 className="text-body font-semibold leading-tight line-clamp-2">{title}</h3>
                </div>
                {rating ? (
                    <Badge variant="accent" className="ml-auto">
                        ⭐ {rating}
                    </Badge>
                ) : null}
            </div>
        </Link>
    );
};

export default MovieCard;
