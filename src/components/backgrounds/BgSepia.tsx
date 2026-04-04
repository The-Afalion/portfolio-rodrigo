"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function BgSepia() {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 1000], [0, 200]);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute inset-0 bg-[#2b2521] mix-blend-color" />
            <motion.div style={{ y }} className="absolute inset-0">
                <svg width="100%" height="200%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
                            <rect width="4" height="2" fill="currentColor" className="text-primary/10" />
                            <rect y="2" width="4" height="2" fill="transparent" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#scanlines)" />
                </svg>
            </motion.div>

            {/* Geometría analógica sutil */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg width="1000" height="1000" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary-foreground absolute">
                    <circle cx="500" cy="500" r="350" stroke="currentColor" strokeWidth="2" />
                    <line x1="150" y1="500" x2="850" y2="500" stroke="currentColor" strokeWidth="1" />
                    <line x1="500" y1="150" x2="500" y2="850" stroke="currentColor" strokeWidth="1" />
                </svg>
            </div>
        </div>
    );
}
