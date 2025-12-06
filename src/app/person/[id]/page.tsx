import Image from 'next/image';
import moment from 'moment';
import { getPersonalDetail } from '@/services/personalDetail';
import React from 'react';
import { Metadata } from 'next';
import MovieCard from '@/components/MovieCard';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const data = await getPersonalDetail(id);

    const { data: person } = data;

    if (!person) {
        return {
            title: 'Person not found | CineView',
            description: 'Sorry, this movie could not be found.',
        };
    }

    return {
        title: `${person.name} | CineView`,
        description: person.biography,
        openGraph: {
            title: `${person.name} | CineView`,
            description: person.biography,
            images: [
                {
                    url: `https://image.tmdb.org/t/p/w500${person.profile_path}`,
                    width: 500,
                    height: 750,
                    alt: person.name,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: person.name,
            description: person.biography,
            images: [`https://image.tmdb.org/t/p/w400${person.profile_path}`],
        },
    };
}

export default async function PersonDetailPage({ params }: Props) {
    const { id } = await params;

    const data = await getPersonalDetail(id);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <p className="text-gray-400">No data found</p>
            </div>
        );
    }

    const { data: person, movies } = data;

    return (
        <div className="bg-gray-950 pt-18">
            <div className="max-w-6xl mx-auto px-4 py-12 text-white ">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-700 shadow-xl">
                        {person.profile_path ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/w400${person.profile_path}`}
                                alt={person.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                                No image
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl font-semibold">{person.name}</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                        <p>
                            <span className="font-medium text-gray-400">Birthday: </span>
                            {person.birthday ? moment(person.birthday).format('MMM DD, YYYY') : '—'}
                        </p>
                        <p>
                            <span className="font-medium text-gray-400">Place of birth: </span>
                            {person.place_of_birth || '—'}
                        </p>
                    </div>

                    {person.biography && (
                        <div className="mt-6 text-gray-300 leading-relaxed">
                            <p>{person.biography}</p>
                        </div>
                    )}
                </div>

                {movies && movies.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-semibold mb-4">Filmography</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {movies.slice(0, 20).map(movie => (
                                <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
