import Image from 'next/image';
import { MovieDetail } from '@/services/movie';
import { MovieDetailPayload } from '@/types/movie';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import { Metadata } from 'next';

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

    return (
        <main className="min-h-screen bg-gray-950 text-gray-100">
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

                {/* Similar movies */}
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
