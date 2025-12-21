import { CuratorId } from '@/types/discoverAi';
import { RefineMode } from '@/types/curator';

export type CuratorFrom = 'movie' | 'search' | 'discover' | 'header';

export interface CuratorLinkParams {
    from?: CuratorFrom | string;
    movieId?: string | number | null;
    q?: string | null;
    curator?: CuratorId | null;
    refine?: RefineMode | null;
    autostart?: boolean;
}

const normalizeValue = (value?: string | number | null) => {
    if (value === undefined || value === null) return undefined;
    const str = String(value);
    return str.length ? str : undefined;
};

export const buildCuratorUrl = ({
    from,
    movieId,
    q,
    curator,
    refine,
    autostart,
}: CuratorLinkParams): string => {
    const params = new URLSearchParams();
    const entries: Record<string, string | undefined> = {
        from: normalizeValue(from),
        movieId: normalizeValue(movieId),
        q: movieId ? undefined : normalizeValue(q),
        curator: normalizeValue(curator),
        refine: normalizeValue(refine),
        autostart: autostart ? '1' : undefined,
    };

    Object.entries(entries).forEach(([key, value]) => {
        if (value !== undefined) params.set(key, value);
    });

    const qs = params.toString();
    return qs ? `/curator?${qs}` : '/curator';
};

export const curatorUrlFromMovie = (
    movieId: string | number,
    opts?: Omit<CuratorLinkParams, 'movieId'>,
) => buildCuratorUrl({ from: 'movie', ...opts, movieId });

export const curatorUrlFromSearch = (
    query: string,
    opts?: Omit<CuratorLinkParams, 'q'>,
) => buildCuratorUrl({ from: 'search', ...opts, q: query });
