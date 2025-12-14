import { Metadata } from 'next';
import DiscoverAiClient from './DiscoverAiClient';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Discover AI Curator | CineView',
        description: 'Pick 3 moods and let an AI curator recommend movies with reasons.',
    };
}

export default function DiscoverAiPage() {
    return <DiscoverAiClient />;
}
