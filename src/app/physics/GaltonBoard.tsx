"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import {
  Activity,
  CircleDot,
  Gauge,
  Gamepad2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";

type Mode = "galton" | "pachinko" | "pinball";

type VisualKind =
  | "ball"
  | "peg"
  | "rail"
  | "wall"
  | "divider"
  | "bumper"
  | "flipper"
  | "spinner"
  | "target"
  | "sensor";

type VisualMeta = {
  kind: VisualKind;
  color?: string;
  accent?: string;
  glow?: string;
  score?: number;
  hidden?: boolean;
  label?: string;
  side?: "left" | "right";
};

type LayoutGuide = {
  galton?: {
    bucketLeft: number;
    bucketWidth: number;
    bucketTop: number;
    bucketBottom: number;
    bins: number;
    rows: number;
    mean: number;
    stdDev: number;
  };
  cups?: Array<{ x: number; y: number; width: number; height: number; score: number; color: string }>;
  ramp?: Array<{ x: number; y: number }>;
  rollovers?: Array<{ x: number; y: number; activeUntil: number }>;
  saucers?: Array<{ x: number; y: number; r: number; activeUntil: number; label: string }>;
};

type FlipperState = {
  body: Matter.Body;
  pivot: Matter.Vector;
  length: number;
  restAngle: number;
  activeAngle: number;
  angle: number;
  side: "left" | "right";
};

const COLORS = {
  bgA: "#15110e",
  bgB: "#211a14",
  cyan: "#6aa8a8",
  blue: "#6f8794",
  pink: "#b86854",
  violet: "#8c748f",
  amber: "#d6a65c",
  green: "#7d9669",
  metal: "#b8aa91",
  slate: "#332b23",
  wall: "#17130f",
};

const GALTON_ROWS = 12;
const MAX_BALLS = 160;

const nowMs = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

const playArcadeSound = (type: "launch" | "peg" | "bumper" | "score" | "jackpot" | "flipper" | "target") => {
  if (typeof window === "undefined") return;

  try {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0.025, t);

    if (type === "launch") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(640, t + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      osc.start(t);
      osc.stop(t + 0.24);
    } else if (type === "peg") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(620 + Math.random() * 280, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      osc.start(t);
      osc.stop(t + 0.045);
    } else if (type === "bumper") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(780, t + 0.14);
      gain.gain.setValueAtTime(0.055, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      osc.start(t);
      osc.stop(t + 0.24);
    } else if (type === "target") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.setValueAtTime(920, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    } else if (type === "flipper") {
      osc.type = "square";
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.start(t);
      osc.stop(t + 0.09);
    } else if (type === "score") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1180, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      osc.start(t);
      osc.stop(t + 0.1);
    } else {
      osc.type = "sawtooth";
      [523, 659, 784, 988, 1319].forEach((freq, index) => {
        osc.frequency.setValueAtTime(freq, t + index * 0.07);
      });
      gain.gain.setValueAtTime(0.055, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
      osc.start(t);
      osc.stop(t + 0.48);
    }

    window.setTimeout(() => void ctx.close(), 700);
  } catch {
    // Sound is ornamental. Browsers can block it without affecting the lab.
  }
};

const gaussian = (x: number, mean: number, std: number) =>
  (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));

const quadraticBezier = (
  p0: Matter.Vector,
  p1: Matter.Vector,
  p2: Matter.Vector,
  steps: number
) => {
  const points: Matter.Vector[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const c = t * t;
    points.push({
      x: a * p0.x + b * p1.x + c * p2.x,
      y: a * p0.y + b * p1.y + c * p2.y,
    });
  }
  return points;
};

const clampVelocity = (body: Matter.Body, maxSpeed: number) => {
  const speed = Matter.Vector.magnitude(body.velocity);
  if (speed <= maxSpeed || speed === 0) return;
  Matter.Body.setVelocity(body, Matter.Vector.mult(Matter.Vector.normalise(body.velocity), maxSpeed));
};

const scoreFromLabel = (label: string) => {
  const parts = label.split(":");
  return Number.parseInt(parts[parts.length - 1] ?? "0", 10) || 0;
};

export default function PhysicsLab() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const rafRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const metaRef = useRef<Map<number, VisualMeta>>(new Map());
  const layoutRef = useRef<LayoutGuide>({});
  const ballsRef = useRef<Set<number>>(new Set());
  const flippersRef = useRef<FlipperState[]>([]);
  const dimensionsRef = useRef({ width: 760, height: 620 });
  const pausedRef = useRef(false);
  const activeModeRef = useRef<Mode>("galton");
  const keysPressedRef = useRef({ left: false, right: false });
  const scorePulseRef = useRef<Map<number, number>>(new Map());
  const galtonBinsRef = useRef<number[]>(Array.from({ length: GALTON_ROWS + 1 }, () => 0));
  const lastSoundRef = useRef(0);

  const [activeMode, setActiveMode] = useState<Mode>("galton");
  const [ballCount, setBallCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [arcadeScore, setArcadeScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [scoreStatus, setScoreStatus] = useState("Récord local");
  const [galtonBins, setGaltonBins] = useState<number[]>(galtonBinsRef.current);

  const removeBall = useCallback((body: Matter.Body) => {
    if (!engineRef.current || !ballsRef.current.has(body.id)) return;

    ballsRef.current.delete(body.id);
    metaRef.current.delete(body.id);
    Matter.Composite.remove(engineRef.current.world, body);
    setBallCount((count) => Math.max(0, count - 1));
  }, []);

  const drawBody = useCallback((ctx: CanvasRenderingContext2D, body: Matter.Body, meta: VisualMeta, time: number) => {
    if (meta.hidden) return;

    const pulseUntil = scorePulseRef.current.get(body.id) ?? 0;
    const pulse = Math.max(0, Math.min(1, (pulseUntil - time) / 220));
    const fill = pulse > 0 ? meta.accent ?? meta.color ?? COLORS.cyan : meta.color ?? COLORS.slate;
    const stroke = meta.accent ?? "rgba(255,255,255,0.35)";

    if (body.circleRadius) {
      const radius = body.circleRadius;
      const { x, y } = body.position;

      if (meta.kind === "ball") {
        const gradient = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.45, 1, x, y, radius * 1.25);
        gradient.addColorStop(0, "#fff8ec");
        gradient.addColorStop(0.22, meta.color ?? COLORS.cyan);
        gradient.addColorStop(1, meta.glow ?? "#315d5f");
        ctx.save();
        ctx.shadowColor = meta.glow ?? meta.color ?? COLORS.cyan;
        ctx.shadowBlur = 5;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255,248,236,0.62)";
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (meta.kind === "peg") {
        const peg = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.35, 1, x, y, radius * 1.35);
        peg.addColorStop(0, "#fff8ea");
        peg.addColorStop(0.42, meta.color ?? COLORS.metal);
        peg.addColorStop(1, "#3b332b");
        ctx.save();
        ctx.shadowColor = meta.accent ?? meta.color ?? COLORS.cyan;
        ctx.shadowBlur = 2 + pulse * 8;
        ctx.fillStyle = peg;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255,248,236,0.5)";
        ctx.stroke();
        ctx.restore();
        return;
      }

      if (meta.kind === "bumper") {
        ctx.save();
        ctx.shadowColor = meta.accent ?? COLORS.green;
        ctx.shadowBlur = 8 + pulse * 18;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = meta.accent ?? COLORS.green;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,248,236,0.18)";
        ctx.beginPath();
        ctx.arc(x - radius * 0.25, y - radius * 0.35, radius * 0.38, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.save();
    ctx.beginPath();
    body.vertices.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();

    if (meta.kind === "flipper") {
      ctx.shadowColor = meta.accent ?? COLORS.amber;
      ctx.shadowBlur = 8;
      ctx.fillStyle = fill;
      ctx.strokeStyle = "rgba(255,248,236,0.72)";
      ctx.lineWidth = 2;
    } else if (meta.kind === "rail" || meta.kind === "wall" || meta.kind === "divider") {
      ctx.shadowColor = meta.accent ?? "rgba(214,166,92,0.28)";
      ctx.shadowBlur = meta.kind === "rail" ? 5 : 1;
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = meta.kind === "rail" ? 1.5 : 1;
    } else if (meta.kind === "spinner" || meta.kind === "target") {
      ctx.shadowColor = meta.accent ?? COLORS.pink;
      ctx.shadowBlur = 6 + pulse * 12;
      ctx.fillStyle = fill;
      ctx.strokeStyle = meta.accent ?? COLORS.pink;
      ctx.lineWidth = 2;
    } else {
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
    }

    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawBackdrop = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, mode: Mode) => {
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, COLORS.bgA);
    bg.addColorStop(0.55, COLORS.bgB);
    bg.addColorStop(1, "#0d0b09");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.5, height * 0.22, 30, width * 0.5, height * 0.2, width * 0.68);
    glow.addColorStop(0, mode === "pinball" ? "rgba(214,166,92,0.16)" : mode === "pachinko" ? "rgba(184,104,84,0.14)" : "rgba(106,168,168,0.12)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.strokeStyle = "rgba(255,248,236,0.055)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  const drawGuides = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, mode: Mode, time: number) => {
    const layout = layoutRef.current;

    if (mode === "galton" && layout.galton) {
      const { bucketLeft, bucketWidth, bucketTop, bucketBottom, bins, mean, stdDev } = layout.galton;
      const counts = galtonBinsRef.current;
      const maxCount = Math.max(1, ...counts);

      ctx.save();
      for (let i = 0; i < bins; i += 1) {
        const h = Math.min(135, (counts[i] / maxCount) * 135);
        const x = bucketLeft + i * bucketWidth + 5;
        const y = bucketBottom - h - 10;
        const g = ctx.createLinearGradient(0, y, 0, bucketBottom);
        g.addColorStop(0, "rgba(214,166,92,0.82)");
        g.addColorStop(0.65, "rgba(106,168,168,0.45)");
        g.addColorStop(1, "rgba(184,104,84,0.28)");
        ctx.fillStyle = g;
        ctx.fillRect(x, y, bucketWidth - 10, h);
      }

      const maxGaussian = gaussian(mean, mean, stdDev);
      ctx.beginPath();
      for (let i = 0; i <= 120; i += 1) {
        const px = (i / 120) * bins;
        const gy = gaussian(px, mean, stdDev);
        const x = bucketLeft + px * bucketWidth;
        const y = bucketTop + 18 + (1 - gy / maxGaussian) * 112;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.setLineDash([7, 7]);
      ctx.strokeStyle = "rgba(255,248,236,0.36)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    if (layout.cups) {
      ctx.save();
      layout.cups.forEach((cup) => {
        const gradient = ctx.createLinearGradient(0, cup.y, 0, cup.y + cup.height);
        gradient.addColorStop(0, cup.color);
        gradient.addColorStop(1, "rgba(28,22,17,0.86)");
        ctx.fillStyle = gradient;
        ctx.strokeStyle = "rgba(255,248,236,0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cup.x - cup.width / 2, cup.y, cup.width, cup.height, 7);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,248,236,0.82)";
        ctx.font = "700 11px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(cup.score), cup.x, cup.y + cup.height - 10);
      });
      ctx.restore();
    }

    if (mode === "pinball" && layout.ramp) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(214,166,92,0.45)";
      ctx.lineWidth = 20;
      ctx.beginPath();
      layout.ramp.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,248,236,0.56)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    if (mode === "pinball" && layout.rollovers) {
      ctx.save();
      layout.rollovers.forEach((lane) => {
        const active = lane.activeUntil > time;
        ctx.fillStyle = active ? "rgba(214,166,92,0.78)" : "rgba(106,168,168,0.16)";
        ctx.strokeStyle = "rgba(255,248,236,0.28)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(lane.x - 15, lane.y - 8, 30, 16, 8);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    }

    if (mode === "pinball" && layout.saucers) {
      ctx.save();
      layout.saucers.forEach((saucer) => {
        const active = saucer.activeUntil > time;
        const pulse = active ? 1 + Math.sin(time / 70) * 0.08 : 1;
        ctx.shadowColor = active ? COLORS.amber : "rgba(214,166,92,0.24)";
        ctx.shadowBlur = active ? 18 : 7;
        ctx.strokeStyle = active ? "rgba(255,248,236,0.78)" : "rgba(214,166,92,0.5)";
        ctx.fillStyle = active ? "rgba(214,166,92,0.26)" : "rgba(38,31,24,0.72)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(saucer.x, saucer.y, saucer.r * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,248,236,0.72)";
        ctx.font = "700 10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.fillText(saucer.label, saucer.x, saucer.y + 4);
      });
      ctx.restore();
    }
  }, []);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensionsRef.current;
    const time = nowMs();

    ctx.clearRect(0, 0, width, height);
    drawBackdrop(ctx, width, height, activeModeRef.current);
    drawGuides(ctx, width, height, activeModeRef.current, time);

    Matter.Composite.allBodies(engine.world).forEach((body) => {
      const meta = metaRef.current.get(body.id);
      if (meta) drawBody(ctx, body, meta, time);
    });
  }, [drawBackdrop, drawBody, drawGuides]);

  const configureCanvas = useCallback(() => {
    const host = sceneRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return dimensionsRef.current;

    const bounds = host.getBoundingClientRect();
    const width = Math.max(360, Math.floor(bounds.width));
    const height = Math.max(520, Math.floor(bounds.height));
    const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    dimensionsRef.current = { width, height };
    return dimensionsRef.current;
  }, []);

  const setup = useCallback((mode: Mode) => {
    const { Engine, Bodies, Body, Composite, Events } = Matter;
    const { width, height } = configureCanvas();

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
    }

    activeModeRef.current = mode;
    pausedRef.current = false;
    setIsPaused(false);
    setBallCount(0);
    ballsRef.current.clear();
    metaRef.current.clear();
    layoutRef.current = {};
    flippersRef.current = [];
    scorePulseRef.current.clear();

    if (mode === "galton") {
      const emptyBins = Array.from({ length: GALTON_ROWS + 1 }, () => 0);
      galtonBinsRef.current = emptyBins;
      setGaltonBins(emptyBins);
    }

    const engine = Engine.create({
      positionIterations: 10,
      velocityIterations: 10,
      constraintIterations: 4,
      enableSleeping: false,
    });
    engine.timing.timeScale = 0.92;
    engine.world.gravity.y = mode === "pinball" ? 0.82 : mode === "pachinko" ? 0.74 : 0.64;
    engineRef.current = engine;

    const bodies: Matter.Body[] = [];
    const add = (body: Matter.Body, meta: VisualMeta) => {
      bodies.push(body);
      metaRef.current.set(body.id, meta);
      return body;
    };
    const segment = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      thickness: number,
      label: string,
      meta: VisualMeta,
      options: Matter.IChamferableBodyDefinition = {}
    ) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.hypot(dx, dy);
      const body = Bodies.rectangle((x1 + x2) / 2, (y1 + y2) / 2, length, thickness, {
        isStatic: true,
        angle: Math.atan2(dy, dx),
        chamfer: { radius: thickness / 2 },
        label,
        friction: 0.04,
        restitution: 0.18,
        ...options,
      });
      return add(body, meta);
    };
    const curve = (
      points: Matter.Vector[],
      thickness: number,
      label: string,
      meta: VisualMeta,
      options: Matter.IChamferableBodyDefinition = {}
    ) => {
      for (let i = 0; i < points.length - 1; i += 1) {
        segment(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, thickness, label, meta, options);
      }
    };
    const wallMeta = { kind: "wall" as const, color: COLORS.wall, accent: "rgba(214,166,92,0.2)" };
    add(Bodies.rectangle(-16, height / 2, 32, height + 80, { isStatic: true, label: "wall:left" }), wallMeta);
    add(Bodies.rectangle(width + 16, height / 2, 32, height + 80, { isStatic: true, label: "wall:right" }), wallMeta);

    if (mode === "galton") {
      const center = width / 2;
      const topY = 38;
      const pegSpacing = Math.min(42, Math.max(30, (width - 112) / (GALTON_ROWS + 1)));
      const rowSpacing = Math.min(34, Math.max(27, (height - 285) / GALTON_ROWS));
      const pegStartY = 158;
      const binCount = GALTON_ROWS + 1;
      const bucketWidth = pegSpacing;
      const bucketLeft = center - (bucketWidth * binCount) / 2;
      const bucketTop = pegStartY + (GALTON_ROWS - 1) * rowSpacing + 38;
      const bucketBottom = height - 20;

      layoutRef.current.galton = {
        bucketLeft,
        bucketWidth,
        bucketTop,
        bucketBottom,
        bins: binCount,
        rows: GALTON_ROWS,
        mean: binCount / 2,
        stdDev: Math.sqrt(GALTON_ROWS * 0.25),
      };

      curve(
        quadraticBezier({ x: center - 190, y: topY }, { x: center - 118, y: 58 }, { x: center - 17, y: 116 }, 14),
        10,
        "rail:funnel",
        { kind: "rail", color: "#27413c", accent: COLORS.cyan }
      );
      curve(
        quadraticBezier({ x: center + 190, y: topY }, { x: center + 118, y: 58 }, { x: center + 17, y: 116 }, 14),
        10,
        "rail:funnel",
        { kind: "rail", color: "#27413c", accent: COLORS.cyan }
      );
      segment(center - 17, 111, center - 17, 146, 7, "rail:neck", { kind: "rail", color: "#38605b", accent: COLORS.cyan });
      segment(center + 17, 111, center + 17, 146, 7, "rail:neck", { kind: "rail", color: "#38605b", accent: COLORS.cyan });

      for (let row = 0; row < GALTON_ROWS; row += 1) {
        const cols = row + 1;
        const rowWidth = (cols - 1) * pegSpacing;
        const startX = center - rowWidth / 2;
        const color = row < 4 ? COLORS.cyan : row < 8 ? COLORS.violet : COLORS.pink;

        for (let col = 0; col < cols; col += 1) {
          add(
            Bodies.circle(startX + col * pegSpacing, pegStartY + row * rowSpacing, 5.4, {
              isStatic: true,
              label: "peg",
              restitution: 0.34,
              friction: 0.02,
            }),
            { kind: "peg", color, accent: color }
          );
        }
      }

      for (let i = 0; i <= binCount; i += 1) {
        const x = bucketLeft + i * bucketWidth;
        segment(x, bucketTop, x, bucketBottom, 5, "divider", { kind: "divider", color: "#2f281f", accent: "rgba(214,166,92,0.24)" });
        add(Bodies.circle(x, bucketTop, 4, { isStatic: true, label: "divider:cap" }), {
          kind: "peg",
          color: "#dcc69c",
          accent: COLORS.cyan,
        });
      }

      for (let i = 0; i < binCount; i += 1) {
        add(
          Bodies.rectangle(bucketLeft + i * bucketWidth + bucketWidth / 2, bucketBottom - 4, bucketWidth - 8, 9, {
            isStatic: true,
            isSensor: true,
            label: `score:galton:${i}`,
          }),
          { kind: "sensor", hidden: true }
        );
      }
    }

    if (mode === "pachinko") {
      const laneX = width - 62;
      const playRight = laneX - 10;
      const leftPad = 26;

      segment(18, height - 18, playRight, height - 18, 18, "floor", { kind: "wall", color: "#241e18", accent: "rgba(214,166,92,0.28)" });
      segment(laneX, 96, laneX, height - 28, 10, "rail:launcher", { kind: "rail", color: "#342a22", accent: COLORS.amber });
      segment(width - 18, 70, width - 18, height - 24, 14, "wall:right-lane", { kind: "wall", color: "#201a15", accent: "rgba(214,166,92,0.22)" });
      segment(laneX + 6, height - 30, width - 22, height - 30, 10, "rail:plunger-floor", { kind: "rail", color: "#3a3026", accent: COLORS.amber });

      curve(
        quadraticBezier({ x: leftPad, y: 180 }, { x: leftPad, y: 32 }, { x: width * 0.52, y: 30 }, 18),
        13,
        "rail:dome",
        { kind: "rail", color: "#3b2b24", accent: COLORS.pink }
      );
      curve(
        quadraticBezier({ x: width * 0.52, y: 30 }, { x: width - 18, y: 30 }, { x: width - 18, y: 102 }, 18),
        13,
        "rail:dome",
        { kind: "rail", color: "#3b2b24", accent: COLORS.pink }
      );
      segment(laneX - 4, 118, laneX - 45, 154, 10, "rail:gate", { kind: "rail", color: "#5a3a30", accent: COLORS.pink });

      const spacingX = Math.min(50, Math.max(39, (playRight - leftPad) / 10));
      const spacingY = 44;
      for (let y = 94, row = 0; y < height - 150; y += spacingY, row += 1) {
        const offset = row % 2 === 0 ? spacingX / 2 : 0;
        for (let x = leftPad + 28 + offset; x < playRight - 24; x += spacingX) {
          const centerGap = Math.abs(x - width * 0.5) < 48 && Math.abs(y - height * 0.46) < 70;
          if (centerGap) continue;
          add(Bodies.circle(x, y, 5.2, { isStatic: true, label: "peg", restitution: 0.52, friction: 0.02 }), {
            kind: "peg",
            color: row % 3 === 0 ? COLORS.blue : row % 3 === 1 ? COLORS.violet : COLORS.pink,
            accent: row % 2 === 0 ? COLORS.pink : COLORS.cyan,
          });
        }
      }

      const spinnerA = add(
        Bodies.rectangle(width * 0.43, height * 0.43, 76, 8, { isStatic: true, label: "spinner", chamfer: { radius: 5 }, restitution: 0.6 }),
        { kind: "spinner", color: "#8c4b3e", accent: "#e5b27a" }
      );
      const spinnerB = add(
        Bodies.rectangle(width * 0.62, height * 0.53, 72, 8, { isStatic: true, label: "spinner", chamfer: { radius: 5 }, restitution: 0.6 }),
        { kind: "spinner", color: "#536866", accent: "#b8d2c9" }
      );

      const cupScores = [30, 120, 500, 120, 30];
      const cupAreaLeft = leftPad + 26;
      const cupAreaRight = playRight - 24;
      const cupWidth = (cupAreaRight - cupAreaLeft) / cupScores.length;
      layoutRef.current.cups = cupScores.map((score, i) => ({
        x: cupAreaLeft + cupWidth * i + cupWidth / 2,
        y: height - 82,
        width: cupWidth - 8,
        height: 64,
        score,
        color: score === 500 ? "rgba(184,104,84,0.42)" : score === 120 ? "rgba(214,166,92,0.3)" : "rgba(106,168,168,0.22)",
      }));

      layoutRef.current.cups.forEach((cup, i) => {
        segment(cup.x - cup.width / 2, cup.y + 6, cup.x - cup.width / 2, height - 20, 7, "divider:cup", { kind: "divider", color: "#3a3026", accent: "rgba(255,248,236,0.2)" });
        if (i === layoutRef.current.cups!.length - 1) {
          segment(cup.x + cup.width / 2, cup.y + 6, cup.x + cup.width / 2, height - 20, 7, "divider:cup", { kind: "divider", color: "#3a3026", accent: "rgba(255,248,236,0.2)" });
        }
        add(
          Bodies.rectangle(cup.x, height - 28, cup.width - 10, 10, {
            isStatic: true,
            isSensor: true,
            label: `score:pachinko:${cup.score}`,
          }),
          { kind: "sensor", hidden: true, score: cup.score }
        );
      });

      Events.on(engine, "beforeUpdate", () => {
        Body.rotate(spinnerA, 0.022);
        Body.rotate(spinnerB, -0.018);
      });
    }

    if (mode === "pinball") {
      const laneX = width - 68;
      const leftWallX = 18;
      const playRight = laneX - 10;
      const bottomY = height - 24;

      segment(leftWallX, 180, leftWallX, bottomY, 18, "wall:left", { kind: "wall", color: "#201a15", accent: "rgba(214,166,92,0.28)" });
      segment(width - 18, 80, width - 18, bottomY, 16, "wall:right", { kind: "wall", color: "#201a15", accent: "rgba(214,166,92,0.22)" });
      segment(laneX, 112, laneX, bottomY - 4, 10, "rail:launch-lane", { kind: "rail", color: "#342a22", accent: COLORS.amber });
      segment(laneX + 6, bottomY - 5, width - 22, bottomY - 5, 11, "rail:plunger-floor", { kind: "rail", color: "#3a3026", accent: COLORS.amber });
      segment(laneX - 2, 126, laneX - 42, 164, 11, "rail:lane-gate", { kind: "rail", color: "#365752", accent: COLORS.cyan });

      curve(
        quadraticBezier({ x: leftWallX, y: 184 }, { x: leftWallX + 12, y: 28 }, { x: width * 0.52, y: 30 }, 22),
        13,
        "rail:arch",
        { kind: "rail", color: "#27413c", accent: COLORS.cyan }
      );
      curve(
        quadraticBezier({ x: width * 0.52, y: 30 }, { x: width - 18, y: 30 }, { x: width - 18, y: 102 }, 22),
        13,
        "rail:arch",
        { kind: "rail", color: "#27413c", accent: COLORS.cyan }
      );

      curve(
        quadraticBezier({ x: leftWallX + 2, y: height - 190 }, { x: width * 0.21, y: height - 162 }, { x: width * 0.39, y: height - 102 }, 14),
        11,
        "rail:return-left",
        { kind: "rail", color: "#35465a", accent: COLORS.blue }
      );
      curve(
        quadraticBezier({ x: playRight, y: height - 190 }, { x: width * 0.75, y: height - 162 }, { x: width * 0.55, y: height - 102 }, 14),
        11,
        "rail:return-right",
        { kind: "rail", color: "#35465a", accent: COLORS.blue }
      );

      const ramp = quadraticBezier({ x: width * 0.69, y: 156 }, { x: width * 0.48, y: 235 }, { x: width * 0.23, y: height - 260 }, 24);
      layoutRef.current.ramp = ramp;
      const rampLeft = ramp.map((point) => ({ x: point.x - 13, y: point.y }));
      const rampRight = ramp.map((point) => ({ x: point.x + 13, y: point.y }));
      curve(rampLeft, 6, "rail:ramp", { kind: "rail", color: "#6a3f25", accent: COLORS.amber }, { restitution: 0.12 });
      curve(rampRight, 6, "rail:ramp", { kind: "rail", color: "#6a3f25", accent: COLORS.amber }, { restitution: 0.12 });
      const midRamp = ramp[Math.floor(ramp.length * 0.52)];
      add(Bodies.circle(midRamp.x, midRamp.y, 20, { isStatic: true, isSensor: true, label: "score:pinball:450" }), {
        kind: "sensor",
        hidden: true,
        score: 450,
      });

      const topSpinner = add(
        Bodies.rectangle(width * 0.66, 214, 78, 8, {
          isStatic: true,
          label: "spinner:pinball",
          chamfer: { radius: 5 },
          restitution: 0.64,
        }),
        { kind: "spinner", color: "#8c4b3e", accent: "#e5b27a", score: 175 }
      );

      const lowerSpinner = add(
        Bodies.rectangle(width * 0.27, 286, 62, 7, {
          isStatic: true,
          label: "spinner:pinball",
          chamfer: { radius: 5 },
          restitution: 0.58,
          angle: -0.65,
        }),
        { kind: "spinner", color: "#526763", accent: "#b8d2c9", score: 175 }
      );

      [
        { x: width * 0.35, y: 150, r: 28, color: "#5f744f", accent: COLORS.green, score: 90 },
        { x: width * 0.54, y: 130, r: 28, color: "#38605b", accent: COLORS.cyan, score: 90 },
        { x: width * 0.45, y: 246, r: 34, color: "#8c4b3e", accent: COLORS.pink, score: 220 },
        { x: width * 0.59, y: 302, r: 22, color: "#7a633f", accent: COLORS.amber, score: 130 },
        { x: width * 0.28, y: 210, r: 21, color: "#526763", accent: COLORS.blue, score: 130 },
      ].forEach((bumper) => {
        add(
          Bodies.circle(bumper.x, bumper.y, bumper.r, {
            isStatic: true,
            label: `bumper:${bumper.score}`,
            restitution: 0.72,
            friction: 0.02,
          }),
          { kind: "bumper", color: bumper.color, accent: bumper.accent, score: bumper.score }
        );
      });

      add(Bodies.polygon(width * 0.24, height - 245, 3, 38, { isStatic: true, angle: Math.PI / 3, label: "slingshot:left", restitution: 0.62 }), {
        kind: "target",
        color: "#6f4a61",
        accent: "#caa5bb",
        side: "left",
      });
      add(Bodies.polygon(width * 0.72, height - 245, 3, 38, { isStatic: true, angle: -Math.PI / 3, label: "slingshot:right", restitution: 0.62 }), {
        kind: "target",
        color: "#6f4a61",
        accent: "#caa5bb",
        side: "right",
      });

      layoutRef.current.rollovers = [width * 0.34, width * 0.43, width * 0.52, width * 0.61].map((x) => ({ x, y: 74, activeUntil: 0 }));
      layoutRef.current.rollovers.forEach((lane, i) => {
        segment(lane.x - 22, 58, lane.x - 22, 91, 5, "rail:rollover-post", { kind: "divider", color: "#4a4033", accent: "rgba(214,166,92,0.18)" });
        add(Bodies.rectangle(lane.x, lane.y, 28, 18, { isStatic: true, isSensor: true, label: `rollover:${i}` }), {
          kind: "sensor",
          hidden: true,
          score: 125,
        });
      });

      add(Bodies.rectangle(leftWallX + 20, 238, 9, 44, { isStatic: true, label: "target:260", chamfer: { radius: 4 } }), {
        kind: "target",
        color: "#8c3f34",
        accent: "#e5a58e",
        score: 260,
      });
      add(Bodies.rectangle(playRight - 18, 238, 9, 44, { isStatic: true, label: "target:260", chamfer: { radius: 4 } }), {
        kind: "target",
        color: "#8c3f34",
        accent: "#e5a58e",
        score: 260,
      });

      [
        { x: width * 0.2, y: 140, angle: 0.08, score: 180 },
        { x: width * 0.22, y: 178, angle: 0.05, score: 180 },
        { x: width * 0.24, y: 216, angle: 0.02, score: 180 },
        { x: playRight - 44, y: 286, angle: -0.12, score: 240 },
        { x: playRight - 46, y: 330, angle: -0.12, score: 240 },
        { x: playRight - 48, y: 374, angle: -0.12, score: 240 },
      ].forEach((target) => {
        add(
          Bodies.rectangle(target.x, target.y, 10, 34, {
            isStatic: true,
            label: `target:${target.score}`,
            angle: target.angle,
            chamfer: { radius: 4 },
          }),
          { kind: "target", color: "#7d4638", accent: "#ddb18b", score: target.score }
        );
      });

      layoutRef.current.saucers = [
        { x: width * 0.72, y: height - 338, r: 25, activeUntil: 0, label: "BONUS" },
      ];
      layoutRef.current.saucers.forEach((saucer) => {
        add(Bodies.circle(saucer.x, saucer.y, saucer.r, { isStatic: true, isSensor: true, label: "saucer:700" }), {
          kind: "sensor",
          hidden: true,
          score: 700,
        });
      });

      add(Bodies.polygon(width * 0.17, 344, 3, 27, { isStatic: true, angle: Math.PI / 4, label: "rail:deflector" }), {
        kind: "rail",
        color: "#4a3b52",
        accent: COLORS.violet,
      });
      add(Bodies.polygon(playRight - 44, 344, 3, 27, { isStatic: true, angle: -Math.PI / 4, label: "rail:deflector" }), {
        kind: "rail",
        color: "#4a3b52",
        accent: COLORS.violet,
      });

      const leftPivot = { x: width * 0.38, y: height - 82 };
      const rightPivot = { x: width * 0.58, y: height - 82 };
      const flipperLength = Math.min(88, Math.max(72, width * 0.12));
      const leftFlipper = add(
        Bodies.rectangle(leftPivot.x + flipperLength / 2, leftPivot.y, flipperLength, 17, {
          isStatic: true,
          label: "flipper:left",
          chamfer: { radius: 8 },
          restitution: 0.28,
          friction: 0.02,
        }),
        { kind: "flipper", color: "#8f604b", accent: "#efd0a8", side: "left" }
      );
      const rightFlipper = add(
        Bodies.rectangle(rightPivot.x - flipperLength / 2, rightPivot.y, flipperLength, 17, {
          isStatic: true,
          label: "flipper:right",
          chamfer: { radius: 8 },
          restitution: 0.28,
          friction: 0.02,
        }),
        { kind: "flipper", color: "#8f604b", accent: "#efd0a8", side: "right" }
      );

      flippersRef.current = [
        { body: leftFlipper, pivot: leftPivot, length: flipperLength, restAngle: 0.28, activeAngle: -0.48, angle: 0.28, side: "left" },
        { body: rightFlipper, pivot: rightPivot, length: flipperLength, restAngle: -0.28, activeAngle: 0.48, angle: -0.28, side: "right" },
      ];

      add(Bodies.rectangle(width / 2, height + 20, width, 28, { isStatic: true, isSensor: true, label: "drain" }), {
        kind: "sensor",
        hidden: true,
      });

      Events.on(engine, "beforeUpdate", () => {
        Body.rotate(topSpinner, 0.026);
        Body.rotate(lowerSpinner, -0.023);
      });
    }

    Composite.add(engine.world, bodies);

    Events.on(engine, "beforeUpdate", () => {
      const modeMaxSpeed = mode === "pinball" ? 18 : mode === "pachinko" ? 22 : 10;
      const { width: currentWidth, height: currentHeight } = dimensionsRef.current;

      flippersRef.current.forEach((flipper) => {
        const pressed = flipper.side === "left" ? keysPressedRef.current.left : keysPressedRef.current.right;
        const target = pressed ? flipper.activeAngle : flipper.restAngle;
        const previousAngle = flipper.angle;
        flipper.angle += (target - flipper.angle) * 0.34;
        const angularDelta = flipper.angle - previousAngle;
        const direction = flipper.side === "left" ? 1 : -1;
        const center = {
          x: flipper.pivot.x + direction * Math.cos(flipper.angle) * flipper.length * 0.5,
          y: flipper.pivot.y + direction * Math.sin(flipper.angle) * flipper.length * 0.5,
        };
        Body.setPosition(flipper.body, center);
        Body.setAngle(flipper.body, flipper.angle);
        Body.setAngularVelocity(flipper.body, angularDelta);
        Body.setVelocity(flipper.body, {
          x: -direction * Math.sin(flipper.angle) * angularDelta * flipper.length * 5,
          y: direction * Math.cos(flipper.angle) * angularDelta * flipper.length * 5,
        });
      });

      Matter.Composite.allBodies(engine.world).forEach((body) => {
        if (!ballsRef.current.has(body.id)) return;

        clampVelocity(body, modeMaxSpeed);
        if (body.position.y > currentHeight + 90 || body.position.x < -80 || body.position.x > currentWidth + 80) {
          removeBall(body);
        }
      });
    });

    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        const bodiesInPair = [pair.bodyA, pair.bodyB];
        const ball = bodiesInPair.find((body) => ballsRef.current.has(body.id));
        if (!ball) return;
        const other = bodiesInPair[0].id === ball.id ? bodiesInPair[1] : bodiesInPair[0];
        const otherLabel = other.label;
        const time = nowMs();

        if (otherLabel === "peg" && time - lastSoundRef.current > 38) {
          lastSoundRef.current = time;
          scorePulseRef.current.set(other.id, time + 150);
          if (Math.random() > 0.45) playArcadeSound("peg");
        }

        if (otherLabel.startsWith("score:galton:")) {
          const index = scoreFromLabel(otherLabel);
          const next = [...galtonBinsRef.current];
          next[index] = (next[index] ?? 0) + 1;
          galtonBinsRef.current = next;
          setGaltonBins(next);
          removeBall(ball);
          return;
        }

        if (otherLabel.startsWith("score:pachinko:")) {
          const score = scoreFromLabel(otherLabel);
          setArcadeScore((value) => value + score);
          removeBall(ball);
          playArcadeSound(score >= 500 ? "jackpot" : "score");
          return;
        }

        if (otherLabel.startsWith("score:pinball:")) {
          const score = scoreFromLabel(otherLabel);
          setArcadeScore((value) => value + score);
          playArcadeSound(score >= 400 ? "jackpot" : "target");
          return;
        }

        if (otherLabel.startsWith("saucer:")) {
          const saucer = layoutRef.current.saucers?.find((item) => Matter.Vector.magnitude(Matter.Vector.sub(item, other.position)) < 2);
          if (saucer && saucer.activeUntil > time) return;

          if (saucer) saucer.activeUntil = time + 900;
          const score = scoreFromLabel(otherLabel);
          setArcadeScore((value) => value + score);
          Matter.Body.setVelocity(ball, { x: -7.8, y: -8.6 });
          clampVelocity(ball, 17);
          playArcadeSound("jackpot");
          return;
        }

        if (otherLabel.startsWith("bumper:")) {
          const score = scoreFromLabel(otherLabel);
          const dir = Matter.Vector.normalise(Matter.Vector.sub(ball.position, other.position));
          const kick = score > 100 ? 9.5 : 7.4;
          Matter.Body.setVelocity(ball, Matter.Vector.add(Matter.Vector.mult(dir, kick), { x: ball.velocity.x * 0.22, y: ball.velocity.y * 0.22 }));
          clampVelocity(ball, 16);
          scorePulseRef.current.set(other.id, time + 240);
          setArcadeScore((value) => value + score);
          playArcadeSound(score > 100 ? "jackpot" : "bumper");
          return;
        }

        if (otherLabel.startsWith("slingshot:")) {
          const side = otherLabel.endsWith("left") ? 1 : -1;
          Matter.Body.setVelocity(ball, { x: side * 8.8, y: -7.2 });
          scorePulseRef.current.set(other.id, time + 220);
          setArcadeScore((value) => value + 80);
          playArcadeSound("bumper");
          return;
        }

        if (otherLabel.startsWith("spinner:")) {
          Matter.Body.setVelocity(ball, {
            x: ball.velocity.x * 0.72 + (Math.random() > 0.5 ? 2.8 : -2.8),
            y: ball.velocity.y - 1.4,
          });
          scorePulseRef.current.set(other.id, time + 180);
          setArcadeScore((value) => value + 175);
          playArcadeSound("target");
          return;
        }

        if (otherLabel.startsWith("target:")) {
          scorePulseRef.current.set(other.id, time + 260);
          setArcadeScore((value) => value + scoreFromLabel(otherLabel));
          playArcadeSound("target");
          return;
        }

        if (otherLabel.startsWith("rollover:")) {
          const index = scoreFromLabel(otherLabel);
          if (layoutRef.current.rollovers?.[index]) {
            layoutRef.current.rollovers[index].activeUntil = time + 850;
          }
          setArcadeScore((value) => value + 125);
          playArcadeSound("target");
          return;
        }

        if (otherLabel.startsWith("flipper:")) {
          const left = otherLabel.endsWith("left");
          const pressed = left ? keysPressedRef.current.left : keysPressedRef.current.right;
          if (pressed) {
            Matter.Body.setVelocity(ball, {
              x: (left ? 1 : -1) * Math.max(4, Math.abs(ball.velocity.x) + 3.8),
              y: Math.min(-8.4, ball.velocity.y - 5.2),
            });
            clampVelocity(ball, 17);
          }
          return;
        }

        if (otherLabel === "drain") {
          removeBall(ball);
          playArcadeSound("peg");
        }
      });
    });

    let last = nowMs();
    const frame = (time: number) => {
      const delta = Math.min(30, time - last || 16.667);
      last = time;

      if (!pausedRef.current) {
        const steps = 2;
        for (let i = 0; i < steps; i += 1) {
          Matter.Engine.update(engine, delta / steps);
        }
      }

      drawScene();
      rafRef.current = requestAnimationFrame(frame);
    };

    drawScene();
    rafRef.current = requestAnimationFrame(frame);
  }, [configureCanvas, drawScene, removeBall]);

  const addBalls = useCallback((count: number) => {
    const engine = engineRef.current;
    if (!engine || pausedRef.current) return;

    const { Bodies, Body, Composite } = Matter;
    const { width, height } = dimensionsRef.current;
    const currentMode = activeModeRef.current;
    const room = Math.max(0, MAX_BALLS - ballsRef.current.size);
    const amount = currentMode === "pinball" ? Math.min(1, room) : Math.min(count, room);
    if (amount <= 0) return;

    playArcadeSound("launch");

    const addBall = (body: Matter.Body, meta: VisualMeta) => {
      ballsRef.current.add(body.id);
      metaRef.current.set(body.id, meta);
      Composite.add(engine.world, body);
    };

    if (currentMode === "galton") {
      const palette = [
        [COLORS.cyan, "#315d5f"],
        [COLORS.pink, "#6f352c"],
        [COLORS.amber, "#7c5524"],
        [COLORS.green, "#3f5535"],
        [COLORS.violet, "#4a3b52"],
      ];

      for (let i = 0; i < amount; i += 1) {
        const [color, glow] = palette[i % palette.length];
        const ball = Bodies.circle(width / 2 + (Math.random() - 0.5) * 5, 34 - i * 11, 5.2, {
          label: "ball:galton",
          restitution: 0.22,
          friction: 0.018,
          frictionAir: 0.02,
          density: 0.003,
          slop: 0.01,
        });
        Body.setVelocity(ball, { x: (Math.random() - 0.5) * 0.35, y: 0.5 });
        addBall(ball, { kind: "ball", color, glow });
      }
    } else if (currentMode === "pachinko") {
      for (let i = 0; i < amount; i += 1) {
        const ball = Bodies.circle(width - 38, height - 55 - i * 15, 7, {
          label: "ball:pachinko",
          restitution: 0.44,
          friction: 0.014,
          frictionAir: 0.008,
          density: 0.0035,
          slop: 0.01,
        });
        Body.setVelocity(ball, { x: -0.18, y: -21.4 });
        addBall(ball, { kind: "ball", color: COLORS.cyan, glow: "#315d5f" });
      }
    } else {
      const ball = Bodies.circle(width - 38, height - 56, 7.8, {
        label: "ball:pinball",
        restitution: 0.42,
        friction: 0.012,
        frictionAir: 0.006,
        density: 0.004,
        slop: 0.01,
      });
      Body.setVelocity(ball, { x: -0.25, y: -17.6 });
      addBall(ball, { kind: "ball", color: COLORS.amber, glow: "#7c5524" });
    }

    setBallCount((value) => value + amount);
  }, []);

  const changeMode = useCallback((mode: Mode) => {
    if (mode === activeModeRef.current) return;
    activeModeRef.current = mode;
    setActiveMode(mode);
    setArcadeScore(0);
    keysPressedRef.current = { left: false, right: false };
    playArcadeSound("score");
    setup(mode);
  }, [setup]);

  const resetMode = useCallback(() => {
    setArcadeScore(0);
    setup(activeModeRef.current);
  }, [setup]);

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
  }, []);

  const gameKeyForMode = (mode: Mode) => {
    if (mode === "pachinko") return "physics-pachinko";
    if (mode === "pinball") return "physics-pinball";
    return null;
  };

  useEffect(() => {
    setup(activeModeRef.current);

    const host = sceneRef.current;
    if (host && typeof ResizeObserver !== "undefined") {
      resizeObserverRef.current = new ResizeObserver(() => {
        setup(activeModeRef.current);
      });
      resizeObserverRef.current.observe(host);
    }

    return () => {
      resizeObserverRef.current?.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, [setup]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeModeRef.current !== "pinball") return;

      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        if (!keysPressedRef.current.left) playArcadeSound("flipper");
        keysPressedRef.current.left = true;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        if (!keysPressedRef.current.right) playArcadeSound("flipper");
        keysPressedRef.current.right = true;
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "ArrowLeft" || event.code === "KeyA") keysPressedRef.current.left = false;
      if (event.code === "ArrowRight" || event.code === "KeyD") keysPressedRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const gameKey = gameKeyForMode(activeModeRef.current);
    if (!gameKey || arcadeScore <= highScore) return;

    setHighScore(arcadeScore);
    let cancelled = false;
    const save = async () => {
      try {
        const response = await fetch("/api/arcade/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameKey, score: arcadeScore }),
        });
        if (!response.ok) {
          if (!cancelled) setScoreStatus("Inicia sesión para guardar");
          return;
        }
        const data = await response.json();
        if (cancelled) return;
        setHighScore(data.personalBest ?? arcadeScore);
        setScoreStatus(data.improved ? "Nuevo récord guardado" : "Récord sincronizado");
      } catch {
        if (!cancelled) setScoreStatus("Récord local");
      }
    };

    void save();
    return () => {
      cancelled = true;
    };
  }, [arcadeScore, highScore]);

  useEffect(() => {
    const gameKey = gameKeyForMode(activeMode);
    if (!gameKey) {
      setHighScore(0);
      setScoreStatus("Modo estadístico");
      return;
    }

    let cancelled = false;
    const loadBestScore = async () => {
      try {
        const response = await fetch(`/api/arcade/scores?gameKey=${gameKey}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;
        setHighScore(data.personalBest ?? 0);
        setScoreStatus(data.personalBest ? "Récord personal" : "Sin récord guardado");
      } catch {
        if (!cancelled) setScoreStatus("Récord local");
      }
    };

    void loadBestScore();
    return () => {
      cancelled = true;
    };
  }, [activeMode]);

  const totalGaltonBalls = galtonBins.reduce((sum, value) => sum + value, 0);
  const dominantBin = galtonBins.length ? Math.max(...galtonBins) : 0;

  return (
    <div className="relative flex h-full min-h-[640px] w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#15110e] shadow-[0_24px_70px_-52px_rgba(0,0,0,0.8)]">
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#17120f]/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-orange-200/20 bg-orange-200/10 text-orange-100">
            <Gamepad2 size={18} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-100">Física Arcade</p>
            <p className="text-[11px] text-stone-400">Matter.js estable</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {([
            ["galton", "Galton", CircleDot],
            ["pachinko", "Pachinko", Sparkles],
            ["pinball", "Pinball", Gamepad2],
          ] as const).map(([mode, label, Icon]) => (
            <button
              key={mode}
              type="button"
              onClick={() => changeMode(mode)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition ${
                activeMode === mode
                  ? "border-orange-200/45 bg-orange-200/12 text-orange-100 shadow-[0_12px_28px_-22px_rgba(214,166,92,0.7)]"
                  : "border-white/10 bg-white/[0.03] text-stone-400 hover:border-white/20 hover:text-stone-200"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div ref={sceneRef} className="relative min-h-0 flex-1">
        <canvas ref={canvasRef} className="block h-full w-full" />

        <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={togglePause}
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-[#17120f]/88 text-stone-200 shadow-lg transition hover:border-orange-200/35 hover:text-orange-100"
            title={isPaused ? "Reanudar" : "Pausar"}
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            type="button"
            onClick={resetMode}
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-[#17120f]/88 text-stone-200 shadow-lg transition hover:border-orange-200/35 hover:text-orange-100"
            title="Reiniciar"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={() => addBalls(1)}
            className="pointer-events-auto inline-flex h-9 items-center gap-2 rounded-lg border border-orange-200/28 bg-orange-200/12 px-3 text-xs font-bold uppercase tracking-wide text-orange-100 shadow-lg transition hover:bg-orange-200/18"
          >
            <Plus size={14} />
            1 bola
          </button>
          {activeMode === "galton" && (
            <button
              type="button"
              onClick={() => addBalls(100)}
              className="pointer-events-auto inline-flex h-9 items-center gap-2 rounded-lg border border-teal-200/25 bg-teal-200/10 px-3 text-xs font-bold uppercase tracking-wide text-teal-100 shadow-lg transition hover:bg-teal-200/16"
            >
              <RotateCcw size={14} />
              100
            </button>
          )}
        </div>

        <div className="absolute right-4 top-4 z-10 flex flex-wrap justify-end gap-2">
          {activeMode !== "galton" ? (
            <>
              <div className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#17120f]/88 px-3 font-mono text-[11px] text-stone-300 shadow-lg">
                <Activity size={13} className="text-orange-200" />
                {arcadeScore}
              </div>
              <div className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#17120f]/88 px-3 font-mono text-[11px] text-stone-300 shadow-lg">
                <Trophy size={13} className="text-teal-200" />
                {highScore}
              </div>
              <div className="hidden h-9 items-center rounded-lg border border-white/10 bg-[#17120f]/88 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400 shadow-lg sm:flex">
                {scoreStatus}
              </div>
            </>
          ) : (
            <div className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#17120f]/88 px-3 font-mono text-[11px] text-stone-300 shadow-lg">
              <Gauge size={13} className="text-teal-200" />
              {totalGaltonBalls}/{dominantBin}
            </div>
          )}
        </div>

        {activeMode === "pinball" && (
          <div className="absolute bottom-4 left-4 z-10 flex gap-2">
            <button
              type="button"
              onPointerDown={() => {
                keysPressedRef.current.left = true;
                playArcadeSound("flipper");
              }}
              onPointerUp={() => {
                keysPressedRef.current.left = false;
              }}
              onPointerCancel={() => {
                keysPressedRef.current.left = false;
              }}
              onPointerLeave={() => {
                keysPressedRef.current.left = false;
              }}
              onBlur={() => {
                keysPressedRef.current.left = false;
              }}
              className="h-12 rounded-lg border border-orange-200/25 bg-orange-200/12 px-5 text-xs font-bold uppercase tracking-wider text-orange-100 shadow-lg transition active:bg-orange-200/24"
              title="Flipper izquierdo"
            >
              Izq
            </button>
            <button
              type="button"
              onPointerDown={() => {
                keysPressedRef.current.right = true;
                playArcadeSound("flipper");
              }}
              onPointerUp={() => {
                keysPressedRef.current.right = false;
              }}
              onPointerCancel={() => {
                keysPressedRef.current.right = false;
              }}
              onPointerLeave={() => {
                keysPressedRef.current.right = false;
              }}
              onBlur={() => {
                keysPressedRef.current.right = false;
              }}
              className="h-12 rounded-lg border border-orange-200/25 bg-orange-200/12 px-5 text-xs font-bold uppercase tracking-wider text-orange-100 shadow-lg transition active:bg-orange-200/24"
              title="Flipper derecho"
            >
              Der
            </button>
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-10 rounded-lg border border-white/10 bg-[#17120f]/88 px-3 py-2 font-mono text-[11px] text-stone-300 shadow-lg">
          Activas: {ballCount}
        </div>
      </div>
    </div>
  );
}
