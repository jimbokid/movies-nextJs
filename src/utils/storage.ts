export function readLocalStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch (error) {
        console.error('Failed to parse localStorage key', key, error);
        return fallback;
    }
}

export function writeLocalStorage<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Failed to write localStorage key', key, error);
    }
}
