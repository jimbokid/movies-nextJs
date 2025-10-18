import { GenreItem, Genres } from '@/types/movie';

export const genreGroup = (genres: Genres) => {
    return genres.reduce<Record<string, string>>((acc, item: GenreItem) => {
        acc[item.id] = item.name;
        return acc;
    }, {});
};
