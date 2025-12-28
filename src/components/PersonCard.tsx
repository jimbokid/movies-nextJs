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
            className="group relative flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
            prefetch
        >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-2)]">
                {person.profile_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                        alt={person.name}
                        fill
                        sizes="64px"
                        className="object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="grid h-full w-full place-items-center text-caption text-[var(--text-muted)]">
                        No Image
                    </div>
                )}
            </div>
            <div className="min-w-0">
                <h3 className="text-body font-semibold leading-tight truncate">{person.name}</h3>
                {knownFor && <p className="text-caption truncate">{knownFor}</p>}
            </div>
        </Link>
    );
}
