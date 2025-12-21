'use client';

import dynamic from 'next/dynamic';

const CuratorClient = dynamic(() => import('./CuratorClient'), { ssr: false });

export default function CuratorPage() {
    return <CuratorClient />;
}
