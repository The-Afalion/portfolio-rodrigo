"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function BgAlabaster() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, -100]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
            <motion.div style={{ y: y1 }} className="absolute inset-0">
                <svg width="100%" height="200%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid-alabaster" width="80" height="80" patternUnits="userSpaceOnUse">
                            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/30" />
                        </pattern>
                        <pattern id="grid-alabaster-small" width="16" height="16" patternUnits="userSpaceOnUse">
                            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-muted-foreground/20" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-alabaster-small)" />
                    <rect width="100%" height="100%" fill="url(#grid-alabaster)" />
                </svg>
            </motion.div>
            <motion.div style={{ y: y2 }} className="absolute inset-0 flex items-center justify-center">
                <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary/10">
                    <circle cx="300" cy="300" r="250" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
                    <line x1="300" y1="0" x2="300" y2="600" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="300" x2="600" y2="300" stroke="currentColor" strokeWidth="1" />
                    <rect x="200" y="200" width="200" height="200" stroke="currentColor" strokeWidth="1" />
                </svg>
            </motion.div>
        </div>
    );
}
