export default function LoadingPersonPage() {
    return (
        <div className="bg-gray-950 min-h-screen pt-18">
            <div className="max-w-6xl mx-auto px-4 py-12 text-white animate-pulse">
                {/* Profile Section */}
                <div className="flex flex-col items-center gap-6">
                    {/* Avatar */}
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-700 shadow-xl">
                        <div className="w-full h-full bg-gray-800" />
                    </div>

                    {/* Name */}
                    <div className="w-48 h-6 bg-gray-800 rounded" />

                    {/* Info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 mt-4">
                        <div className="w-60 h-4 bg-gray-800 rounded" />
                        <div className="w-60 h-4 bg-gray-800 rounded" />
                    </div>

                    {/* Biography */}
                    <div className="mt-6 max-w-3xl w-full flex flex-col items-center gap-2">
                        <div className="w-5/6 h-4 bg-gray-800 rounded" />
                        <div className="w-4/6 h-4 bg-gray-800 rounded" />
                        <div className="w-3/6 h-4 bg-gray-800 rounded" />
                    </div>
                </div>

                {/* Filmography Section */}
                <div className="mt-12">
                    <div className="w-48 h-6 bg-gray-800 rounded mb-6" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div
                                key={i}
                                className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg"
                            >
                                <div className="w-full h-64 bg-gray-700" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2">
                                    <div className="w-3/4 h-4 bg-gray-700 rounded mb-1" />
                                    <div className="w-1/2 h-3 bg-gray-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
