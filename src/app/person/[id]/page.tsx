import Image from 'next/image';
import moment from 'moment';
import { getPersonalDetail } from '@/services/personalDetail';
import React from 'react';
import { Metadata } from 'next';
import MovieCard from '@/components/MovieCard';
import PageHeader from '@/components/layout/PageHeader';
import Badge from '@/components/ui/Badge';
import MovieGrid from '@/components/movies/MovieGrid';
import EmptyState from '@/components/ui/EmptyState';

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
        <div className="space-y-8 pb-10">
            <PageHeader
                title={person.name}
                subtitle="Calm profile view for this cast member."
            />
            <div className="page-shell space-y-8">
                <div className="card-surface p-6 md:p-7 flex flex-col gap-6 md:flex-row md:items-start">
                    <div className="relative h-44 w-44 flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
                        {person.profile_path ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/w400${person.profile_path}`}
                                alt={person.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="grid h-full w-full place-items-center text-caption text-[var(--text-muted)]">
                                No image
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 text-caption">
                            {person.known_for_department && (
                                <Badge variant="muted">{person.known_for_department}</Badge>
                            )}
                            {person.place_of_birth && (
                                <Badge variant="default">{person.place_of_birth}</Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-caption">
                            <p>
                                <span className="font-semibold text-[var(--text)]">Birthday: </span>
                                {person.birthday ? moment(person.birthday).format('MMM DD, YYYY') : '—'}
                            </p>
                            <p>
                                <span className="font-semibold text-[var(--text)]">Known for: </span>
                                {person.known_for_department || '—'}
                            </p>
                        </div>
                        {person.biography && (
                            <p className="text-body text-[var(--text-muted)] leading-relaxed">
                                {person.biography}
                            </p>
                        )}
                    </div>
                </div>

                {movies && movies.length > 0 ? (
                    <div className="space-y-3">
                        <h2 className="text-headline">Selected filmography</h2>
                        <MovieGrid>
                            {movies.slice(0, 20).map(movie => (
                                <MovieCard key={`${movie.id}-${movie.title}`} movie={movie} />
                            ))}
                        </MovieGrid>
                    </div>
                ) : (
                    <EmptyState
                        title="No titles yet."
                        message="We couldn’t find credits for this profile."
                    />
                )}
            </div>
        </div>
    );
}
