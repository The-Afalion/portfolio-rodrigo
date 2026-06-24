"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, Code2, ShieldAlert, Award, Play } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import type { PointerEvent } from "react";
import { FEATURED_PROJECTS } from "@/datos/proyectos";
import { siteConfig } from "@/config/site";
import OrwellEyeO from "@/components/OrwellEyeO";
import HomeStyleControls, { useHomeTheme } from "@/components/home/HomeStyleControls";

const selectedProjects = FEATURED_PROJECTS.slice(0, 4);

const links = [
  { label: "GitHub", href: siteConfig.github, icon: Github },
  { label: "LinkedIn", href: siteConfig.linkedin, icon: Linkedin },
  { label: "Email", href: `mailto:${siteConfig.email}`, icon: Mail },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// Spotlight wrapper card that casts a cursor-following glowing spotlight under the cursor
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-6 transition-all duration-300 ${className}`}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, rgba(245, 194, 125, 0.08), transparent 80%)`,
          }}
        />
      )}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {children}
      </div>
    </div>
  );
}

// Interactive visualization representing Software Engineering vs Kayak dynamic flows
function DualLifeVisualizer() {
  const [visualMode, setVisualMode] = useState<"code" | "sport">("code");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef({ x: 0, y: 0, hover: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const particleCount = 35;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1.2,
      });
    }

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (visualMode === "code") {
        ctx.strokeStyle = "rgba(241, 194, 125, 0.07)";
        ctx.lineWidth = 1;
        for (let i = 0; i < particleCount; i++) {
          const p1 = particles[i];
          p1.x += p1.vx;
          p1.y += p1.vy;

          if (p1.x < 0 || p1.x > width) p1.vx *= -1;
          if (p1.y < 0 || p1.y > height) p1.vy *= -1;

          if (mousePos.current.hover) {
            const dx = mousePos.current.x - p1.x;
            const dy = mousePos.current.y - p1.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 100) {
              p1.x += dx * 0.015;
              p1.y += dy * 0.015;
              ctx.strokeStyle = `rgba(241, 194, 125, ${0.18 * (1 - dist / 100)})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(mousePos.current.x, mousePos.current.y);
              ctx.stroke();
            }
          }

          for (let j = i + 1; j < particleCount; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (dist < 68) {
              ctx.strokeStyle = `rgba(241, 194, 125, ${0.1 * (1 - dist / 68)})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }

          ctx.fillStyle = "rgba(241, 194, 125, 0.4)";
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        phase += 0.012;
        const waveCount = 4;

        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          const amp = 14 + w * 5 + (mousePos.current.hover ? (height / 2 - mousePos.current.y) * 0.12 : 0);
          const freq = 0.007 - w * 0.001;
          const colorOpacity = 0.05 + w * 0.03;

          ctx.strokeStyle = `rgba(121, 216, 232, ${colorOpacity})`;
          ctx.lineWidth = 1.2 + w * 0.4;

          for (let x = 0; x < width; x += 4) {
            const y = height / 2 + Math.sin(x * freq + phase + w * Math.PI / 4) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Draw animated paddle blade
        ctx.save();
        ctx.translate(width / 2, height / 2);
        const rot = phase * 0.6 + (mousePos.current.hover ? (mousePos.current.x - width / 2) * 0.004 : 0);
        ctx.rotate(rot);
        
        ctx.strokeStyle = "rgba(121, 216, 232, 0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-52, 0);
        ctx.lineTo(52, 0);
        ctx.stroke();

        ctx.fillStyle = "rgba(121, 216, 232, 0.1)";
        ctx.strokeStyle = "rgba(121, 216, 232, 0.35)";
        ctx.beginPath();
        ctx.ellipse(-66, 0, 15, 6, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(66, 0, 15, 6, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [visualMode]);

  return (
    <div className="relative h-72 w-full max-w-sm rounded-[2.5rem] border border-white/10 bg-white/[0.01] p-5 shadow-xl overflow-hidden group hover:border-white/20 transition-all duration-500 flex flex-col justify-between shrink-0">
      <canvas
        ref={canvasRef}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mousePos.current.x = e.clientX - rect.left;
          mousePos.current.y = e.clientY - rect.top;
          mousePos.current.hover = true;
        }}
        onMouseEnter={() => (mousePos.current.hover = true)}
        onMouseLeave={() => (mousePos.current.hover = false)}
        className="absolute inset-0 w-full h-full pointer-events-auto"
      />

      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400">
          Visualizador Dual
        </span>
        <div className="flex gap-1.5 pointer-events-auto">
          <button
            onClick={() => setVisualMode("code")}
            className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase transition-all border ${
              visualMode === "code"
                ? "bg-amber-300/10 border-amber-300 text-amber-200"
                : "bg-white/5 border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Sistemas
          </button>
          <button
            onClick={() => setVisualMode("sport")}
            className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase transition-all border ${
              visualMode === "sport"
                ? "bg-sky-300/10 border-sky-300 text-sky-200"
                : "bg-white/5 border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Kayak
          </button>
        </div>
      </div>

      <div className="relative z-10 text-left pointer-events-none">
        <p className="text-xs font-semibold text-white">
          {visualMode === "code" ? "Atracción Gravitacional" : "Fluido & Corrientes"}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {visualMode === "code"
            ? "Mueve el ratón para conectar los nodos de datos."
            : "Simula el oleaje acelerado por las palas del kayak."}
        </p>
      </div>
    </div>
  );
}

// Micro Lab Previews for different featured projects
function NexusPreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const nodes = [
      { id: 1, x: width / 2 - 45, y: height / 2 - 35, label: "A" },
      { id: 2, x: width / 2 + 45, y: height / 2 - 35, label: "B" },
      { id: 3, x: width / 2 - 45, y: height / 2 + 35, label: "C" },
      { id: 4, x: width / 2 + 45, y: height / 2 + 35, label: "D" },
    ];

    const links = [
      { from: 0, to: 1 },
      { from: 1, to: 3 },
      { from: 3, to: 2 },
      { from: 2, to: 0 },
      { from: 0, to: 3 },
    ];

    const packets: Array<{
      from: typeof nodes[0];
      to: typeof nodes[0];
      progress: number;
      speed: number;
    }> = [];

    let lastSpawn = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      if (now - lastSpawn > 600) {
        const link = links[Math.floor(Math.random() * links.length)];
        packets.push({
          from: nodes[link.from],
          to: nodes[link.to],
          progress: 0,
          speed: 0.012 + Math.random() * 0.008,
        });
        lastSpawn = now;
      }

      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;
      links.forEach((l) => {
        ctx.beginPath();
        ctx.moveTo(nodes[l.from].x, nodes[l.from].y);
        ctx.lineTo(nodes[l.to].x, nodes[l.to].y);
        ctx.stroke();
      });

      packets.forEach((p, index) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          packets.splice(index, 1);
          return;
        }
        const x = p.from.x + (p.to.x - p.from.x) * p.progress;
        const y = p.from.y + (p.to.y - p.from.y) * p.progress;

        ctx.fillStyle = "#7dd3a7";
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      nodes.forEach((n) => {
        ctx.fillStyle = "#0c111d";
        ctx.strokeStyle = "#7dd3a7";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.label, n.x, n.y);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full min-h-[180px]" />;
}

function SlalomPreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const spacing = 18;
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      t += 0.015;

      const gates = [
        { x: width * 0.28, y: height * 0.38, color: "#3b82f6" },
        { x: width * 0.5, y: height * 0.62, color: "#ef4444" },
        { x: width * 0.72, y: height * 0.38, color: "#3b82f6" },
      ];

      gates.forEach((g) => {
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(g.x, g.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = g.color;
        ctx.beginPath();
        ctx.moveTo(g.x, g.y - 12);
        ctx.lineTo(g.x, g.y + 12);
        ctx.stroke();
      });

      // Trajectory path
      ctx.strokeStyle = "rgba(118, 169, 250, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += 3) {
        const y = height / 2 + Math.sin(x * 0.025) * 22;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const travelX = (t * 90) % width;
      const travelY = height / 2 + Math.sin(travelX * 0.025) * 22;

      ctx.fillStyle = "#76a9fa";
      ctx.beginPath();
      ctx.arc(travelX, travelY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(travelX, travelY, 7, 0, Math.PI * 2);
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full min-h-[180px]" />;
}

function ChessAIPreview() {
  const [knightPos, setKnightPos] = useState({ r: 1, c: 2 });

  useEffect(() => {
    const moves = [
      { r: 1, c: 2 },
      { r: 3, c: 3 },
      { r: 2, c: 1 },
      { r: 0, c: 2 },
      { r: 1, c: 0 },
      { r: 3, c: 1 },
      { r: 2, c: 3 },
      { r: 0, c: 2 },
    ];
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % moves.length;
      setKnightPos(moves[step]);
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-full min-h-[180px]">
      <div className="grid grid-cols-4 gap-0.5 border border-white/10 p-1.5 bg-[#090b11] rounded-2xl shadow-inner w-36 h-36">
        {Array.from({ length: 16 }).map((_, i) => {
          const r = Math.floor(i / 4);
          const c = i % 4;
          const isDark = (r + c) % 2 === 1;
          const hasKnight = knightPos.r === r && knightPos.c === c;

          return (
            <div
              key={i}
              className={`flex items-center justify-center text-lg font-bold select-none rounded-md transition-all duration-300 ${
                isDark ? "bg-[#334155]/20 text-[#64748b]" : "bg-[#f1f5f9]/10 text-slate-300"
              }`}
            >
              {hasKnight ? (
                <span className="animate-pulse" style={{ color: "#f1c27d" }}>
                  ♞
                </span>
              ) : (
                ""
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GaltonPreview() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const pegRows = 6;
    const pegs: Array<{ x: number; y: number }> = [];
    const startY = 32;
    const rowSpacing = 18;
    const pegSpacing = 20;

    for (let r = 0; r < pegRows; r++) {
      const cols = r + 1;
      const rowWidth = (cols - 1) * pegSpacing;
      const startX = (width - rowWidth) / 2;
      for (let c = 0; c < cols; c++) {
        pegs.push({
          x: startX + c * pegSpacing,
          y: startY + r * rowSpacing,
        });
      }
    }

    const binsCount = pegRows + 1;
    const bins: number[] = Array(binsCount).fill(0);
    const balls: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      row: number;
      col: number;
    }> = [];

    let lastSpawn = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      if (now - lastSpawn > 400) {
        balls.push({
          x: width / 2 + (Math.random() - 0.5) * 2,
          y: 10,
          vx: 0,
          vy: 1.2,
          row: -1,
          col: 0,
        });
        lastSpawn = now;
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      pegs.forEach((peg) => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = "#f29c8f";
      for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        ball.vy += 0.08;
        ball.x += ball.vx;
        ball.y += ball.vy;

        pegs.forEach((peg) => {
          const dist = Math.hypot(ball.x - peg.x, ball.y - peg.y);
          if (dist < 4.8) {
            ball.y = peg.y - 4;
            ball.vy = 0.4;
            ball.vx = Math.random() > 0.5 ? 1.1 : -1.1;
          }
        });

        const binTop = startY + pegRows * rowSpacing + 12;
        if (ball.y >= binTop) {
          const binWidth = pegSpacing;
          const index = Math.min(
            binsCount - 1,
            Math.max(
              0,
              Math.floor((ball.x - (width - binsCount * binWidth) / 2) / binWidth)
            )
          );
          bins[index]++;
          balls.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      const binWidth = pegSpacing;
      const startX = (width - binsCount * binWidth) / 2;
      const maxBinVal = Math.max(...bins, 1);

      ctx.fillStyle = "rgba(242, 156, 143, 0.2)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;

      for (let b = 0; b < binsCount; b++) {
        const x = startX + b * binWidth;
        const valHeight = (bins[b] / maxBinVal) * 32;
        const y = height - valHeight - 4;

        ctx.fillRect(x + 1.5, y, binWidth - 3, valHeight);
        ctx.strokeRect(x + 1.5, y, binWidth - 3, valHeight);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full min-h-[180px]" />;
}

function MicroLabPreview({ projectId }: { projectId: string }) {
  switch (projectId) {
    case "nexus":
      return <NexusPreview />;
    case "slalom":
      return <SlalomPreview />;
    case "chess-engine":
      return <ChessAIPreview />;
    case "galton":
      return <GaltonPreview />;
    default:
      return null;
  }
}

function CosmicStarsBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const starCount = 65;
    const stars: Array<{
      angle: number;
      dist: number;
      speed: number;
      length: number;
      color: string;
      weight: number;
    }> = [];

    const colors = [
      "rgba(56, 189, 248, ",  // Sky blue
      "rgba(99, 102, 241, ",  // Indigo
      "rgba(59, 130, 246, ",  // Royal blue
      "rgba(147, 51, 234, ",  // Purple
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * Math.min(width, height) * 0.8,
        speed: 0.8 + Math.random() * 1.5,
        length: 6 + Math.random() * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        weight: 0.6 + Math.random() * 0.8,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const maxDist = Math.hypot(width, height) * 0.58;

      for (let i = 0; i < starCount; i++) {
        const star = stars[i];
        
        star.dist += star.speed;
        star.speed += 0.012; // accelerate outwards

        if (star.dist > maxDist) {
          star.dist = Math.random() * 10;
          star.angle = Math.random() * Math.PI * 2;
          star.speed = 0.8 + Math.random() * 1.0;
          star.length = 6 + Math.random() * 12;
        }

        const opacity = Math.min(1, (star.dist / 50)) * (1 - (star.dist / maxDist));
        ctx.strokeStyle = `${star.color}${opacity * 0.44})`;
        ctx.lineWidth = star.weight;

        const x1 = centerX + Math.cos(star.angle) * star.dist;
        const y1 = centerY + Math.sin(star.angle) * star.dist;
        const x2 = centerX + Math.cos(star.angle) * (star.dist + star.length);
        const y2 = centerY + Math.sin(star.angle) * (star.dist + star.length);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-80" />;
}

export default function StudioHome() {
  useHomeTheme();
  const [activePreviewId, setActivePreviewId] = useState("nexus");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDetails(true);
    }, 2000);

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setShowDetails(true);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    event.currentTarget.style.setProperty("--home-x", x.toFixed(2));
    event.currentTarget.style.setProperty("--home-y", y.toFixed(2));
  };

  const activeProject = useMemo(() => {
    return selectedProjects.find((p) => p.id === activePreviewId) ?? selectedProjects[0];
  }, [activePreviewId]);

  return (
    <main className="home-landing home-editorial relative isolate overflow-hidden" onPointerMove={handlePointerMove}>
      {/* Decorative Interactive Background Mesh Glow */}
      <div className="home-reactive-art" aria-hidden="true">
        <span className="home-reactive-art::after" />
      </div>

      {/* Hero Section: Centered, Minimal, with Cosmic Stars Background */}
      <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden border-b border-white/5">
        <CosmicStarsBackdrop />

        <div className="page-container relative z-10 flex flex-col items-center justify-center text-center">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-4xl flex flex-col items-center space-y-6">
            
            <AnimatePresence>
              {showDetails && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 0.9, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="home-hero-kicker font-mono tracking-widest text-[11px] uppercase text-amber-200/90"
                >
                  Portfolio de ingeniería y diseño
                </motion.p>
              )}
            </AnimatePresence>

            <motion.h1
              variants={fadeUp}
              className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tight text-white leading-none text-center select-none"
            >
              Rodrig<OrwellEyeO className="orwell-eye-o-hero" /> Alonso
            </motion.h1>

            <AnimatePresence>
              {showDetails && (
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  className="text-base sm:text-xl leading-relaxed text-slate-300 max-w-2xl font-light text-center"
                >
                  Especialista en interfaces interactivas, gráficos 3D web y aplicaciones robustas de alto rendimiento. Construyo herramientas que simplifican lo complejo.
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="flex flex-wrap items-center justify-center gap-5 pt-4"
                >
                  <Link href="/projects" className="home-primary-link inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg hover:scale-105 transition-all">
                    Explorar proyectos
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/contact" className="home-secondary-link inline-flex items-center gap-2 border-b border-white/20 pb-1 text-sm font-semibold text-white hover:border-white transition-all">
                    Hablemos
                    <ArrowUpRight size={16} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            
          </motion.div>
        </div>
      </section>

      {/* Philosophy Statement Section (Softer layout backdrop, no harsh borders) */}
      <section className="page-container py-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="border-y border-white/5 py-10"
        >
          <p className="text-2xl sm:text-4xl lg:text-5xl font-light italic leading-tight text-slate-200 max-w-5xl">
            &ldquo;Construyo software bajo el principio de que el rigor técnico y la claridad estética no son opuestos, sino complementarios.&rdquo;
          </p>
        </motion.div>
      </section>

      {/* Dual Professional Profile (Engineering & Sport without photo representation) */}
      <section className="page-container py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] items-center">
          <div className="space-y-6">
            <p className="home-section-label font-mono tracking-widest text-[11px] uppercase text-amber-200/90">Doble Enfoque</p>
            <h2 className="text-3xl sm:text-5xl font-semibold text-white">Ingeniería & Alto Rendimiento.</h2>
            <p className="text-base sm:text-lg leading-relaxed text-slate-300 font-light">
              Tengo una formación híbrida y única. Como Ingeniero de Software, me apasiona estructurar arquitecturas escalables y precisas. Como deportista de alto rendimiento (entrenador y árbitro de piragüismo), aplico la disciplina, el trabajo en equipo bajo presión y un enfoque absoluto en la optimización del rendimiento en cada sistema que desarrollo.
            </p>

            <div className="grid gap-4 sm:grid-cols-3 pt-6">
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 hover:bg-white/[0.03] transition-all">
                <Code2 className="text-amber-300" size={20} />
                <h4 className="text-sm font-semibold mt-3 text-white">Full-Stack Riguroso</h4>
                <p className="text-xs text-slate-400 mt-1">Especialidad en Next.js, React, TypeScript y bases de datos.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 hover:bg-white/[0.03] transition-all">
                <Award className="text-sky-300" size={20} />
                <h4 className="text-sm font-semibold mt-3 text-white">Liderazgo Deportivo</h4>
                <p className="text-xs text-slate-400 mt-1">Capacidad analítica y gestión de crisis bajo máxima exigencia física y mental.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-5 hover:bg-white/[0.03] transition-all">
                <ShieldAlert className="text-teal-300" size={20} />
                <h4 className="text-sm font-semibold mt-3 text-white">15+ Labs Activos</h4>
                <p className="text-xs text-slate-400 mt-1">Visualizaciones 3D avanzadas, motores de físicas y laboratorios algorítmicos.</p>
              </div>
            </div>
          </div>

          {/* Interactive Illustrated Dual Visualizer Canvas */}
          <div className="flex justify-center w-full lg:w-auto">
            <DualLifeVisualizer />
          </div>
        </div>
      </section>

      {/* Selected Work: Spotlight Grid & Interactive Widget Showcase */}
      <section className="page-container py-16">
        <div className="home-section-heading border-t border-white/5 pt-10">
          <div>
            <p className="home-section-label font-mono tracking-widest text-[11px] uppercase text-amber-200/90">Laboratorios</p>
            <h2 className="text-3xl sm:text-5xl font-semibold text-white">Proyectos Seleccionados.</h2>
          </div>
        </div>

        {/* Dynamic Bento-like Grid: Left List + Right Interactive Showcase */}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] mt-8">
          {/* Projects Spotlight Card list */}
          <div className="grid gap-5 sm:grid-cols-2">
            {selectedProjects.map((project, index) => (
              <div
                key={project.id}
                onClick={() => setActivePreviewId(project.id)}
                className="cursor-pointer"
              >
                <SpotlightCard className={`h-full min-h-[220px] ${
                  activePreviewId === project.id ? "border-amber-300/40 bg-white/[0.04]" : "border-white/5 bg-white/[0.01]"
                }`}>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-slate-500">0{index + 1}</span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-slate-300">
                      {project.tech.slice(0, 2).join(" / ")}
                    </span>
                  </div>

                  <div className="mt-6 flex-grow">
                    <h3 className={`text-xl font-semibold transition-colors ${
                      activePreviewId === project.id ? "text-amber-200" : "text-white"
                    }`}>
                      {project.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-400 font-light">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-200/90 group-hover:text-white transition-colors">
                      Seleccionar vista
                      <Play size={10} className="ml-1" />
                    </span>
                  </div>
                </SpotlightCard>
              </div>
            ))}
          </div>

          {/* Right Column: Interactive MicroLab Preview Panel */}
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.01] p-6 shadow-xl flex flex-col justify-between min-h-[340px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300/[0.01] to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <p className="text-[10px] font-mono tracking-wider text-amber-200/70 uppercase">Consola de Simulación</p>
                <h4 className="text-sm font-semibold text-white mt-0.5">{activeProject.title} Preview</h4>
              </div>
              <Link
                href={activeProject.link}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[9px] font-bold tracking-wider text-amber-200 hover:bg-white/10 hover:text-white transition-all uppercase"
              >
                Abrir Laboratorio
                <ArrowUpRight size={10} />
              </Link>
            </div>

            <div className="flex-grow flex items-center justify-center py-6 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePreviewId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <MicroLabPreview projectId={activePreviewId} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="border-t border-white/5 pt-4 text-left">
              <span className="text-[9px] font-mono uppercase text-slate-500">Mapeado técnico</span>
              <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                Implementado en {activeProject.tech.join(", ")}. Explora la simulación en tiempo real arriba.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Switcher Controls */}
      <section className="page-container py-12">
        <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
          <div className="max-w-md text-left">
            <h3 className="text-lg font-semibold text-white">Selector de Variante Visual</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Rodrigo Alonso experimenta con layouts interactivos. Elige el tema estético del portafolio.</p>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <HomeStyleControls />
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="page-container py-16 home-contact-section">
        <div className="home-contact-line border-t border-white/5 pt-10">
          <div className="text-left">
            <p className="home-section-label font-mono tracking-widest text-[11px] uppercase text-amber-200/90">Contacto</p>
            <h2 className="text-3xl sm:text-5xl font-semibold text-white">Una gran idea merece un diseño simple.</h2>
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
                  className="home-social-link inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.01] px-5 py-3 text-xs font-semibold text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all"
                >
                  <Icon size={14} />
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
