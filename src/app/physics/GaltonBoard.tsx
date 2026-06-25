"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { Play, Pause, RefreshCw, Plus, Gamepad2, ChevronRight, HelpCircle, Star, Trophy } from "lucide-react";

// Web Audio API Synthesizer for retro arcade sound effects
const playArcadeSound = (type: "launch" | "peg" | "bumper" | "score" | "jackpot") => {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.04, now);

    if (type === "launch") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === "peg") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(900 + Math.random() * 200, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "bumper") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "score") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "jackpot") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {}
};

function gaussian(x: number, mean: number, std: number) {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
}

const rows = 12;
const pegSpacing = 40;

export default function PhysicsLab() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  // Simulation and Game state
  const [activeMode, setActiveMode] = useState<"galton" | "pachinko" | "pinball">("galton");
  const [ballCount, setBallCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [arcadeScore, setArcadeScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Flipper keys active trackers (using refs for the Matter.js frame loop)
  const keysPressedRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  const setup = (mode = activeMode) => {
    if (!sceneRef.current) return;

    // Reset Matter.js
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      sceneRef.current.innerHTML = "";
    }

    const { Engine, Render, Runner, Composite, Bodies, Body, Events } = Matter;
    const engine = Engine.create();
    engineRef.current = engine;

    // Apply gravity
    engine.world.gravity.y = mode === "pinball" ? 1.5 : 1.2;

    const width = sceneRef.current.clientWidth || 700;
    const height = sceneRef.current.clientHeight || 600;

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
      // 1. Funnel (Embudo) & Neck at the top to guide balls in a straight line
      const funnelLeft = Bodies.rectangle(width / 2 - 55, 55, 110, 6, {
        isStatic: true,
        angle: Math.PI / 6, // 30 degrees
        render: { fillStyle: "#67e8f9", strokeStyle: "#22d3ee", lineWidth: 1 },
      });
      const funnelRight = Bodies.rectangle(width / 2 + 55, 55, 110, 6, {
        isStatic: true,
        angle: -Math.PI / 6,
        render: { fillStyle: "#67e8f9", strokeStyle: "#22d3ee", lineWidth: 1 },
      });
      const neckLeft = Bodies.rectangle(width / 2 - 12, 100, 4, 30, {
        isStatic: true,
        render: { fillStyle: "#67e8f9" },
      });
      const neckRight = Bodies.rectangle(width / 2 + 12, 100, 4, 30, {
        isStatic: true,
        render: { fillStyle: "#67e8f9" },
      });

      bodiesToAdd.push(funnelLeft, funnelRight, neckLeft, neckRight);

      // 2. Triangular Peg grid
      const pegRadius = 3;
      const startY = 135;
      for (let row = 0; row < rows; row++) {
        const cols = row + 3;
        const rowWidth = (cols - 1) * pegSpacing;
        const startX = (width - rowWidth) / 2;
        for (let col = 0; col < cols; col++) {
          const x = startX + col * pegSpacing;
          const y = startY + row * pegSpacing;
          bodiesToAdd.push(
            Bodies.circle(x, y, pegRadius, {
              isStatic: true,
              restitution: 0.6,
              friction: 0.01,
              label: "peg",
              render: { fillStyle: "#cbd5e1" },
            })
          );
        }
      }

      // 3. Collecting Buckets at the bottom
      const bucketWidth = 6;
      const bucketHeight = 160;
      const numBuckets = rows + 2;
      const totalBucketsWidth = numBuckets * pegSpacing;
      const startBucketX = (width - totalBucketsWidth) / 2;
      const bucketY = height - bucketHeight / 2;

      for (let i = 0; i <= numBuckets; i++) {
        const x = startBucketX + i * pegSpacing;
        bodiesToAdd.push(
          Bodies.rectangle(x, bucketY, bucketWidth, bucketHeight, {
            isStatic: true,
            render: { fillStyle: "#334155" },
          })
        );
      }

      const ground = Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true });
      bodiesToAdd.push(ground);
    }

    // --- MODE 2: PACHINKO GAME ---
    else if (mode === "pachinko") {
      // Boundaries & Plunger launcher channel
      const leftWall = Bodies.rectangle(10, height / 2, 20, height, { isStatic: true, render: { fillStyle: "#1e293b" } });
      const rightLauncherWall = Bodies.rectangle(width - 50, height / 2 + 40, 8, height - 80, { isStatic: true, render: { fillStyle: "#475569" } });
      const rightWall = Bodies.rectangle(width - 10, height / 2, 20, height, { isStatic: true, render: { fillStyle: "#1e293b" } });
      const ground = Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true });

      bodiesToAdd.push(leftWall, rightLauncherWall, rightWall, ground);

      // Angled entry guide at top right to push balls from launcher into main board
      const upperRightGuide = Bodies.rectangle(width - 60, 40, 100, 6, {
        isStatic: true,
        angle: Math.PI / 4,
        render: { fillStyle: "#f43f5e" },
      });
      bodiesToAdd.push(upperRightGuide);

      // Pins layout with fun circular obstacles and bumpers
      const startX = 30;
      const endX = width - 70;
      const startY = 80;
      const endY = height - 120;

      for (let y = startY; y < endY; y += 45) {
        const isOffset = (y / 45) % 2 === 0;
        const spacingX = 40;
        const initialX = isOffset ? startX + 20 : startX;
        for (let x = initialX; x < endX; x += spacingX) {
          // Leave room for spinner centers or special pegs
          if (Math.abs(x - width / 2) < 30 && Math.abs(y - height / 2) < 40) continue;

          bodiesToAdd.push(
            Bodies.circle(x, y, 3, {
              isStatic: true,
              restitution: 0.8,
              label: "peg",
              render: { fillStyle: "#e2e8f0" },
            })
          );
        }
      }

      // Add two animated static spinners (rotates in collision tick)
      const spinner1 = Bodies.rectangle(width / 2 - 80, height / 2 - 20, 60, 6, {
        isStatic: true,
        label: "spinner",
        render: { fillStyle: "#f59e0b" },
      });
      const spinner2 = Bodies.rectangle(width / 2 + 80, height / 2 - 20, 60, 6, {
        isStatic: true,
        label: "spinner",
        render: { fillStyle: "#f59e0b" },
      });
      bodiesToAdd.push(spinner1, spinner2);

      // Catch cups with different scores at the bottom
      const scoreCups = [
        { x: 60, width: 80, label: "cup-10", score: 10, fill: "#334155" },
        { x: 150, width: 80, label: "cup-50", score: 50, fill: "#f59e0b" },
        { x: width / 2 - 15, width: 80, label: "cup-jackpot", score: 500, fill: "#ec4899" }, // Jackpot central
        { x: width - 180, width: 80, label: "cup-50", score: 50, fill: "#f59e0b" },
        { x: width - 90, width: 80, label: "cup-10", score: 10, fill: "#334155" },
      ];

      scoreCups.forEach(cup => {
        // Cup bottom triggers score
        const bottom = Bodies.rectangle(cup.x, height - 15, cup.width - 10, 8, {
          isStatic: true,
          isSensor: true,
          label: cup.label,
          render: { fillStyle: cup.fill },
        });
        // Cup side walls
        const leftWall = Bodies.rectangle(cup.x - cup.width / 2, height - 35, 6, 40, { isStatic: true, render: { fillStyle: "#475569" } });
        const rightWall = Bodies.rectangle(cup.x + cup.width / 2, height - 35, 6, 40, { isStatic: true, render: { fillStyle: "#475569" } });
        bodiesToAdd.push(bottom, leftWall, rightWall);
      });

      // Update spinner rotations on every tick
      Events.on(engine, "beforeUpdate", () => {
        Body.rotate(spinner1, 0.04);
        Body.rotate(spinner2, -0.04);
      });
    }

    // --- MODE 3: PINBALL TABLE ---
    else if (mode === "pinball") {
      // Slanted bottom guides directing balls to flippers
      const leftGuide = Bodies.rectangle(110, height - 110, 180, 8, {
        isStatic: true,
        angle: Math.PI / 8,
        render: { fillStyle: "#3b82f6" },
      });
      const rightGuide = Bodies.rectangle(width - 160, height - 110, 180, 8, {
        isStatic: true,
        angle: -Math.PI / 8,
        render: { fillStyle: "#3b82f6" },
      });

      // Plunger lane wall on the right
      const rightLaneWall = Bodies.rectangle(width - 45, height / 2 + 50, 6, height - 100, {
        isStatic: true,
        render: { fillStyle: "#475569" },
      });

      // Outer frame
      const leftWall = Bodies.rectangle(10, height / 2, 20, height, { isStatic: true, render: { fillStyle: "#1e293b" } });
      const rightWall = Bodies.rectangle(width - 10, height / 2, 20, height, { isStatic: true, render: { fillStyle: "#1e293b" } });
      const topWall = Bodies.rectangle(width / 2, 10, width, 20, { isStatic: true, render: { fillStyle: "#1e293b" } });
      const drainSensor = Bodies.rectangle(width / 2, height + 15, width, 10, {
        isStatic: true,
        isSensor: true,
        label: "drain",
      });

      bodiesToAdd.push(leftGuide, rightGuide, rightLaneWall, leftWall, rightWall, topWall, drainSensor);

      // Curved launcher guide at top right
      const topRightAngled = Bodies.rectangle(width - 65, 55, 120, 8, {
        isStatic: true,
        angle: Math.PI / 4,
        render: { fillStyle: "#3b82f6" },
      });
      bodiesToAdd.push(topRightAngled);

      // Three big glowing bumpers near the top
      const bumper1 = Bodies.circle(width / 2 - 75, 130, 24, {
        isStatic: true,
        label: "bumper",
        render: { fillStyle: "#10b981", strokeStyle: "#34d399", lineWidth: 3 },
      });
      const bumper2 = Bodies.circle(width / 2 + 20, 110, 24, {
        isStatic: true,
        label: "bumper",
        render: { fillStyle: "#10b981", strokeStyle: "#34d399", lineWidth: 3 },
      });
      const bumper3 = Bodies.circle(width / 2 - 25, 200, 24, {
        isStatic: true,
        label: "bumper",
        render: { fillStyle: "#10b981", strokeStyle: "#34d399", lineWidth: 3 },
      });
      bodiesToAdd.push(bumper1, bumper2, bumper3);

      // Flipper bodies (Left and Right)
      const leftFlipper = Bodies.rectangle(width / 2 - 95, height - 70, 75, 14, {
        isStatic: true,
        label: "left-flipper",
        render: { fillStyle: "#ef4444" },
      });
      const rightFlipper = Bodies.rectangle(width / 2 + 45, height - 70, 75, 14, {
        isStatic: true,
        label: "right-flipper",
        render: { fillStyle: "#ef4444" },
      });
      bodiesToAdd.push(leftFlipper, rightFlipper);

      // Setup flippers motion on update
      let leftAngle = 0.3;
      let rightAngle = -0.3;

      Events.on(engine, "beforeUpdate", () => {
        // Left flipper rotation target
        const leftTarget = keysPressedRef.current.left ? -0.4 : 0.3;
        leftAngle += (leftTarget - leftAngle) * 0.35;
        Body.setAngle(leftFlipper, leftAngle);

        // Right flipper rotation target
        const rightTarget = keysPressedRef.current.right ? 0.4 : -0.3;
        rightAngle += (rightTarget - rightAngle) * 0.35;
        Body.setAngle(rightFlipper, rightAngle);
      });
    }

    Composite.add(engine.world, bodiesToAdd);

    // Bumper collision force and scoring triggers
    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check peg sound
        if (bodyA.label === "peg" || bodyB.label === "peg") {
          playArcadeSound("peg");
        }

        // Bumper hit (Pinball)
        if (bodyA.label === "bumper" || bodyB.label === "bumper") {
          const bumper = bodyA.label === "bumper" ? bodyA : bodyB;
          const ball = bodyA.label === "bumper" ? bodyB : bodyA;

          playArcadeSound("bumper");
          
          // Push ball away with high velocity
          const forceDir = Matter.Vector.normalise(Matter.Vector.sub(ball.position, bumper.position));
          Matter.Body.setVelocity(ball, Matter.Vector.mult(forceDir, 16));

          // Visual bumper flash
          bumper.render.fillStyle = "#34d399";
          setTimeout(() => {
            bumper.render.fillStyle = "#10b981";
          }, 100);

          setArcadeScore(prev => prev + 100);
        }

        // Pachinko scoring buckets
        if (bodyA.label?.startsWith("cup-") || bodyB.label?.startsWith("cup-")) {
          const cup = bodyA.label?.startsWith("cup-") ? bodyA : bodyB;
          const ball = bodyA.label?.startsWith("cup-") ? bodyB : bodyA;

          // Remove ball
          Matter.Composite.remove(engine.world, ball);
          setBallCount(c => Math.max(0, c - 1));

          const scoreVal = parseInt(cup.label.split("-")[1]) || 10;
          if (scoreVal === 500) {
            playArcadeSound("jackpot");
          } else {
            playArcadeSound("score");
          }
          setArcadeScore(prev => prev + scoreVal);
        }

        // Drain sensor (Pinball)
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

  // Setup initial load and keep high score synchronized
  useEffect(() => {
    setup();
    return () => {
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard controls listener for Pinball flippers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMode !== "pinball") return;
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        keysPressedRef.current.left = true;
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
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

  // Keep track of high score
  useEffect(() => {
    if (arcadeScore > highScore) {
      setHighScore(arcadeScore);
    }
  }, [arcadeScore, highScore]);

  // Spawn balls sequentially (staggered stream) to prevent explosion/overlap
  const addBalls = (count: number) => {
    if (!engineRef.current || !sceneRef.current) return;
    const width = sceneRef.current.clientWidth || 700;

    playArcadeSound("launch");

    if (activeMode === "galton") {
      for (let i = 0; i < count; i++) {
        // Spawn above the funnel, staggered in height
        const x = width / 2 + (Math.random() - 0.5) * 60;
        const y = 10 - i * 15; // Vertical spacing prevents initial overlaps
        const ball = Matter.Bodies.circle(x, y, 6, {
          restitution: 0.45,
          friction: 0.005,
          density: 0.001,
          render: { fillStyle: "#ef4444" },
        });
        Matter.Composite.add(engineRef.current.world, ball);
      }
      setBallCount(c => c + count);
    } 
    else if (activeMode === "pachinko") {
      // Shoot balls up the launcher channel on the right
      for (let i = 0; i < count; i++) {
        const x = width - 30 + (Math.random() - 0.5) * 6;
        const y = height - 40 - i * 20;
        const ball = Matter.Bodies.circle(x, y, 6, {
          restitution: 0.5,
          friction: 0.005,
          density: 0.001,
          render: { fillStyle: "#38bdf8" },
        });
        // Initial upward shoot force
        Matter.Body.setVelocity(ball, { x: 0, y: -16 });
        Matter.Composite.add(engineRef.current.world, ball);
      }
      setBallCount(c => c + count);
    }
    else if (activeMode === "pinball") {
      // Spawn single pinball in plunger lane on right
      const x = width - 30;
      const y = height - 40;
      const ball = Matter.Bodies.circle(x, y, 8, {
        restitution: 0.4,
        friction: 0.002,
        density: 0.002,
        render: { fillStyle: "#facc15" },
      });
      // Plunger launch upward velocity
      Matter.Body.setVelocity(ball, { x: 0, y: -22 });
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

  // Gaussian path renderer data for Galton mode
  const numBuckets = rows + 2;
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
    const totalBucketsWidth = numBuckets * pegSpacing;
    const startBucketX = (width - totalBucketsWidth) / 2;
    return `${startBucketX + p.x * pegSpacing},${385 - (p.y / maxGaussianY) * 130}`;
  }).join(" L ");

  return (
    <div className="w-full h-full relative flex flex-col justify-between bg-slate-950/80 rounded-xl overflow-hidden border border-white/5">
      {/* Mode / Games Selector Toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/50 p-4 shrink-0 select-none z-10">
        <div className="flex items-center gap-3">
          <Gamepad2 className="text-cyan-400 animate-pulse" size={20} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-200">Módulos de Física</span>
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

      {/* Main Physics Area */}
      <div className="flex-1 relative min-h-0 bg-radial-grid">
        <div ref={sceneRef} className="w-full h-full" />
        
        {/* Draw Gaussian curve ONLY on Galton Board Mode */}
        {activeMode === "galton" && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox={`0 0 ${sceneRef.current?.clientWidth || 700} ${sceneRef.current?.clientHeight || 600}`}>
            <path d={`M ${svgPath}`} fill="none" stroke="rgba(34, 211, 238, 0.45)" strokeWidth="2.5" strokeDasharray="6 6" />
          </svg>
        )}

        {/* Score & High Score Indicators for Games */}
        {activeMode !== "galton" && (
          <div className="absolute top-4 right-4 flex items-center gap-4 bg-slate-900/95 border border-white/10 px-4 py-2 rounded-lg font-mono text-xs shadow-lg select-none z-10">
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

        {/* Active Ball Counter */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <button 
            onClick={togglePause} 
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 rounded-lg text-slate-300 transition-colors shadow-md"
            title="Pausar Físicas"
          >
            {isPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button 
            onClick={() => setup(activeMode)} 
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 rounded-lg text-slate-300 transition-colors shadow-md"
            title="Reiniciar Tablero"
          >
            <RefreshCw size={15} />
          </button>
          
          <button 
            onClick={() => addBalls(activeMode === "pinball" ? 1 : 25)} 
            className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-500/30 hover:border-cyan-400/50 rounded-lg text-cyan-200 transition-colors shadow-md flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
          >
            <Plus size={14} /> {activeMode === "pinball" ? "Lanzar Bola" : "25 Bolas"}
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

        {/* Dynamic Controls Info for Pinball */}
        {activeMode === "pinball" && (
          <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-white/10 p-3 rounded-lg text-[10px] text-slate-400 font-mono shadow-lg select-none z-10 leading-normal max-w-[280px]">
            <p className="font-bold text-yellow-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <ChevronRight size={10} /> Controles de Pinball
            </p>
            <p className="mb-0.5">&bull; Pulsa <kbd className="bg-slate-800 px-1 border border-white/10 rounded">Flecha Izquierda</kbd> o <kbd className="bg-slate-800 px-1 border border-white/10 rounded">A</kbd> para activar el Flipper Izquierdo.</p>
            <p>&bull; Pulsa <kbd className="bg-slate-800 px-1 border border-white/10 rounded">Flecha Derecha</kbd> o <kbd className="bg-slate-800 px-1 border border-white/10 rounded">D</kbd> para activar el Flipper Derecho.</p>
            <div className="flex gap-2 mt-3.5">
              <button 
                onMouseDown={() => { keysPressedRef.current.left = true; playArcadeSound("peg"); }}
                onMouseUp={() => { keysPressedRef.current.left = false; }}
                onTouchStart={() => { keysPressedRef.current.left = true; playArcadeSound("peg"); }}
                onTouchEnd={() => { keysPressedRef.current.left = false; }}
                className="flex-1 bg-red-500/20 active:bg-red-500/40 border border-red-500/30 py-2.5 rounded text-red-300 font-bold uppercase tracking-wider text-[9px] touch-none select-none select-none"
              >
                Flipper Izq
              </button>
              <button 
                onMouseDown={() => { keysPressedRef.current.right = true; playArcadeSound("peg"); }}
                onMouseUp={() => { keysPressedRef.current.right = false; }}
                onTouchStart={() => { keysPressedRef.current.right = true; playArcadeSound("peg"); }}
                onTouchEnd={() => { keysPressedRef.current.right = false; }}
                className="flex-1 bg-red-500/20 active:bg-red-500/40 border border-red-500/30 py-2.5 rounded text-red-300 font-bold uppercase tracking-wider text-[9px] touch-none select-none select-none"
              >
                Flipper Der
              </button>
            </div>
          </div>
        )}

        {/* Total Active Balls Info */}
        <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-lg font-mono text-[10px] text-slate-400 select-none shadow-md z-10">
          ACTIVAS: {ballCount}
        </div>
      </div>
    </div>
  );
}
