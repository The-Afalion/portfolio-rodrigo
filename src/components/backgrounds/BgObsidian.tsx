"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function BgObsidian() {
    const { scrollY } = useScroll();
    const rotate1 = useTransform(scrollY, [0, 2000], [0, 90]);
    const rotate2 = useTransform(scrollY, [0, 2000], [0, -60]);
    const scale = useTransform(scrollY, [0, 1000], [1, 1.1]);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.svg style={{ rotate: rotate1, scale }} width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary absolute">
                    <circle cx="400" cy="400" r="300" stroke="currentColor" strokeWidth="2" strokeDasharray="10 30" />
                    <circle cx="400" cy="400" r="380" stroke="currentColor" strokeWidth="1" strokeDasharray="2 10" />
                </motion.svg>
                <motion.svg style={{ rotate: rotate2, scale }} width="900" height="900" viewBox="0 0 900 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground absolute">
                    <rect x="250" y="250" width="400" height="400" stroke="currentColor" strokeWidth="1" transform="rotate(45 450 450)" />
                    <rect x="200" y="200" width="500" height="500" stroke="currentColor" strokeWidth="0.5" />
                </motion.svg>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        </div>
    );
}
