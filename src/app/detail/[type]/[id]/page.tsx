import Image from 'next/image';
import { MovieDetail } from '@/services/movie';
import { MovieDetailPayload } from '@/types/movie';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import { Metadata } from 'next';
import CuratorEntryButton from '@/components/curator/CuratorEntryButton';
import CuratorQuickChips from '@/components/curator/CuratorQuickChips';
import { curatorUrlFromMovie } from '@/lib/curatorLink';
import PosterImage from '@/components/movies/PosterImage';
import Badge from '@/components/ui/Badge';
import MovieGrid from '@/components/movies/MovieGrid';

interface MovieDetailPageProps {
    params: Promise<{
        id: string;
        type: string;
    }>;
}

export async function generateMetadata({ params }: MovieDetailPageProps): Promise<Metadata> {
    const { id, type } = await params;

    const data: MovieDetailPayload = await MovieDetail.getMovieDetail(id, type);

    const movie = data.data;

    if (!movie) {
        return {
            title: 'Movie not found | CineView',
            description: 'Sorry, this movie could not be found.',
        };
    }

    return {
        title: `${movie.title} | CineView`,
        description: movie.overview,
        openGraph: {
            title: `${movie.title} | CineView`,
            description: movie.overview,
            images: [
                {
                    url: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`, // absolute URL required
                    width: 800,
                    height: 1200,
                    alt: movie.title,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: movie.title,
            description: movie.overview,
            images: [`https://image.tmdb.org/t/p/original${movie.backdrop_path}`],
        },
    };
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
    const { id, type } = await params;

    const data: MovieDetailPayload = await MovieDetail.getMovieDetail(id, type);

    const movie = data.data;
    const curatorHref = curatorUrlFromMovie({ from: 'movie' });
    const title = movie.title || movie.original_name;
    const releaseYear =
        movie.release_date || movie.first_air_date
            ? new Date(movie.release_date || movie.first_air_date || '').getFullYear()
            : null;
    const runtime =
        movie.runtime || movie.episode_run_time?.[0]
            ? `${movie.runtime || movie.episode_run_time?.[0]} min`
            : null;
    const rating =
        typeof movie.vote_average === 'number' && movie.vote_average > 0
            ? movie.vote_average.toFixed(1)
            : null;
    const posterSrc = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;
    const backdropSrc = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null;
    const trailer = data.videos.results[0];

    return (
        <div className="space-y-10 pb-10">
            <section className="relative isolate overflow-hidden">
                {backdropSrc ? (
                    <div className="absolute inset-0 opacity-30">
                        <Image
                            src={backdropSrc}
                            alt={title}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-[var(--bg)]/70 to-[var(--bg)]" />
                    </div>
                ) : null}
                <div className="page-shell relative py-8 md:py-10">
                    <div className="grid gap-8 lg:grid-cols-[320px,1fr] lg:items-start">
                        <PosterImage src={posterSrc} alt={title} priority className="rounded-2xl" />
                        <div className="space-y-4">
                            <p className="text-caption uppercase tracking-[0.18em] text-[var(--accent-2)]">
                                Feature
                            </p>
                            <h1 className="text-display">{title}</h1>
                            {movie.tagline && (
                                <p className="text-headline text-[var(--text-muted)]">
                                    “{movie.tagline}”
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-caption">
                                {releaseYear && <span>{releaseYear}</span>}
                                {runtime && (
                                    <>
                                        <span aria-hidden>•</span>
                                        <span>{runtime}</span>
                                    </>
                                )}
                                {rating && (
                                    <>
                                        <span aria-hidden>•</span>
                                        <span>⭐ {rating}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {movie.genres.map(g => (
                                    <Badge key={g.id} variant="default">
                                        {g.name}
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-3 pt-2">
                                {trailer ? (
                                    <a
                                        className="inline-flex"
                                        href={`https://www.youtube.com/watch?v=${trailer.key}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Badge variant="accent">Watch trailer ↗</Badge>
                                    </a>
                                ) : null}
                                <CuratorEntryButton
                                    href={curatorHref}
                                    variant="secondary"
                                    size="sm"
                                    ariaLabel="Open Curator for this movie"
                                >
                                    Open Curator
                                </CuratorEntryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="page-shell space-y-8">
                <div className="card-surface p-6 md:p-7 space-y-3">
                    <h2 className="text-headline">Overview</h2>
                    <p className="text-body text-[var(--text-muted)]">{movie.overview}</p>
                </div>

                {data.keywords && data.keywords.length > 0 && (
                    <div className="card-surface p-6 md:p-7 space-y-4">
                        <h2 className="text-headline">Keywords</h2>
                        <div className="flex flex-wrap gap-2">
                            {data.keywords.map(keyword => (
                                <Badge key={keyword.id} variant="muted">
                                    {keyword.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {trailer && (
                    <div className="card-surface overflow-hidden">
                        <div className="aspect-video w-full bg-[var(--surface-2)]">
                            <iframe
                                src={`https://www.youtube.com/embed/${trailer.key}`}
                                title={trailer.name}
                                allowFullScreen
                                className="h-full w-full"
                            />
                        </div>
                    </div>
                )}

                {data.credits.cast.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-headline">Cast</h2>
                            <span className="text-caption">Top billed</span>
                        </div>
                        <div className="flex overflow-x-auto gap-4 pb-2">
                            {data.credits.cast.slice(0, 15).map(actor => (
                                <Link
                                    href={`/person/${actor.id}`}
                                    key={actor.id}
                                    className="flex-shrink-0 w-32 text-center"
                                >
                                    <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                                        {actor.profile_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                                                alt={actor.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="grid h-full w-full place-items-center text-caption text-[var(--text-muted)]">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm font-semibold">{actor.name}</p>
                                    <p className="text-caption">{actor.character}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="card-surface p-6 md:p-7 space-y-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <p className="text-caption uppercase tracking-[0.18em] text-[var(--accent-2)]">
                                Curator
                            </p>
                            <h2 className="text-headline">More like this</h2>
                            <p className="text-caption">
                                Jump into Curator with this movie as the starting point.
                            </p>
                        </div>
                        <CuratorEntryButton
                            href={curatorHref}
                            variant="primary"
                            size="sm"
                            ariaLabel="Open Curator for this movie"
                        >
                            Open Curator
                        </CuratorEntryButton>
                    </div>
                    <CuratorQuickChips source="movie" className="mt-2" />
                </div>

                {data.similar.results.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-headline">Similar titles</h2>
                        <MovieGrid>
                            {data.similar.results.slice(0, 12).map(similar => (
                                <MovieCard
                                    key={`${similar.id}-${similar.title}`}
                                    movie={similar}
                                />
                            ))}
                        </MovieGrid>
                    </div>
                )}
            </div>
        </div>
    );
}
