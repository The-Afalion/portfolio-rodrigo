"use client";

import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useContextoGlobal } from "@/context/ContextoGlobal";

const EfectoMatrix = dynamic(() => import("@/components/EfectoMatrix"), { ssr: false });
const OjoVigilante = dynamic(() => import("@/components/OjoVigilante"), { ssr: false });
const Minijuego1984 = dynamic(() => import("@/components/Minijuego1984"), { ssr: false });

export default function HomeEffectsOverlay() {
  const { efectoMatrixVisible, estado1984 } = useContextoGlobal();

  return (
    <AnimatePresence>
      {efectoMatrixVisible ? <EfectoMatrix /> : null}
      {estado1984 !== "inactivo" && estado1984 !== "minijuego" ? <OjoVigilante /> : null}
      {estado1984 === "minijuego" ? <Minijuego1984 /> : null}
    </AnimatePresence>
  );
}
