"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import BgAlabaster from "./BgAlabaster";
import BgObsidian from "./BgObsidian";
import BgForest from "./BgForest";
import BgSepia from "./BgSepia";

export default function DynamicThemeBackground() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="absolute inset-0 z-0 bg-background pointer-events-none" />;
    }

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
            {theme === "light" && <BgAlabaster />}
            {theme === "dark" && <BgObsidian />}
            {theme === "forest" && <BgForest />}
            {theme === "sepia" && <BgSepia />}
        </div>
    );
}
