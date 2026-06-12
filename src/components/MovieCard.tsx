'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MovieItem } from '@/types/dashboard';
import Rating from '@/components/Rating';

interface MovieProps {
    movie: MovieItem;
    type?: string; // e.g. "detail" or "tv"
    priority?: boolean;
}

const MovieCard: React.FC<MovieProps> = ({ movie, type = 'movie', priority = false }) => {
    const title = movie.title || movie.name || movie.original_name;
    const linkHref = `/detail/${type}/${movie.id}`;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

    return (
        <Link href={linkHref} className="group flex flex-col cursor-pointer" prefetch>
            {/* Poster */}
            <div className="aspect-[2/3] relative overflow-hidden rounded-2xl bg-neutral-800 shadow-md group-hover:shadow-lg group-hover:shadow-purple-500/10 transition-all duration-300">
                {movie.poster_path ? (
                    <Image
                        priority={priority}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchPriority={priority ? 'high' : 'auto'}
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt={title}
                        fill
                        sizes="
                            (max-width: 480px) 45vw,
                            (max-width: 768px) 33vw,
                            (max-width: 1200px) 25vw,
                            20vw
                        "
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-neutral-400 text-sm">
                        No Image
                    </div>
                )}
            </div>

            {/* Caption — always visible, works on touch devices too */}
            <div className="mt-2 px-0.5">
                <h3 className="text-sm font-medium text-gray-100 truncate group-hover:text-white transition-colors">
                    {title}
                </h3>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-400">
                    {year && <span>{year}</span>}
                    <Rating value={movie.vote_average} />
                </div>
            </div>
        </Link>
    );
};

export default MovieCard;
