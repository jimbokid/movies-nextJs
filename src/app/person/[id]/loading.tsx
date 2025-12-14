export default function LoadingPersonPage() {
    return (
        <div className="bg-gray-950 min-h-screen pt-18">
            <div className="max-w-6xl mx-auto px-4 py-12 text-white">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-700 shadow-xl">
                        <div className="w-full h-full bg-gray-800" />
                    </div>

                    <div className="w-56 h-8 bg-gray-800 rounded" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 w-full max-w-xl">
                        <div className="h-4 bg-gray-800 rounded w-[70%]" />
                        <div className="h-4 bg-gray-800 rounded w-[70%]" />
                    </div>

                    <div className="mt-6 h-4 w-40 bg-gray-800/60 rounded" />
                </div>
            </div>
        </div>
    );
}
