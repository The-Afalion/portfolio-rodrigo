"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function BgForest() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
    const y2 = useTransform(scrollY, [0, 1000], [0, 100]);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#0a120b]">
            {/* Luz Ambiental del Bosque */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

            {/* Rejilla Táctica Verde Oscuro */}
            <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="forest-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/30" />
                            <circle cx="0" cy="0" r="2" className="fill-primary" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#forest-grid)" />
                </svg>
            </div>

            {/* Isobaras Topográficas Animadas */}
            <motion.div style={{ y: y1 }} className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-screen">
                <svg width="1200" height="1200" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <circle cx="600" cy="600" r="200" stroke="currentColor" strokeWidth="2" strokeDasharray="10 20" />
                    <circle cx="600" cy="620" r="300" stroke="currentColor" strokeWidth="1" strokeDasharray="4 30" />
                    <circle cx="580" cy="580" r="450" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M 0 600 Q 300 400 600 600 T 1200 600" stroke="currentColor" strokeWidth="1" fill="none" />
                    <path d="M 0 700 Q 300 500 600 700 T 1200 700" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <path d="M 0 800 Q 300 600 600 800 T 1200 800" stroke="currentColor" strokeWidth="0.2" fill="none" />
                </svg>
            </motion.div>

            {/* Partículas Estáticas (Malla de Datos) */}
            <motion.div style={{ y: y2 }} className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="forest-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" className="fill-primary" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#forest-dots)" />
                </svg>
            </motion.div>
        </div>
    );
}
