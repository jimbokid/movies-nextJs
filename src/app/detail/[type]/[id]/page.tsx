import { redirect } from 'next/navigation';

interface PageProps {
    params: { id: string; type: string };
}

export default function LegacyDetailRedirect({ params }: PageProps) {
    const { id, type } = params;
    redirect(`/shows/${type}/${id}`);
}
