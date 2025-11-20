"use client";
import { useScroll } from "framer-motion";
import { useRef } from "react";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Timeline from "@/components/Timeline";
import NewsletterSection from "@/components/NewsletterSection";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  return (
    <main ref={containerRef} className="bg-background selection:bg-blue-500/30">
      <Hero scrollYProgress={scrollYProgress} />
      <About />
      <Timeline />
      <Projects />
      <NewsletterSection />
    </main>
  );
}
