import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    images: {
        // TMDB already hosts resized copies, so pick one directly instead of using
        // Vercel Image Optimization (see src/lib/tmdbImageLoader.ts).
        loader: "custom",
        loaderFile: "./src/lib/tmdbImageLoader.ts",
    },
    /* config options here */
};

export default nextConfig;
