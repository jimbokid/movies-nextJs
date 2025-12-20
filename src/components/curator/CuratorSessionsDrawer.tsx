'use client';

import { useMemo } from 'react';
import { CuratorSession } from '@/types/curator';

interface CuratorSessionsDrawerProps {
    open: boolean;
    sessions: CuratorSession[];
    onClose: () => void;
    onOpenSession: (id: string) => void;
    onStartFromSession: (id: string) => void;
}

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export default function CuratorSessionsDrawer({
    open,
    sessions,
    onClose,
    onOpenSession,
    onStartFromSession,
}: CuratorSessionsDrawerProps) {
    const list = useMemo(() => sessions.slice(0, 10), [sessions]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm px-4 py-6 md:items-center">
            <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-950 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-purple-200">Session history</p>
                        <h3 className="text-xl font-semibold text-white">Recent curator runs</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-200 hover:border-purple-300/50"
                    >
                        Close
                    </button>
                </div>

                {list.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-400">No sessions yet. Start one to see history.</p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {list.map(session => (
                            <div
                                key={session.id}
                                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{session.result.curator.emoji}</span>
                                        <p className="text-sm font-semibold text-white">
                                            {session.result.curator.name}
                                        </p>
                                        <span className="text-xs text-gray-400">{formatDate(session.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-gray-200">
                                        Primary: {session.result.primary?.title ?? '—'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onOpenSession(session.id)}
                                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-100 hover:border-purple-300/50"
                                    >
                                        Open
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onStartFromSession(session.id)}
                                        className="rounded-lg border border-purple-400/60 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500/20"
                                    >
                                        Start new from this
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
