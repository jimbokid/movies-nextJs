'use client';

import { motion } from 'framer-motion';

interface LoadingOverlayProps {
    message: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
                absolute inset-0 z-20
                bg-black/70 backdrop-blur-3xl
                flex flex-col items-center justify-center
                pointer-events-auto
                h-full
            "
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col items-center gap-4"
            >
                {/* Spinner */}
                <motion.span
                    className="h-8 w-8 rounded-full border-2 border-white/50 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                />

                {/* Dynamic message */}
                <p className="text-lg font-medium text-purple-100 text-center max-w-xs leading-relaxed">
                    {message}
                </p>
            </motion.div>
        </motion.div>
    );
}
