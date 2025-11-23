'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchHotkey() {
    const router = useRouter();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            // ignore when typing in inputs/textareas
            const target = e.target as HTMLElement | null;
            const tag = target?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;

            if (e.key === '/') {
                e.preventDefault();
                router.push('/search?kind=movie');
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [router]);

    return null;
}
