import Image from 'next/image';
import { MovieDetail } from '@/services/movie';
import { MovieDetailPayload } from '@/types/movie';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import { Metadata } from 'next';
import CuratorEntryButton from '@/components/curator/CuratorEntryButton';
import CuratorQuickChips from '@/components/curator/CuratorQuickChips';
import { curatorUrlFromMovie } from '@/lib/curatorLink';
import WhereToWatch from '@/features/watch/ui/WhereToWatch';

interface MovieDetailPageProps {
    params: Promise<{
        id: string;
        type: string;
    }>;
    searchParams?: Promise<{
        [key: string]: string | string[] | undefined;
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

export default async function MovieDetailPage({ params, searchParams }: MovieDetailPageProps) {
    const [paramsValue, searchParamsValue] = await Promise.all([
        params,
        searchParams ?? Promise.resolve({}),
    ]);

    const { id, type } = paramsValue;
    const rawCountry = searchParamsValue?.country;
    const countryValue = Array.isArray(rawCountry) ? rawCountry[0] : rawCountry;
    const selectedCountry =
        countryValue && /^[A-Za-z]{2}$/.test(countryValue) ? countryValue.toUpperCase() : 'UA';

    const data: MovieDetailPayload = await MovieDetail.getMovieDetail(id, type);

    const movie = data.data;
    const curatorHref = curatorUrlFromMovie({ from: 'movie' });

    return (
        <main className="relative min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-gray-100">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
                <div className="absolute left-1/3 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-[90px]" />
            </div>
            {/* Background header */}
            <section className="relative w-full h-[40vh] overflow-hidden">
                <Image
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    fill
                    priority
                    className="object-cover opacity-40"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-gray-950/80 via-gray-950/30 to-transparent px-4 py-10">
                    <div className="max-w-6xl px-0 sm:px-4 mx-auto text-left w-full">
                        <h1 className="text-4xl font-bold mb-3">
                            {movie.title || movie.original_name}
                        </h1>
                        <div className="flex items-center flex-wrap gap-3 text-sm text-gray-300">
                            <p>
                                ⭐{' '}
                                <span className="font-semibold">
                                    {movie.vote_average.toFixed(1)}
                                </span>
                            </p>
                            {movie.release_date && (
                                <p>{new Date(movie.release_date).toLocaleDateString()}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {movie.genres.map(g => (
                                    <Link
                                        key={g.id}
                                        href={`/search/searchByGenre/${g.id}/${encodeURIComponent(
                                            g.name,
                                        )}`}
                                        className="inline-flex items-center rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-200 hover:bg-gray-800 hover:border-gray-500 transition"
                                        prefetch
                                    >
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main content */}
            <section className="max-w-6xl mx-auto px-4 py-10">
                {/* Overview */}
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold mb-3">Overview</h2>
                    <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
                </div>

                <WhereToWatch tmdbId={Number(id)} country={selectedCountry} />

                {data.keywords && data.keywords.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-3">Keywords</h2>
                        <div className="flex flex-wrap gap-2">
                            {data.keywords.map(keyword => (
                                <Link
                                    key={keyword.id}
                                    href={`/search/searchByKeyword/${keyword.id}/${encodeURIComponent(
                                        keyword.name
                                    )}`}
                                    className="inline-flex items-center rounded-full bg-gray-800/60 px-3 py-1 text-xs text-gray-200 hover:bg-gray-700 transition"
                                    prefetch
                                >
                                    {keyword.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Videos */}
                {data.videos.results.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-semibold mb-3">Trailer</h2>
                        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
                            <iframe
                                src={`https://www.youtube.com/embed/${data.videos.results[0].key}`}
                                title={data.videos.results[0].name}
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                )}

                {/* Cast */}
                {data.credits.cast.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4">Cast</h2>
                        <div className="flex overflow-x-auto gap-4 pb-4">
                            {data.credits.cast.slice(0, 15).map(actor => (
                                <Link
                                    href={`/person/${actor.id}`}
                                    key={actor.id}
                                    className="flex-shrink-0 w-32 text-center"
                                >
                                    <div className="relative w-32 h-48 rounded-lg overflow-hidden bg-gray-800">
                                        {actor.profile_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`}
                                                alt={actor.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm font-medium">{actor.name}</p>
                                    <p className="text-xs text-gray-400">{actor.character}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_16px_60px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.18em] text-purple-200/80">
                                Curator
                            </p>
                            <h2 className="text-2xl font-semibold text-white">
                                More like this — Curator picks
                            </h2>
                            <p className="text-sm text-gray-300">
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
                    <CuratorQuickChips source="movie" className="mt-4" />
                </div>

                {data.similar.results.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Similar Movies</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {data.similar.results.slice(0, 12).map(movie => (
                                <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
