import Link from 'next/link';
import { CURATOR_PERSONAS } from '@/data/curators';
import { buildCuratorUrl, CuratorFrom } from '@/lib/curatorLink';
import { CuratorId } from '@/types/discoverAi';
import { RefineMode } from '@/types/curator';

interface CuratorQuickChipsProps {
    source: CuratorFrom | string;
    query?: string | null;
    movieId?: string | number | null;
    refine?: RefineMode | null;
    autostart?: boolean;
    selectedCurator?: CuratorId | null;
    className?: string;
}

export default function CuratorQuickChips({
    source,
    query,
    movieId,
    refine,
    autostart,
    selectedCurator,
    className = '',
}: CuratorQuickChipsProps) {
    return (
        <div className={`flex flex-wrap gap-3 ${className}`}>
            {CURATOR_PERSONAS.map(persona => {
                const href = buildCuratorUrl({
                    from: source,
                    q: query ?? undefined,
                    movieId: movieId ?? undefined,
                    curator: persona.id,
                    refine: refine ?? undefined,
                    autostart,
                });
                const isActive = selectedCurator === persona.id;

                return (
                    <Link
                        key={persona.id}
                        href={href}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                            isActive
                                ? 'border-purple-400/70 bg-purple-500/15 text-white'
                                : 'border-white/10 bg-white/5 text-gray-100 hover:border-purple-300/50 hover:bg-purple-500/10'
                        }`}
                        aria-label={`Open Curator as ${persona.name}`}
                    >
                        <span aria-hidden>{persona.emoji}</span>
                        {persona.name}
                    </Link>
                );
            })}
        </div>
    );
}
