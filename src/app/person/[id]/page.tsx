import Image from "next/image";
import Link from "next/link";
import moment from "moment";
import {getPersonalDetail} from "@/services/personalDetail";
import React from "react";
import {Metadata} from "next";

interface Props {
    params: { id: string };
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
    const data = await getPersonalDetail(params.id);

    const {data: person} = data;


    if (!person) {
        return {
            title: "Person not found | CineView",
            description: "Sorry, this movie could not be found.",
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
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: person.name,
            description: person.biography,
            images: [`https://image.tmdb.org/t/p/w400${person.profile_path}`],
        },
    };
}

export default async function PersonDetailPage({params}: Props) {
    const data = await getPersonalDetail(params.id);

    if (!data) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <p className="text-gray-400">No data found</p>
            </div>
        );
    }

    const {data: person, movies} = data;

    return (
        <div className="bg-gray-950">
            <div className="max-w-5xl mx-auto px-4 py-12 text-white ">
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
                            {person.birthday ? moment(person.birthday).format("MMM DD, YYYY") : "—"}
                        </p>
                        <p>
                            <span className="font-medium text-gray-400">Place of birth: </span>
                            {person.place_of_birth || "—"}
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
                            {movies.slice(0, 20).map((movie) => (
                                <Link
                                    key={movie.id}
                                    href={`/detail/movie/${movie.id}`}
                                    className="group relative bg-gray-800 rounded-xl overflow-hidden shadow hover:scale-105 transition-transform duration-300"
                                    prefetch
                                >
                                    {movie.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                            alt={movie.title}
                                            width={300}
                                            height={450}
                                            className="object-cover w-full h-64"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-64 bg-gray-700 flex items-center justify-center text-gray-500">
                                            No poster
                                        </div>
                                    )}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/100 via-black/60 to-transparent p-2">

                                        <h3 className="text-lg font-semibold truncate">{movie.title}</h3>
                                        <p className="text-sm text-neutral-300 mt-1">⭐ {movie.vote_average.toFixed(1)}</p>

                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
