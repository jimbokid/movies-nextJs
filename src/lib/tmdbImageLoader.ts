'use client';

import type { ImageLoaderProps } from 'next/image';

// Serve TMDB images straight from TMDB's CDN at the closest pre-rendered width,
// instead of routing every image through Vercel Image Optimization (/_next/image),
// which has a monthly cap on the Hobby plan.
const TMDB_PREFIX = 'https://image.tmdb.org/t/p/';

// Sizes TMDB serves for posters, backdrops and profiles alike.
// Capped at w1280: `original` files can be several MB.
const TMDB_WIDTHS = [92, 154, 185, 300, 342, 500, 780, 1280];

export default function tmdbImageLoader({ src, width }: ImageLoaderProps): string {
    if (!src.startsWith(TMDB_PREFIX)) {
        // Local/static assets: no resizing service, but keep the URL width-specific for next/image.
        return `${src}${src.includes('?') ? '&' : '?'}w=${width}`;
    }

    // src looks like https://image.tmdb.org/t/p/<size>/<file>.jpg — swap the size segment.
    const filePath = src.slice(TMDB_PREFIX.length).replace(/^[^/]+/, '');
    const size = TMDB_WIDTHS.find(w => w >= width) ?? TMDB_WIDTHS[TMDB_WIDTHS.length - 1];

    return `${TMDB_PREFIX}w${size}${filePath}`;
}
