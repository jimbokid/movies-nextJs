'use client';

import { useEffect, useRef, useState } from 'react';

export function useDelayedBoolean(value: boolean, delayMs = 250): boolean {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [delayedValue, setDelayedValue] = useState(value);

    useEffect(() => {
        if (value) {
            timeoutRef.current = setTimeout(() => setDelayedValue(true), delayMs);
        } else {
            setDelayedValue(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [delayMs, value]);

    return delayedValue;
}

export default useDelayedBoolean;
