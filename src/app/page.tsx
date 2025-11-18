import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import About from "@/components/About";

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen selection:bg-green-500/30">
      <Hero />
      <About />
      <Projects />
    </main>
  );
}