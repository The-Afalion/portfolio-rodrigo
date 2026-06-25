"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { Play, Pause, RefreshCw, Plus, Gamepad2, ChevronRight, Star, Trophy, Sparkles } from "lucide-react";

// Web Audio API Synthesizer for retro arcade sound effects
const playArcadeSound = (type: "launch" | "peg" | "bumper" | "score" | "jackpot" | "flipper" | "target") => {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.03, now);

    if (type === "launch") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (type === "peg") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(700 + Math.random() * 400, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "bumper") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(440, now + 0.06);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "target") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(550, now);
      osc.frequency.setValueAtTime(950, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "flipper") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(160, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "score") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === "jackpot") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      osc.frequency.setValueAtTime(1046.50, now + 0.24);
      osc.frequency.setValueAtTime(1318.51, now + 0.32);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (e) {}
};

function gaussian(x: number, mean: number, std: number) {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
}

// Generador de puntos sobre una curva Bezier cuadrática para crear curvas perfectas físicas
const getBezierPoints = (
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  steps = 20
) => {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
    points.push({ x, y });
  }
  return points;
};

const rows = 11;
const pegSpacing = 34;

export default function PhysicsLab() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  // Game states
  const [activeMode, setActiveMode] = useState<"galton" | "pachinko" | "pinball">("galton");
  const [ballCount, setBallCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [arcadeScore, setArcadeScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const keysPressedRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  const setup = (mode = activeMode) => {
    if (!sceneRef.current) return;

    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      sceneRef.current.innerHTML = "";
    }

    const { Engine, Render, Runner, Composite, Bodies, Body, Events } = Matter;
    const engine = Engine.create();
    engineRef.current = engine;

    engine.world.gravity.y = mode === "pinball" ? 1.75 : 1.3;

    const width = sceneRef.current.clientWidth || 700;
    const height = sceneRef.current.clientHeight || 650;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: "transparent",
        pixelRatio: typeof window !== "undefined" ? window.devicePixelRatio : 1,
      },
    });

    const bodiesToAdd: Matter.Body[] = [];

    // --- MODE 1: GALTON BOARD ---
    if (mode === "galton") {
      // 1. EMBUDO CURVO DE ALTA PRECISIÓN (Bezier) para evitar atascos y guiar las bolas al centro
      const funnelLeftPoints = getBezierPoints(
        { x: width / 2 - 130, y: 15 },
        { x: width / 2 - 80, y: 35 },
        { x: width / 2 - 8, y: 110 },
        20
      );
      const funnelRightPoints = getBezierPoints(
        { x: width / 2 + 130, y: 15 },
        { x: width / 2 + 80, y: 35 },
        { x: width / 2 + 8, y: 110 },
        20
      );

      // Crear las paredes del embudo usando pequeños círculos solapados (física de curva real y fluida)
      funnelLeftPoints.forEach(p => {
        bodiesToAdd.push(
          Bodies.circle(p.x, p.y, 4, {
            isStatic: true,
            friction: 0,
            render: { fillStyle: "#0891b2", strokeStyle: "#06b6d4", lineWidth: 1 }
          })
        );
      });
      funnelRightPoints.forEach(p => {
        bodiesToAdd.push(
          Bodies.circle(p.x, p.y, 4, {
            isStatic: true,
            friction: 0,
            render: { fillStyle: "#0891b2", strokeStyle: "#06b6d4", lineWidth: 1 }
          })
        );
      });

      // Cuello vertical ultra-estrecho (16px de ancho total) para alinear las bolas exactamente en el centro
      // De esta forma la dispersión inicial es nula y choca perfectamente en el vértice del primer peg.
      const neckLeft = Bodies.rectangle(width / 2 - 9, 130, 3, 40, {
        isStatic: true,
        friction: 0,
        render: { fillStyle: "#06b6d4" },
      });
      const neckRight = Bodies.rectangle(width / 2 + 9, 130, 3, 40, {
        isStatic: true,
        friction: 0,
        render: { fillStyle: "#06b6d4" },
      });
      bodiesToAdd.push(neckLeft, neckRight);

      // 2. REJILLA DE PEGS COMPACTA (Distancia vertical reducida a 26px para evitar botes violentos)
      const startY = 175;
      const verticalSpacing = 26;

      for (let row = 0; row < rows; row++) {
        const cols = row + 1;
        const rowWidth = (cols - 1) * pegSpacing;
        const startX = (width - rowWidth) / 2;
        
        // Colores de neón degradados según la profundidad
        const rowColor = row < 3 ? "#22d3ee" : row < 7 ? "#a855f7" : "#ec4899";

        for (let col = 0; col < cols; col++) {
          const x = startX + col * pegSpacing;
          const y = startY + row * verticalSpacing;
          bodiesToAdd.push(
            Bodies.circle(x, y, 2.5, {
              isStatic: true,
              restitution: 0.05, // Muy baja elasticidad para amortiguar botes caóticos
              friction: 0.02,
              label: "peg",
              render: { fillStyle: rowColor, strokeStyle: "#ffffff", lineWidth: 0.5 },
            })
          );
        }
      }

      // 3. COMPARTIMENTOS INFERIORES DE ALINEACIÓN COHERENTE (Buckets)
      const lastRowY = startY + (rows - 1) * verticalSpacing;
      const bucketStartY = lastRowY + 22; // Justo debajo del último peg
      const bucketHeight = height - bucketStartY - 5;
      const numBuckets = rows + 1;

      // Usar startX de la última fila para alinear los canales perfectamente
      const lastRowCols = rows;
      const lastRowWidth = (lastRowCols - 1) * pegSpacing;
      const lastRowStartX = (width - lastRowWidth) / 2;

      for (let i = 0; i <= numBuckets; i++) {
        // La divisoria del canal está exactamente debajo de los pegs de la última fila (las internas) y de los bordes (las externas)
        const x = lastRowStartX - pegSpacing + i * pegSpacing;
        const y = bucketStartY + bucketHeight / 2;

        // Pared del compartimento
        bodiesToAdd.push(
          Bodies.rectangle(x, y, 3, bucketHeight, {
            isStatic: true,
            render: { fillStyle: "#1e293b", strokeStyle: "rgba(6, 182, 212, 0.2)" },
          })
        );

        // Pequeño círculo redondeado en la punta superior del divisor para evitar que la bola se quede equilibrada
        bodiesToAdd.push(
          Bodies.circle(x, bucketStartY, 2, {
            isStatic: true,
            render: { fillStyle: "#0891b2" },
          })
        );
      }

      const ground = Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true });
      bodiesToAdd.push(ground);
    }

    // --- MODE 2: PACHINKO GAME ---
    else if (mode === "pachinko") {
      const leftWall = Bodies.rectangle(10, height / 2, 20, height, { isStatic: true, render: { fillStyle: "#0f172a" } });
      const rightWall = Bodies.rectangle(width - 10, height / 2, 20, height, { isStatic: true, render: { fillStyle: "#0f172a" } });
      
      // Canal del launcher a la derecha
      const rightLauncherWall = Bodies.rectangle(width - 50, height / 2 + 50, 8, height - 100, { 
        isStatic: true, 
        render: { fillStyle: "#334155" } 
      });
      
      const launcherPlungerFloor = Bodies.rectangle(width - 30, height - 15, 30, 10, {
        isStatic: true,
        render: { fillStyle: "#334155" },
      });

      const ground = Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true });
      bodiesToAdd.push(leftWall, rightLauncherWall, rightWall, launcherPlungerFloor, ground);

      // Cúpula superior curva de Bezier (curva física real de neón rosa)
      const leftDomePoints = getBezierPoints({ x: 15, y: 180 }, { x: 15, y: 30 }, { x: width / 2, y: 30 }, 20);
      const rightDomePoints = getBezierPoints({ x: width / 2, y: 30 }, { x: width - 15, y: 30 }, { x: width - 15, y: 90 }, 20);
      
      [...leftDomePoints, ...rightDomePoints].forEach(p => {
        bodiesToAdd.push(
          Bodies.circle(p.x, p.y, 7, {
            isStatic: true,
            restitution: 0.6,
            render: { fillStyle: "#1e1b4b", strokeStyle: "#ec4899", lineWidth: 1.5 }
          })
        );
      });

      // Deflector de salida (cuña inclinada a la izquierda) para evitar caídas de vuelta en el canal del launcher
      const laneDeflector = Bodies.rectangle(width - 65, 125, 8, 45, {
        isStatic: true,
        angle: -Math.PI / 4,
        render: { fillStyle: "#334155", strokeStyle: "#ec4899", lineWidth: 1 }
      });
      bodiesToAdd.push(laneDeflector);

      // Pins layout
      const startX = 35;
      const endX = width - 75;
      const startY = 90;
      const endY = height - 130;

      for (let y = startY; y < endY; y += 45) {
        const isOffset = (y / 45) % 2 === 0;
        const spacingX = 40;
        const initialX = isOffset ? startX + 20 : startX;
        for (let x = initialX; x < endX; x += spacingX) {
          if (Math.abs(x - width / 2) < 40 && Math.abs(y - height / 2) < 50) continue;

          bodiesToAdd.push(
            Bodies.circle(x, y, 3, {
              isStatic: true,
              restitution: 0.8,
              label: "peg",
              render: { fillStyle: "#94a3b8" },
            })
          );
        }
      }

      const spinner1 = Bodies.rectangle(width / 2 - 80, height / 2 - 20, 65, 6, {
        isStatic: true,
        label: "spinner",
        render: { fillStyle: "#ec4899", strokeStyle: "#fbcfe8", lineWidth: 1 },
      });
      const spinner2 = Bodies.rectangle(width / 2 + 80, height / 2 - 20, 65, 6, {
        isStatic: true,
        label: "spinner",
        render: { fillStyle: "#ec4899", strokeStyle: "#fbcfe8", lineWidth: 1 },
      });
      bodiesToAdd.push(spinner1, spinner2);

      const scoreCups = [
        { x: 60, width: 75, label: "cup-20", score: 20, fill: "rgba(51, 65, 85, 0.6)" },
        { x: 145, width: 75, label: "cup-100", score: 100, fill: "rgba(245, 158, 11, 0.25)" },
        { x: width / 2 - 15, width: 75, label: "cup-jackpot", score: 500, fill: "rgba(236, 72, 153, 0.3)" },
        { x: width - 180, width: 75, label: "cup-100", score: 100, fill: "rgba(245, 158, 11, 0.25)" },
        { x: width - 95, width: 75, label: "cup-20", score: 20, fill: "rgba(51, 65, 85, 0.6)" },
      ];

      scoreCups.forEach(cup => {
        const bottom = Bodies.rectangle(cup.x, height - 15, cup.width - 12, 8, {
          isStatic: true,
          isSensor: true,
          label: cup.label,
          render: { fillStyle: cup.fill, strokeStyle: "#cbd5e1", lineWidth: 1 },
        });
        const leftWall = Bodies.rectangle(cup.x - cup.width / 2, height - 35, 6, 40, { isStatic: true, render: { fillStyle: "#475569" } });
        const rightWall = Bodies.rectangle(cup.x + cup.width / 2, height - 35, 6, 40, { isStatic: true, render: { fillStyle: "#475569" } });
        bodiesToAdd.push(bottom, leftWall, rightWall);
      });

      Events.on(engine, "beforeUpdate", () => {
        Body.rotate(spinner1, 0.045);
        Body.rotate(spinner2, -0.045);
      });
    }

    // --- MODE 3: NEON ADVANCED PINBALL (CURVED ARCH & ADVANCED ZONES) ---
    else if (mode === "pinball") {
      // 1. CÚPULA SUPERIOR CURVA REAL ASIMÉTRICA (Bezier)
      // La curva izquierda va desde la pared izquierda (15, 180) hasta el centro superior (330, 30)
      const leftDomePoints = getBezierPoints({ x: 15, y: 180 }, { x: 15, y: 30 }, { x: 330, y: 30 }, 20);
      // La curva derecha va desde el centro superior (330, 30) hasta el canal derecho (width - 15, 90)
      const rightDomePoints = getBezierPoints({ x: 330, y: 30 }, { x: width - 15, y: 30 }, { x: width - 15, y: 90 }, 20);
      
      // Crear los cuerpos del arco superior con círculos pequeños de neón cian (curvas físicas e interactivos fluidos)
      [...leftDomePoints, ...rightDomePoints].forEach(p => {
        bodiesToAdd.push(
          Bodies.circle(p.x, p.y, 7, {
            isStatic: true,
            restitution: 0.65,
            render: { fillStyle: "#1e1b4b", strokeStyle: "#06b6d4", lineWidth: 1.5 }
          })
        );
      });

      // 2. GUIAS DE RETORNO INFERIORES CURVAS (Cóncavas hacia arriba, llevando la bola a los flippers)
      const leftGuidePoints = getBezierPoints(
        { x: 15, y: height - 160 },
        { x: 75, y: height - 145 },
        { x: width / 2 - 120, y: height - 90 },
        15
      );
      const rightGuidePoints = getBezierPoints(
        { x: width - 55, y: height - 160 },
        { x: width - 115, y: height - 145 },
        { x: width / 2 + 70, y: height - 90 },
        15
      );

      leftGuidePoints.forEach(p => {
        bodiesToAdd.push(
          Bodies.circle(p.x, p.y, 5, {
            isStatic: true,
            restitution: 0.2,
            render: { fillStyle: "#1e3a8a", strokeStyle: "#3b82f6", lineWidth: 1.5 }
          })
        );
      });
      rightGuidePoints.forEach(p => {
        bodiesToAdd.push(
          Bodies.circle(p.x, p.y, 5, {
            isStatic: true,
            restitution: 0.2,
            render: { fillStyle: "#1e3a8a", strokeStyle: "#3b82f6", lineWidth: 1.5 }
          })
        );
      });

      // 3. RAMPA CURVA DE NEÓN NARANJA (Atraviesa el centro)
      const centerRampPoints = getBezierPoints(
        { x: width / 2 + 80, y: 150 },
        { x: width / 2 - 90, y: 220 },
        { x: 95, y: height - 260 },
        25
      );
      
      // Creamos dos rieles desplazados horizontalmente para guiar la bola
      centerRampPoints.forEach(p => {
        // Riel izquierdo
        bodiesToAdd.push(
          Bodies.circle(p.x - 12, p.y, 3, {
            isStatic: true,
            render: { fillStyle: "#7c2d12", strokeStyle: "#f97316", lineWidth: 1 }
          })
        );
        // Riel derecho
        bodiesToAdd.push(
          Bodies.circle(p.x + 12, p.y, 3, {
            isStatic: true,
            render: { fillStyle: "#7c2d12", strokeStyle: "#f97316", lineWidth: 1 }
          })
        );
      });

      // Sensor en medio de la rampa para detectar el paso de la bola (Rampa Jackpot!)
      const midRampPoint = centerRampPoints[Math.floor(centerRampPoints.length / 2)];
      const rampSensor = Bodies.circle(midRampPoint.x, midRampPoint.y, 16, {
        isStatic: true,
        isSensor: true,
        label: "ramp-sensor",
        render: { visible: false } // Invisible, solo detecta colisión
      });
      bodiesToAdd.push(rampSensor);

      // 4. CANAL DE LANZAMIENTO (Plunger Lane)
      const plungerLaneWall = Bodies.rectangle(width - 45, height / 2 + 75, 8, height - 150, {
        isStatic: true,
        render: { fillStyle: "#334155" },
      });
      const plungerFloor = Bodies.rectangle(width - 25, height - 15, 35, 12, {
        isStatic: true,
        render: { fillStyle: "#1e293b", strokeStyle: "#475569", lineWidth: 1.5 },
      });
      
      // Deflector antirretorno superior (cuña estática) para guiar la bola hacia el tablero al caer
      const laneDeflector = Bodies.rectangle(width - 65, 135, 8, 45, {
        isStatic: true,
        angle: -Math.PI / 4,
        render: { fillStyle: "#334155", strokeStyle: "#06b6d4", lineWidth: 1 }
      });

      // Límites de la cabina
      const leftWall = Bodies.rectangle(10, height / 2, 20, height, { isStatic: true, render: { fillStyle: "#0f172a" } });
      const rightWall = Bodies.rectangle(width - 10, height / 2, 20, height, { isStatic: true, render: { fillStyle: "#0f172a" } });
      const drainSensor = Bodies.rectangle(width / 2, height + 15, width, 10, {
        isStatic: true,
        isSensor: true,
        label: "drain",
      });

      bodiesToAdd.push(plungerLaneWall, plungerFloor, laneDeflector, leftWall, rightWall, drainSensor);

      // 5. ZONA DE BUMPERS REDONDEADOS
      const bumperLeft = Bodies.circle(width / 2 - 90, 150, 26, {
        isStatic: true,
        label: "bumper-emerald",
        render: { fillStyle: "#047857", strokeStyle: "#10b981", lineWidth: 4 },
      });
      const bumperRight = Bodies.circle(width / 2 + 40, 130, 26, {
        isStatic: true,
        label: "bumper-emerald",
        render: { fillStyle: "#047857", strokeStyle: "#10b981", lineWidth: 4 },
      });
      const bumperSuper = Bodies.circle(width / 2 - 25, 240, 32, {
        isStatic: true,
        label: "bumper-super",
        render: { fillStyle: "#be185d", strokeStyle: "#f43f5e", lineWidth: 5 },
      });
      bodiesToAdd.push(bumperLeft, bumperRight, bumperSuper);

      // 6. SLINGSHOTS CON FUERZAS DE RETROCESO (Triángulos elásticos sobre flippers)
      const slingshotLeft = Bodies.polygon(100, height - 240, 3, 35, {
        isStatic: true,
        angle: Math.PI / 3,
        label: "slingshot-left",
        render: { fillStyle: "#a21caf", strokeStyle: "#d946ef", lineWidth: 2 },
      });
      const slingshotRight = Bodies.polygon(width - 160, height - 240, 3, 35, {
        isStatic: true,
        angle: -Math.PI / 3,
        label: "slingshot-right",
        render: { fillStyle: "#a21caf", strokeStyle: "#d946ef", lineWidth: 2 },
      });
      bodiesToAdd.push(slingshotLeft, slingshotRight);

      // 7. ROLLOVERS (Líneas de sensores superiores)
      const rollLanes = [width / 2 - 130, width / 2 - 70, width / 2 - 10, width / 2 + 50];
      rollLanes.forEach((laneX, i) => {
        bodiesToAdd.push(
          Bodies.rectangle(laneX - 18, 55, 4, 30, {
            isStatic: true,
            render: { fillStyle: "#475569" },
          })
        );
        bodiesToAdd.push(
          Bodies.rectangle(laneX, 55, 20, 6, {
            isStatic: true,
            isSensor: true,
            label: `rollover-${i}`,
            render: { fillStyle: "rgba(56, 189, 248, 0.25)" },
          })
        );
      });

      // 8. DIANAS LATERALES (Targets)
      const targetLeft = Bodies.rectangle(35, 200, 8, 35, {
        isStatic: true,
        label: "target-left",
        render: { fillStyle: "#e11d48", strokeStyle: "#fb7185", lineWidth: 2 },
      });
      const targetRight = Bodies.rectangle(width - 80, 200, 8, 35, {
        isStatic: true,
        label: "target-right",
        render: { fillStyle: "#e11d48", strokeStyle: "#fb7185", lineWidth: 2 },
      });
      bodiesToAdd.push(targetLeft, targetRight);

      // 9. DEFLECTORES DE DESVÍO CURVOS
      const deflectorLeft = Bodies.polygon(70, 320, 3, 25, {
        isStatic: true,
        angle: Math.PI / 4,
        render: { fillStyle: "#1e1b4b", strokeStyle: "#818cf8", lineWidth: 1.5 },
      });
      const deflectorRight = Bodies.polygon(width - 120, 320, 3, 25, {
        isStatic: true,
        angle: -Math.PI / 4,
        render: { fillStyle: "#1e1b4b", strokeStyle: "#818cf8", lineWidth: 1.5 },
      });
      bodiesToAdd.push(deflectorLeft, deflectorRight);

      // 10. FLIPPERS CON PIVOTE EXTREMO REALISTA Y VELOCIDAD DE GOLPE
      const leftFlipper = Bodies.rectangle(width / 2 - 90, height - 80, 80, 16, {
        isStatic: true,
        label: "left-flipper",
        render: { fillStyle: "#d946ef", strokeStyle: "#fdf4ff", lineWidth: 1.5 },
      });
      const rightFlipper = Bodies.rectangle(width / 2 + 40, height - 80, 80, 16, {
        isStatic: true,
        label: "right-flipper",
        render: { fillStyle: "#d946ef", strokeStyle: "#fdf4ff", lineWidth: 1.5 },
      });
      bodiesToAdd.push(leftFlipper, rightFlipper);

      // Ángulos iniciales y de rotación
      let leftAngle = 0.28;
      let rightAngle = -0.28;

      Events.on(engine, "beforeUpdate", () => {
        // Rotar flipper izquierdo sobre su extremo izquierdo (Pivot)
        const leftTarget = keysPressedRef.current.left ? -0.38 : 0.28;
        const prevLeftAngle = leftFlipper.angle;
        leftAngle += (leftTarget - leftAngle) * 0.42;

        const leftPivotX = width / 2 - 130;
        const leftPivotY = height - 80;
        Body.setAngle(leftFlipper, leftAngle);
        Body.setPosition(leftFlipper, {
          x: leftPivotX + 40 * Math.cos(leftAngle),
          y: leftPivotY + 40 * Math.sin(leftAngle)
        });
        // Asignar velocidad física angular y lineal para golpear la bola de verdad
        Body.setAngularVelocity(leftFlipper, leftAngle - prevLeftAngle);
        Body.setVelocity(leftFlipper, {
          x: -40 * Math.sin(leftAngle) * (leftAngle - prevLeftAngle),
          y: 40 * Math.cos(leftAngle) * (leftAngle - prevLeftAngle)
        });

        // Rotar flipper derecho sobre su extremo derecho (Pivot)
        const rightTarget = keysPressedRef.current.right ? 0.38 : -0.28;
        const prevRightAngle = rightFlipper.angle;
        rightAngle += (rightTarget - rightAngle) * 0.42;

        const rightPivotX = width / 2 + 80;
        const rightPivotY = height - 80;
        Body.setAngle(rightFlipper, rightAngle);
        Body.setPosition(rightFlipper, {
          x: rightPivotX - 40 * Math.cos(rightAngle),
          y: rightPivotY - 40 * Math.sin(rightAngle)
        });
        // Asignar velocidad física angular y lineal
        Body.setAngularVelocity(rightFlipper, rightAngle - prevRightAngle);
        Body.setVelocity(rightFlipper, {
          x: 40 * Math.sin(rightAngle) * (rightAngle - prevRightAngle),
          y: -40 * Math.cos(rightAngle) * (rightAngle - prevRightAngle)
        });
      });
    }

    Composite.add(engine.world, bodiesToAdd);

    // Collisions
    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if (bodyA.label === "peg" || bodyB.label === "peg") {
          playArcadeSound("peg");
        }

        if (bodyA.label === "bumper-emerald" || bodyB.label === "bumper-emerald") {
          const bumper = bodyA.label === "bumper-emerald" ? bodyA : bodyB;
          const ball = bodyA.label === "bumper-emerald" ? bodyB : bodyA;

          playArcadeSound("bumper");
          
          const forceDir = Matter.Vector.normalise(Matter.Vector.sub(ball.position, bumper.position));
          Matter.Body.setVelocity(ball, Matter.Vector.mult(forceDir, 18)); // Extra speed

          bumper.render.fillStyle = "#34d399";
          setTimeout(() => { bumper.render.fillStyle = "#047857"; }, 100);
          setArcadeScore(prev => prev + 100);
        }

        if (bodyA.label === "bumper-super" || bodyB.label === "bumper-super") {
          const bumper = bodyA.label === "bumper-super" ? bodyA : bodyB;
          const ball = bodyA.label === "bumper-super" ? bodyB : bodyA;

          playArcadeSound("jackpot");
          
          const forceDir = Matter.Vector.normalise(Matter.Vector.sub(ball.position, bumper.position));
          Matter.Body.setVelocity(ball, Matter.Vector.mult(forceDir, 24)); // Super bounce force

          bumper.render.fillStyle = "#f43f5e";
          setTimeout(() => { bumper.render.fillStyle = "#be185d"; }, 100);
          setArcadeScore(prev => prev + 250);
        }

        if (bodyA.label?.startsWith("slingshot") || bodyB.label?.startsWith("slingshot")) {
          const slingshot = bodyA.label?.startsWith("slingshot") ? bodyA : bodyB;
          const ball = bodyA.label?.startsWith("slingshot") ? bodyB : bodyA;

          playArcadeSound("bumper");

          const xKickDir = slingshot.label.endsWith("left") ? 1 : -1;
          Matter.Body.setVelocity(ball, { x: xKickDir * 14, y: -9 });

          slingshot.render.fillStyle = "#f472b6";
          setTimeout(() => { slingshot.render.fillStyle = "#a21caf"; }, 100);
          setArcadeScore(prev => prev + 50);
        }

        if (bodyA.label?.startsWith("rollover-") || bodyB.label?.startsWith("rollover-")) {
          const sensor = bodyA.label?.startsWith("rollover-") ? bodyA : bodyB;
          playArcadeSound("target");

          sensor.render.fillStyle = "rgba(56, 189, 248, 0.85)";
          setTimeout(() => { sensor.render.fillStyle = "rgba(56, 189, 248, 0.25)"; }, 250);
          setArcadeScore(prev => prev + 150);
        }

        if (bodyA.label?.startsWith("target-") || bodyB.label?.startsWith("target-")) {
          const target = bodyA.label?.startsWith("target-") ? bodyA : bodyB;
          playArcadeSound("target");

          target.render.fillStyle = "#fda4af";
          setTimeout(() => { target.render.fillStyle = "#e11d48"; }, 100);
          setArcadeScore(prev => prev + 300);
        }

        if (bodyA.label === "ramp-sensor" || bodyB.label === "ramp-sensor") {
          playArcadeSound("jackpot");
          setArcadeScore(prev => prev + 500);
        }

        if (bodyA.label?.startsWith("cup-") || bodyB.label?.startsWith("cup-")) {
          const cup = bodyA.label?.startsWith("cup-") ? bodyA : bodyB;
          const ball = bodyA.label?.startsWith("cup-") ? bodyB : bodyA;

          Matter.Composite.remove(engine.world, ball);
          setBallCount(c => Math.max(0, c - 1));

          const scoreVal = parseInt(cup.label.split("-")[1]) || 20;
          if (scoreVal === 500) {
            playArcadeSound("jackpot");
          } else {
            playArcadeSound("score");
          }
          setArcadeScore(prev => prev + scoreVal);
        }

        if (bodyA.label === "drain" || bodyB.label === "drain") {
          const ball = bodyA.label === "drain" ? bodyB : bodyA;
          Matter.Composite.remove(engine.world, ball);
          setBallCount(c => Math.max(0, c - 1));
          playArcadeSound("peg");
        }
      });
    });

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    setBallCount(0);
    setIsPaused(false);
  };

  useEffect(() => {
    setup();
    return () => {
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flipper key binds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMode !== "pinball") return;
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        if (!keysPressedRef.current.left) playArcadeSound("flipper");
        keysPressedRef.current.left = true;
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        if (!keysPressedRef.current.right) playArcadeSound("flipper");
        keysPressedRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (activeMode !== "pinball") return;
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        keysPressedRef.current.left = false;
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        keysPressedRef.current.right = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeMode]);

  useEffect(() => {
    if (arcadeScore > highScore) {
      setHighScore(arcadeScore);
    }
  }, [arcadeScore, highScore]);

  // Launches balls correctly with adjusted frictionAir to keep momentum
  const addBalls = (count: number) => {
    if (!engineRef.current || !sceneRef.current) return;
    const width = sceneRef.current.clientWidth || 700;
    const height = sceneRef.current.clientHeight || 650;

    playArcadeSound("launch");

    if (activeMode === "galton") {
      const colors = ["#22d3ee", "#ec4899", "#f59e0b", "#10b981", "#a855f7"];
      for (let i = 0; i < count; i++) {
        // Reducido el esparcimiento horizontal para que entren perfectamente alineadas por el cuello de 16px
        const x = width / 2 + (Math.random() - 0.5) * 4;
        const y = 30 - i * 14;
        const ball = Matter.Bodies.circle(x, y, 5, {
          restitution: 0.05, // Symmetrical low bounciness matching grid settings
          friction: 0.001,
          frictionAir: 0.001,
          density: 0.001,
          render: { fillStyle: colors[i % colors.length] },
        });
        Matter.Composite.add(engineRef.current.world, ball);
      }
      setBallCount(c => c + count);
    } 
    else if (activeMode === "pachinko") {
      // Pachinko now launches only 1 ball per click for clean control
      for (let i = 0; i < count; i++) {
        const x = width - 30;
        const y = height - 45;
        const ball = Matter.Bodies.circle(x, y, 6.5, {
          restitution: 0.5,
          friction: 0.002,
          density: 0.001,
          frictionAir: 0.0002, // Mínima resistencia al aire
          render: { fillStyle: "#38bdf8" },
        });
        // Fuerza de lanzamiento aumentada a -32 para que suba holgadamente hasta arriba
        Matter.Body.setVelocity(ball, { x: 0, y: -32 });
        Matter.Composite.add(engineRef.current.world, ball);
      }
      setBallCount(c => c + count);
    }
    else if (activeMode === "pinball") {
      // La bola se lanza en x = width - 20 (centro del canal)
      const x = width - 20;
      const y = height - 45;
      const ball = Matter.Bodies.circle(x, y, 7.5, {
        restitution: 0.45,
        friction: 0.0005,
        density: 0.002,
        frictionAir: 0.0002, // Mínimo roce para conservar momento en curvas y rampas
        render: { fillStyle: "#facc15", strokeStyle: "#ffffff", lineWidth: 1 },
      });
      
      // Lanzamiento de alta potencia (-42) para asegurar que supere la cúpula superior
      Matter.Body.setVelocity(ball, { x: 0, y: -42 });
      Matter.Composite.add(engineRef.current.world, ball);
      setBallCount(c => c + 1);
    }
  };

  const changeMode = (mode: "galton" | "pachinko" | "pinball") => {
    playArcadeSound("score");
    setActiveMode(mode);
    setArcadeScore(0);
    setup(mode);
  };

  const togglePause = () => {
    if (!runnerRef.current) return;
    runnerRef.current.enabled = !runnerRef.current.enabled;
    setIsPaused(!isPaused);
  };

  // Gaussian probability path
  const numBuckets = rows + 1;
  const mean = numBuckets / 2;
  const stdDev = Math.sqrt(rows * 0.5 * 0.5);
  const pathData = Array.from({ length: 100 }).map((_, i) => {
    const x = (i / 99) * numBuckets;
    const y = gaussian(x, mean, stdDev);
    return { x, y };
  });
  const maxGaussianY = gaussian(mean, mean, stdDev);
  const svgPath = pathData.map(p => {
    const width = sceneRef.current?.clientWidth || 700;
    const height = sceneRef.current?.clientHeight || 650;
    const totalBucketsWidth = numBuckets * pegSpacing;
    const startBucketX = (width - totalBucketsWidth) / 2;
    return `${startBucketX + p.x * pegSpacing},${height - 10 - (p.y / maxGaussianY) * 165}`;
  }).join(" L ");

  return (
    <div className="w-full h-full relative flex flex-col justify-between bg-slate-950/90 rounded-xl overflow-hidden border border-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
      {/* Mode Toolbar */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 bg-slate-900/60 p-4 shrink-0 select-none z-10">
        <div className="flex items-center gap-3">
          <Gamepad2 className="text-cyan-400 animate-pulse" size={20} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-200">Física Interactiva</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => changeMode("galton")}
            className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider transition-all border ${
              activeMode === "galton"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "bg-slate-800/40 text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Tablero Galton
          </button>
          <button
            onClick={() => changeMode("pachinko")}
            className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider transition-all border ${
              activeMode === "pachinko"
                ? "bg-pink-500/20 text-pink-300 border-pink-400/50 shadow-[0_0_10px_rgba(236,72,153,0.15)]"
                : "bg-slate-800/40 text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Pachinko Espacial
          </button>
          <button
            onClick={() => changeMode("pinball")}
            className={`px-3 py-1.5 rounded text-xs font-semibold tracking-wider transition-all border ${
              activeMode === "pinball"
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50 shadow-[0_0_10px_rgba(234,179,8,0.15)]"
                : "bg-slate-800/40 text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            Pinball Retro
          </button>
        </div>
      </div>

      {/* Physics Area */}
      <div className="flex-1 relative min-h-0 bg-radial-grid">
        <div ref={sceneRef} className="w-full h-full" />
        
        {/* Galton gaussian probability path */}
        {activeMode === "galton" && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 animate-pulse" viewBox={`0 0 ${sceneRef.current?.clientWidth || 700} ${sceneRef.current?.clientHeight || 650}`}>
            <path d={`M ${svgPath}`} fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="5 5" />
          </svg>
        )}

        {/* Scoreboard display */}
        {activeMode !== "galton" && (
          <div className="absolute top-4 right-4 flex items-center gap-4 bg-slate-900/90 border border-cyan-500/20 px-4 py-2 rounded-lg font-mono text-xs shadow-lg select-none z-10">
            <div className="flex items-center gap-1.5">
              <Star size={12} className="text-yellow-400" />
              <span className="text-slate-400">PUNTOS:</span>
              <span className="font-bold text-white tracking-widest">{arcadeScore}</span>
            </div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Trophy size={12} className="text-cyan-400" />
              <span className="text-slate-400">RÉCORD:</span>
              <span className="font-bold text-white tracking-widest">{highScore}</span>
            </div>
          </div>
        )}

        {/* Interactive action controls */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <button 
            onClick={togglePause} 
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/10 hover:border-cyan-500/30 rounded-lg text-slate-300 transition-colors shadow-md"
            title="Pausar"
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button 
            onClick={() => setup(activeMode)} 
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/10 hover:border-cyan-500/30 rounded-lg text-slate-300 transition-colors shadow-md"
            title="Reiniciar"
          >
            <RefreshCw size={15} />
          </button>
          
          <button 
            onClick={() => addBalls(1)} 
            className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/30 hover:border-cyan-400/50 rounded-lg text-cyan-200 transition-colors shadow-md flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            <Plus size={14} /> Lanzar Bola
          </button>
          {activeMode === "galton" && (
            <button 
              onClick={() => addBalls(100)} 
              className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/30 hover:border-cyan-400/50 rounded-lg text-cyan-200 transition-colors shadow-md flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              <Plus size={14} /> 100 Bolas
            </button>
          )}
        </div>

        {/* Pinball HUD Controllers */}
        {activeMode === "pinball" && (
          <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-cyan-500/20 p-3 rounded-lg text-[10px] text-slate-400 font-mono shadow-lg select-none z-10 leading-normal max-w-[280px]">
            <p className="font-bold text-yellow-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles size={11} /> Control de Cabina
            </p>
            <p className="mb-0.5">&bull; Flipper Izq: <kbd className="bg-slate-800 px-1 border border-white/10 rounded">Flecha Izq</kbd> / <kbd className="bg-slate-800 px-1 border border-white/10 rounded">A</kbd></p>
            <p>&bull; Flipper Der: <kbd className="bg-slate-800 px-1 border border-white/10 rounded">Flecha Der</kbd> / <kbd className="bg-slate-800 px-1 border border-white/10 rounded">D</kbd></p>
            <div className="flex gap-2 mt-3.5">
              <button 
                onMouseDown={() => { keysPressedRef.current.left = true; playArcadeSound("flipper"); }}
                onMouseUp={() => { keysPressedRef.current.left = false; }}
                onTouchStart={() => { keysPressedRef.current.left = true; playArcadeSound("flipper"); }}
                onTouchEnd={() => { keysPressedRef.current.left = false; }}
                className="flex-1 bg-cyan-500/20 active:bg-cyan-500/40 border border-cyan-500/30 py-2.5 rounded text-cyan-200 font-bold uppercase tracking-wider text-[9px] touch-none select-none"
              >
                Izquierda
              </button>
              <button 
                onMouseDown={() => { keysPressedRef.current.right = true; playArcadeSound("flipper"); }}
                onMouseUp={() => { keysPressedRef.current.right = false; }}
                onTouchStart={() => { keysPressedRef.current.right = true; playArcadeSound("flipper"); }}
                onTouchEnd={() => { keysPressedRef.current.right = false; }}
                className="flex-1 bg-cyan-500/20 active:bg-cyan-500/40 border border-cyan-500/30 py-2.5 rounded text-cyan-200 font-bold uppercase tracking-wider text-[9px] touch-none select-none"
              >
                Derecha
              </button>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-cyan-500/10 px-3 py-1.5 rounded-lg font-mono text-[10px] text-slate-400 select-none shadow-md z-10">
          ACTIVAS: {ballCount}
        </div>
      </div>
    </div>
  );
}
