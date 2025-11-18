import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import About from "@/components/About";

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen selection:bg-green-500/30">
      {/* 1. Portada Interactiva */}
      <Hero />

      {/* 2. Biografía (Ingeniero vs Deportista) */}
      <About />

      {/* 3. Galería de Proyectos */}
      <Projects />
    </main>
  );
}