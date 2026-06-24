"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { useEffect } from "react";
import type { PointerEvent } from "react";
import { FEATURED_PROJECTS } from "@/datos/proyectos";
import { siteConfig } from "@/config/site";
import OrwellEyeO from "@/components/OrwellEyeO";
import { useHomeTheme } from "@/components/home/HomeStyleControls";

const selectedProjects = FEATURED_PROJECTS.slice(0, 5);

const links = [
  { label: "GitHub", href: siteConfig.github, icon: Github },
  { label: "LinkedIn", href: siteConfig.linkedin, icon: Linkedin },
  { label: "Email", href: `mailto:${siteConfig.email}`, icon: Mail },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

export default function StudioHome() {
  useHomeTheme();

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.homeTheme;
    };
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    event.currentTarget.style.setProperty("--home-x", x.toFixed(2));
    event.currentTarget.style.setProperty("--home-y", y.toFixed(2));
  };

  return (
    <main className="home-landing home-editorial relative isolate overflow-hidden" onPointerMove={handlePointerMove}>
      <div className="home-reactive-art" aria-hidden="true">
        <span className="home-art-shape home-art-shape-a" />
        <span className="home-art-shape home-art-shape-b" />
        <span className="home-art-line home-art-line-a" />
        <span className="home-art-line home-art-line-b" />
      </div>

      <section className="page-container home-editorial-hero">
        <motion.div initial="hidden" animate="show" variants={stagger} className="home-hero-composition">
          <motion.p variants={fadeUp} className="home-hero-kicker">
            Portfolio de software
          </motion.p>

          <motion.h1 variants={fadeUp} className="home-editorial-title">
            Rodrig<OrwellEyeO className="orwell-eye-o-hero" /> Alonso
          </motion.h1>

          <motion.p variants={fadeUp} className="home-editorial-subtitle">
            Producto digital, sistemas interactivos e IA aplicada. Diseño interfaces y herramientas web con una idea
            simple: que lo complejo se entienda rápido.
          </motion.p>

          <motion.div variants={fadeUp} className="home-hero-actions">
            <Link href="/projects" className="home-primary-link">
              Ver proyectos
              <ArrowRight size={17} />
            </Link>
            <Link href="/contact" className="home-secondary-link">
              Contacto
              <ArrowUpRight size={17} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="page-container home-statement-section">
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-110px" }}
          variants={fadeUp}
          className="home-statement"
        >
          Construyo piezas digitales con estructura, movimiento contenido y una experiencia limpia desde el primer uso.
        </motion.p>
      </section>

      <section className="page-container home-work-section">
        <div className="home-section-heading">
          <p className="home-section-label">Trabajo seleccionado</p>
          <h2>Proyectos recientes.</h2>
        </div>

        <div className="home-work-list">
          {selectedProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-90px" }}
              variants={fadeUp}
            >
              <Link href={project.link} className="home-work-row group">
                <span className="home-work-number">0{index + 1}</span>
                <span className="home-work-main">
                  <span className="home-work-title">{project.title}</span>
                  <span className="home-work-description">{project.description}</span>
                </span>
                <span className="home-work-tech">{project.tech.slice(0, 2).join(" / ")}</span>
                <ArrowUpRight className="home-work-icon" size={19} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="page-container home-contact-section">
        <div className="home-contact-line">
          <div>
            <p className="home-section-label">Contacto</p>
            <h2>Una buena idea merece una forma simple.</h2>
          </div>

          <div className="home-socials">
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="home-social-link"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
