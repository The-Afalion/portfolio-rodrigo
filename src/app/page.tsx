import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Timeline from "@/components/Timeline";

export default function Home() {
  return (
    <main className="bg-background selection:bg-blue-500/30">
      {/* 1. Portada Interactiva */}
      <Hero />

      {/* 2. Biografía (Ingeniero vs Deportista) */}
      <About />

      {/* 3. Línea de Tiempo */}
      <Timeline />

      {/* 4. Galería de Proyectos */}
      <Projects />
    </main>
  );
}
