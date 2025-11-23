'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function PersonCard({
    person,
}: {
    person: {
        id: number;
        name: string;
        profile_path: string | null;
        known_for?: Array<{ title?: string; name?: string }>;
    };
}) {
    const knownFor =
        person.known_for
            ?.map(k => k.title || k.name)
            .filter(Boolean)
            .slice(0, 2)
            .join(' • ') ?? '';

    return (
        <Link
            href={`/person/${person.id}`}
            className="group relative overflow-hidden rounded-2xl bg-neutral-800 shadow-md hover:shadow-lg transition-all duration-300 p-4 flex items-center gap-4"
            prefetch
        >
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-neutral-700 flex-shrink-0">
                {person.profile_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                        alt={person.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full grid place-items-center text-neutral-400 text-xs">
                        No Image
                    </div>
                )}
            </div>
            <div className="min-w-0">
                <h3 className="text-base font-semibold truncate">{person.name}</h3>
                {knownFor && <p className="text-xs text-neutral-300 truncate">{knownFor}</p>}
            </div>
        </Link>
    );
}
