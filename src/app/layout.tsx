import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ReactQueryProvider from '@/providers/ReactQueryProvider';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: {
        default: 'CineView',
        template: '%s | CineView',
    },
    description: 'Discover your favorite movies.',
    manifest: '/manifest.json',
    openGraph: {
        type: 'website',
        url: 'https://movies-next-js-tau.vercel.app',
        title: 'CineView',
        description: 'Discover your favorite movies.',
        siteName: 'CineView',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 800,
                alt: 'CineView - Discover Your Favorite Movies',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@cineview',
    },
};

export const viewport: Viewport = {
    themeColor: '#171717',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950`}>
                <ScrollToTop />
                <Header />
                <main className="min-h-screen ">
                    <ReactQueryProvider>{children}</ReactQueryProvider>
                </main>
            </body>
        </html>
    );
}
