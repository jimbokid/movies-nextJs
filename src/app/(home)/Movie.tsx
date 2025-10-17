'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MovieItem } from "@/types/dashboard";

interface MovieProps {
    movie: MovieItem;
    type?: string; // e.g. "detail" or "tv"
}

const Movie: React.FC<MovieProps> = ({ movie, type = "movie" }) => {
    const title = movie.title || movie.name || movie.original_name;
    const linkHref = `/detail/${type}/${movie.id}`;

    return (
        <Link
            href={linkHref}
            className="group aspect-[2/3] relative overflow-hidden rounded-2xl bg-neutral-800 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
            {/* Poster */}
            <div className="relative w-full h-full">
                {movie.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-neutral-400 text-sm">
                        No Image
                    </div>
                )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-lg font-semibold truncate">{title}</h3>
                <p className="text-sm text-neutral-300 mt-1">⭐ {movie.vote_average.toFixed(1)}</p>
            </div>
        </Link>
    );
};

export default Movie;
