"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket } from "lucide-react";

import MatchmakingLobby from "@/components/games/MatchmakingLobby";

interface Player {
  x: number;
  y: number;
  color: string;
  alive: boolean;
  lives: number;
}

type ShotPoint = { x: number; y: number };
type Wind = { strength: number; label: string };
type TroopType = "ninja" | "knight" | "archer" | "protector";
type UnitCommand = "move" | "attack";
type SelectedCombatant = number | "cannon";
type Unit = {
  id: number;
  owner: 1 | 2;
  type: TroopType;
  x: number;
  y: number;
  hp: number;
  moved: boolean;
  acted: boolean;
};
type ShieldWall = {
  owner: 1 | 2;
  x: number;
  turnExpires: number;
};
type ArtillerySnapshot = {
  turn: 1 | 2;
  message: string;
  angle: number;
  power: number;
  wind: Wind;
  hasGuide: boolean;
  game: {
    terrain: number[];
    p1: Player;
    p2: Player;
    projectile: null;
    lastGuide: ShotPoint[];
    units: Unit[];
    shields: ShieldWall[];
    cannonActed: Record<1 | 2, boolean>;
    nextUnitId: number;
    turnNumber: number;
    width: number;
    height: number;
  };
};

const TROOPS: Record<TroopType, { label: string; hp: number; move: number; range: number; damage: number }> = {
  ninja: { label: "Ninja", hp: 2, move: 74, range: 28, damage: 2 },
  knight: { label: "Caballero", hp: 3, move: 48, range: 26, damage: 2 },
  archer: { label: "Arquero", hp: 2, move: 34, range: 165, damage: 1 },
  protector: { label: "Protector", hp: 4, move: 30, range: 0, damage: 0 },
};

const MAX_TROOPS_PER_PLAYER = 3;

function createWind(): Wind {
  const strength = Math.round((Math.random() * 70 - 35) * 10) / 10;
  if (Math.abs(strength) < 5) return { strength, label: "Calma" };
  return { strength, label: strength > 0 ? "Este" : "Oeste" };
}

export default function ArtilleryGame() {
  const [phase, setPhase] = useState<"menu"|"queue"|"playing">("menu");
  const [gameMode, setGameMode] = useState<"hotseat"|"online">("hotseat");
  const [onlineRole, setOnlineRole] = useState<"player1"|"player2"|null>(null);
  const [matchId, setMatchId] = useState<string|null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(55);
  const [power, setPower] = useState(70);
  const [turn, setTurn] = useState<1 | 2>(1); // Player 1 (Cyan) or 2 (Pink)
  const [isAnimating, setIsAnimating] = useState(false);
  const [message, setMessage] = useState("Apunta y dispara. ¡Destruye la base enemiga!");
  const [wind, setWind] = useState<Wind>(() => createWind());
  const [hasGuide, setHasGuide] = useState(false);
  const [selectedTroop, setSelectedTroop] = useState<TroopType>("ninja");
  const [unitCommand, setUnitCommand] = useState<UnitCommand>("move");
  const [selectedUnitId, setSelectedUnitId] = useState<SelectedCombatant | null>("cannon");
  const [uiTick, setUiTick] = useState(0);
  const [onlineVersion, setOnlineVersion] = useState(0);
  const [onlineStatus, setOnlineStatus] = useState("");
  const windRef = useRef(wind);
  const lastAppliedVersion = useRef(0);

  // Refs de estado del juego sin forzar re-renders constantes en React
  const gameRef = useRef({
    terrain: [] as number[],
    p1: { x: 100, y: 0, color: "#8c4030", alive: true, lives: 8 } as Player,
    p2: { x: 700, y: 0, color: "#2e404d", alive: true, lives: 8 } as Player,
    projectile: null as { x: number, y: number, vx: number, vy: number, active: boolean, color: string, shooter: 1 | 2 } | null,
    lastGuide: [] as ShotPoint[],
    units: [] as Unit[],
    shields: [] as ShieldWall[],
    cannonActed: { 1: false, 2: false } as Record<1 | 2, boolean>,
    nextUnitId: 1,
    turnNumber: 1,
    width: 800,
    height: 400
  });

  const refreshUi = () => setUiTick((value) => value + 1);
  const guestIdRef = useRef("");

  const getGuestId = () => {
    if (guestIdRef.current) return guestIdRef.current;
    const key = "arcadeGuestId";
    const existing = window.localStorage.getItem(key);
    if (existing) {
      guestIdRef.current = existing;
      return existing;
    }
    const generated = `guest-${crypto.randomUUID()}`;
    window.localStorage.setItem(key, generated);
    guestIdRef.current = generated;
    return generated;
  };

  const isOnline = gameMode === "online" && Boolean(matchId && onlineRole);
  const myOnlineTurn = onlineRole === "player1" ? 1 : 2;
  const canAct = !isOnline || turn === myOnlineTurn;

  const renewWind = () => {
    const nextWind = createWind();
    windRef.current = nextWind;
    setWind(nextWind);
    return nextWind;
  };

  const createSnapshot = (nextTurn = turn, nextMessage = message): ArtillerySnapshot => ({
    turn: nextTurn,
    message: nextMessage,
    angle,
    power,
    wind: windRef.current,
    hasGuide,
    game: {
      terrain: [...gameRef.current.terrain],
      p1: { ...gameRef.current.p1 },
      p2: { ...gameRef.current.p2 },
      projectile: null,
      lastGuide: gameRef.current.lastGuide.map((point) => ({ ...point })),
      units: gameRef.current.units.map((unit) => ({ ...unit })),
      shields: gameRef.current.shields.map((shield) => ({ ...shield })),
      cannonActed: { ...gameRef.current.cannonActed },
      nextUnitId: gameRef.current.nextUnitId,
      turnNumber: gameRef.current.turnNumber,
      width: gameRef.current.width,
      height: gameRef.current.height,
    },
  });

  const applySnapshot = (snapshot: ArtillerySnapshot) => {
    gameRef.current.terrain = [...snapshot.game.terrain];
    gameRef.current.p1 = { ...snapshot.game.p1 };
    gameRef.current.p2 = { ...snapshot.game.p2 };
    gameRef.current.projectile = null;
    gameRef.current.lastGuide = snapshot.game.lastGuide.map((point) => ({ ...point }));
    gameRef.current.units = snapshot.game.units.map((unit) => ({ ...unit }));
    gameRef.current.shields = snapshot.game.shields.map((shield) => ({ ...shield }));
    gameRef.current.cannonActed = snapshot.game.cannonActed ? { ...snapshot.game.cannonActed } : { 1: false, 2: false };
    gameRef.current.nextUnitId = snapshot.game.nextUnitId;
    gameRef.current.turnNumber = snapshot.game.turnNumber;
    gameRef.current.width = snapshot.game.width;
    gameRef.current.height = snapshot.game.height;
    windRef.current = snapshot.wind;
    setWind(snapshot.wind);
    setTurn(snapshot.turn);
    setAngle(snapshot.angle);
    setPower(snapshot.power);
    setHasGuide(snapshot.hasGuide);
    setSelectedUnitId("cannon");
    setMessage(snapshot.message);
    refreshUi();
    window.requestAnimationFrame(drawFrame);
  };

  const publishSnapshot = async (snapshot = createSnapshot()) => {
    if (!isOnline || !matchId) return;
    try {
      const response = await fetch(`/api/arcade/artillery/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: getGuestId(), snapshot }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.snapshot) applySnapshot(data.snapshot);
        setOnlineStatus(data.error ?? "No se pudo sincronizar el turno.");
        return;
      }
      setOnlineVersion(data.version ?? 0);
      lastAppliedVersion.current = data.version ?? lastAppliedVersion.current;
      setOnlineStatus("Sincronizado.");
    } catch {
      setOnlineStatus("Sin conexión con la partida.");
    }
  };

  // Ya no iniciamos el juego automaticamente, esperan a la fase "playing"
  useEffect(() => {
    if (phase === "playing") {
       initGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (!isOnline || phase !== "playing" || !matchId) return;

    let stopped = false;
    const pull = async () => {
      try {
        const response = await fetch(`/api/arcade/artillery/${matchId}?guestId=${encodeURIComponent(getGuestId())}`, {
          cache: "no-store",
          headers: { "x-guest-id": getGuestId() },
        });
        if (!response.ok) {
          setOnlineStatus("Esperando sincronización de la partida...");
          return;
        }
        const data = await response.json();
        if (data.version && data.version > lastAppliedVersion.current && data.snapshot) {
          lastAppliedVersion.current = data.version;
          setOnlineVersion(data.version);
          applySnapshot(data.snapshot);
        } else if (!data.snapshot && onlineRole === "player1") {
          await publishSnapshot(createSnapshot(1, "Partida online iniciada. Turno de Tinta Roja."));
        } else if (!data.snapshot) {
          setOnlineStatus("Esperando el primer turno del rival...");
        }
      } catch {
        setOnlineStatus("Conexión online intermitente.");
      }
    };

    void pull();
    const interval = window.setInterval(() => {
      if (!stopped) void pull();
    }, 1000);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, phase, matchId, onlineRole]);

  const initGame = () => {
    const W = 800;
    const H = 400;
    const t = [];
    // Generar montañas suaves
    for (let x = 0; x < W; x++) {
      const height = 150 + Math.sin(x * 0.01) * 50 + Math.cos(x * 0.03) * 30 + Math.sin(x * 0.005) * 60;
      t.push(H - height);
    }
    gameRef.current.terrain = t;
    
    // Posicionar jugadores
    const p1x = 100;
    const p2x = 700;
    gameRef.current.p1 = { x: p1x, y: t[p1x], color: "#8c4030", alive: true, lives: 8 };
    gameRef.current.p2 = { x: p2x, y: t[p2x], color: "#2e404d", alive: true, lives: 8 };
    gameRef.current.projectile = null;
    gameRef.current.lastGuide = [];
    gameRef.current.units = [];
    gameRef.current.shields = [];
    gameRef.current.cannonActed = { 1: false, 2: false };
    gameRef.current.nextUnitId = 1;
    gameRef.current.turnNumber = 1;
    setHasGuide(false);
    gameRef.current.width = W;
    gameRef.current.height = H;
    const nextWind = renewWind();
    
    setTurn(1);
    setSelectedUnitId("cannon");
    setMessage(`Partida iniciada. Turno de Tinta Roja. Viento: ${nextWind.label} ${Math.abs(nextWind.strength).toFixed(1)}.`);
    refreshUi();
    drawFrame();
  };

  const drawFrame = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    
    const w = gameRef.current.width;
    const h = gameRef.current.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Dibujar cielo oscuro -> pergamino
    ctx.fillStyle = "#fcfaf4";
    ctx.fillRect(0, 0, w, h);

    // Dibujar terreno (tinta vintage)
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x < w; x++) {
      ctx.lineTo(x, gameRef.current.terrain[x]);
    }
    ctx.lineTo(w, h);
    ctx.fillStyle = "rgba(140, 103, 61, 0.1)";
    ctx.fill();
    ctx.strokeStyle = "#8c673d";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Guía parcial del disparo anterior
    if (gameRef.current.lastGuide.length > 1) {
      ctx.save();
      ctx.beginPath();
      gameRef.current.lastGuide.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = "rgba(62, 48, 36, 0.42)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Dibujar castillos y vidas
    if (gameRef.current.p1.alive) {
      ctx.fillStyle = gameRef.current.p1.color;
      ctx.fillRect(gameRef.current.p1.x - 18, gameRef.current.p1.y - 34, 36, 34);
      ctx.fillRect(gameRef.current.p1.x - 26, gameRef.current.p1.y - 20, 12, 20);
      ctx.fillRect(gameRef.current.p1.x + 14, gameRef.current.p1.y - 20, 12, 20);
      ctx.fillStyle = "#3e3024";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`♥ ${gameRef.current.p1.lives}`, gameRef.current.p1.x - 19, gameRef.current.p1.y - 42);
    }

    if (gameRef.current.p2.alive) {
      ctx.fillStyle = gameRef.current.p2.color;
      ctx.fillRect(gameRef.current.p2.x - 18, gameRef.current.p2.y - 34, 36, 34);
      ctx.fillRect(gameRef.current.p2.x - 26, gameRef.current.p2.y - 20, 12, 20);
      ctx.fillRect(gameRef.current.p2.x + 14, gameRef.current.p2.y - 20, 12, 20);
      ctx.fillStyle = "#3e3024";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`♥ ${gameRef.current.p2.lives}`, gameRef.current.p2.x - 19, gameRef.current.p2.y - 42);
    }

    gameRef.current.shields.forEach((shield) => {
      ctx.save();
      ctx.strokeStyle = shield.owner === 1 ? "rgba(140,64,48,0.72)" : "rgba(46,64,77,0.72)";
      ctx.fillStyle = shield.owner === 1 ? "rgba(140,64,48,0.12)" : "rgba(46,64,77,0.12)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(shield.x - 4, 88, 8, 155, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    gameRef.current.units.forEach((unit) => {
      const meta = TROOPS[unit.type];
      ctx.save();
      ctx.translate(unit.x, unit.y - 13);
      ctx.fillStyle = unit.owner === 1 ? "#8c4030" : "#2e404d";
      ctx.strokeStyle = "#3e3024";
      ctx.lineWidth = 2;
      if (unit.type === "ninja") {
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.lineTo(13, 10);
        ctx.lineTo(-13, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (unit.type === "knight") {
        ctx.fillRect(-11, -15, 22, 25);
        ctx.strokeRect(-11, -15, 22, 25);
      } else if (unit.type === "archer") {
        ctx.beginPath();
        ctx.arc(0, -1, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(10, -1, 13, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(-12, -16, 24, 28, 7);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = "#fcfaf4";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(meta.label[0], 0, 2);
      ctx.fillStyle = "#3e3024";
      ctx.fillText(`${unit.hp}`, 0, -20);
      if (unit.id === selectedUnitId) {
        ctx.strokeStyle = "#a64020";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -2, 21, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Dibujar proyectil
    const proj = gameRef.current.projectile;
    if (proj && proj.active) {
      ctx.fillStyle = proj.color;
      ctx.shadowBlur = 20;
      ctx.shadowColor = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  useEffect(() => {
    if (phase === "playing") window.requestAnimationFrame(drawFrame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUnitId, unitCommand]);

  const finishTurn = (nextMessage: string) => {
    if (!gameRef.current.p1.alive || !gameRef.current.p2.alive) {
      setMessage(nextMessage);
      refreshUi();
      drawFrame();
      void publishSnapshot(createSnapshot(turn, nextMessage));
      return;
    }
    const nextTurn = turn === 1 ? 2 : 1;
    setSelectedUnitId("cannon");
    gameRef.current.turnNumber += 1;
    gameRef.current.shields = gameRef.current.shields.filter((shield) => shield.turnExpires > gameRef.current.turnNumber);
    gameRef.current.units.forEach((unit) => {
      if (unit.owner === nextTurn) {
        unit.moved = false;
        unit.acted = false;
      }
    });
    gameRef.current.cannonActed[nextTurn] = false;
    const nextWind = renewWind();
    setTurn(nextTurn);
    const fullMessage = `${nextMessage} Turno de ${nextTurn === 1 ? "Tinta Roja" : "Tinta Azul"}. Viento nuevo: ${nextWind.label} ${Math.abs(nextWind.strength).toFixed(1)}.`;
    setMessage(fullMessage);
    refreshUi();
    drawFrame();
    void publishSnapshot(createSnapshot(nextTurn, fullMessage));
  };

  const damageCastle = (owner: 1 | 2, amount: number) => {
    const castle = owner === 1 ? gameRef.current.p1 : gameRef.current.p2;
    castle.lives = Math.max(0, castle.lives - amount);
    if (castle.lives <= 0) {
      castle.alive = false;
      setMessage(owner === 1 ? "¡TINTA AZUL (2) GANA!" : "¡TINTA ROJA (1) GANA!");
    }
  };

  const damageUnit = (unit: Unit, amount: number) => {
    unit.hp -= amount;
    if (unit.hp <= 0) {
      gameRef.current.units = gameRef.current.units.filter((candidate) => candidate.id !== unit.id);
    }
  };

  const findClosestEnemy = (unit: Unit, range: number) => {
    let best: Unit | null = null;
    let bestDistance = Infinity;
    gameRef.current.units.forEach((candidate) => {
      if (candidate.owner === unit.owner) return;
      const distance = Math.abs(candidate.x - unit.x);
      if (distance <= range && distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    });
    return best;
  };

  const resolveUnitAttack = (unit: Unit) => {
    const meta = TROOPS[unit.type];
    if (unit.type === "protector") return "El protector mantiene la posición.";

    const enemy = findClosestEnemy(unit, meta.range);
    if (enemy) {
      damageUnit(enemy, meta.damage);
      unit.acted = true;
      return unit.type === "archer"
        ? "El arquero dispara contra una tropa enemiga."
        : `${meta.label} golpea a una tropa enemiga.`;
    }

    const enemyCastle = unit.owner === 1 ? gameRef.current.p2 : gameRef.current.p1;
    if (Math.abs(enemyCastle.x - unit.x) <= meta.range + 18) {
      damageCastle(enemyCastle === gameRef.current.p1 ? 1 : 2, meta.damage);
      unit.acted = true;
      return unit.type === "archer"
        ? "El arquero acierta al castillo enemigo."
        : `${meta.label} ataca el castillo enemigo.`;
    }

    return unit.type === "archer" ? "El arquero no tiene ningún objetivo a tiro." : `${meta.label} no encuentra objetivo al aterrizar.`;
  };

  const moveUnitWithArc = (unit: Unit, targetX: number, targetY: number, mode: "jump" | "line", onDone: () => void) => {
    const startX = unit.x;
    const startY = unit.y;
    const frames = mode === "line" ? 14 : 22;
    const jumpHeight = mode === "line" ? 0 : 24 + Math.sin((angle * Math.PI) / 180) * Math.max(20, power * 0.7);
    let frame = 0;
    setIsAnimating(true);

    const timer = window.setInterval(() => {
      frame += 1;
      const t = Math.min(1, frame / frames);
      unit.x = startX + (targetX - startX) * t;
      unit.y = startY + (targetY - startY) * t - Math.sin(Math.PI * t) * jumpHeight;
      drawFrame();

      if (t >= 1) {
        window.clearInterval(timer);
        unit.x = targetX;
        unit.y = targetY;
        setIsAnimating(false);
        onDone();
      }
    }, 24);
  };

  const moveSelectedUnit = (unit: Unit) => {
    if (unit.moved) {
      setMessage(`${TROOPS[unit.type].label} ya se ha movido este turno.`);
      return;
    }

    const direction = unit.owner === 1 ? 1 : -1;
    const radians = (angle * Math.PI) / 180;
    const distance = unit.type === "knight"
      ? Math.max(18, power * 0.95)
      : Math.max(18, Math.cos(radians) * power * 1.9);
    const targetX = Math.round(Math.max(35, Math.min(765, unit.x + direction * distance)));
    const targetY = gameRef.current.terrain[targetX];
    const mode = unit.type === "knight" ? "line" : "jump";

    moveUnitWithArc(unit, targetX, targetY, mode, () => {
      unit.moved = true;
      let result = unit.type === "knight"
        ? "El caballero avanza en línea recta."
        : `${TROOPS[unit.type].label} salta hasta la nueva posición.`;

      if (unit.type === "ninja" || unit.type === "knight") {
        result = `${result} ${resolveUnitAttack(unit)}`;
        unit.acted = true;
      } else if (unit.type === "archer" || unit.type === "protector") {
        unit.acted = true;
      }

      setMessage(result);
      refreshUi();
      drawFrame();
      void publishSnapshot(createSnapshot(turn, result));
    });
  };

  const spawnTroop = (type: TroopType) => {
    if (isAnimating || !canAct || !gameRef.current.p1.alive || !gameRef.current.p2.alive) return;
    const deployedTroops = gameRef.current.units.filter((unit) => unit.owner === turn).length;
    if (deployedTroops >= MAX_TROOPS_PER_PLAYER) {
      const result = `Ya tienes ${MAX_TROOPS_PER_PLAYER} tropas desplegadas. Mueve, ataca o termina el turno.`;
      setMessage(result);
      refreshUi();
      return;
    }
    const castle = turn === 1 ? gameRef.current.p1 : gameRef.current.p2;
    const direction = turn === 1 ? 1 : -1;
    const x = castle.x + direction * 46;
    const unit: Unit = {
      id: gameRef.current.nextUnitId,
      owner: turn,
      type,
      x,
      y: gameRef.current.terrain[Math.round(x)],
      hp: TROOPS[type].hp,
      moved: true,
      acted: true,
    };
    gameRef.current.nextUnitId += 1;
    gameRef.current.units.push(unit);
    setSelectedUnitId("cannon");
    const result = `${TROOPS[type].label} desplegado en el campo. Puedes seguir usando el cañón o tus tropas antes de terminar turno.`;
    setMessage(result);
    refreshUi();
    drawFrame();
    void publishSnapshot(createSnapshot(turn, result));
  };

  const runUnitAction = (unitId: number, command: UnitCommand) => {
    if (isAnimating || !canAct) return;
    const unit = gameRef.current.units.find((candidate) => candidate.id === unitId);
    if (!unit || unit.owner !== turn) return;
    const meta = TROOPS[unit.type];
    const direction = unit.owner === 1 ? 1 : -1;
    setSelectedUnitId(unit.id);

    if (command === "move") {
      moveSelectedUnit(unit);
      return;
    }

    if (unit.acted) {
      setMessage(`${meta.label} ya ha actuado este turno.`);
      return;
    }

    let result = "";
    if (unit.type === "protector") {
      gameRef.current.shields.push({ owner: unit.owner, x: unit.x + direction * 24, turnExpires: gameRef.current.turnNumber + 2 });
      unit.acted = true;
      unit.moved = true;
      result = "El protector levanta un escudo vertical y consume su acción.";
    } else {
      result = resolveUnitAttack(unit);
      if (unit.acted && unit.type === "archer") unit.moved = true;
    }

    setMessage(result);
    refreshUi();
    drawFrame();
    void publishSnapshot(createSnapshot(turn, result));
  };

  const fireProjectile = () => {
    if (isAnimating || !canAct) return;
    if (gameRef.current.cannonActed[turn]) {
      const result = "El cañón ya ha disparado este turno. Usa tus tropas o termina turno.";
      setMessage(result);
      refreshUi();
      return;
    }
    
    setIsAnimating(true);
    gameRef.current.cannonActed[turn] = true;
    const p = turn === 1 ? gameRef.current.p1 : gameRef.current.p2;
    const shooter = turn;
    
    // Convertir angulo y potencia a velocidad
    // El angulo es 0-180, para p2 hay que invertir
    const rad = (turn === 1 ? angle : 180 - angle) * (Math.PI / 180);
    const v = power * 3.15;
    const vx = Math.cos(rad) * v;
    const vy = -Math.sin(rad) * v; // Negativo porque Y crece hacia abajo en JS
    const muzzleOffset = turn === 1 ? 18 : -18;
    const shotTrail: ShotPoint[] = [];
    const windAtShot = windRef.current.strength;

    gameRef.current.projectile = {
      x: p.x + muzzleOffset,
      y: p.y - 58,
      vx,
      vy,
      active: true,
      color: p.color,
      shooter
    };

    let lastTime = performance.now();
    let flightTime = 0;
    let shotTimer: number | null = null;
    let resultMessage = "";
    
    const update = (time: number) => {
      const proj = gameRef.current.projectile;
      if (!proj || !proj.active) return;
      
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      flightTime += dt;
      
      // Update physics (60 ticks per frame approx to not jump over walls)
      const gravity = 155; // pixels per sec^2
      
      proj.vx += windAtShot * dt;
      proj.x += proj.vx * dt;
      proj.vy += gravity * dt;
      proj.y += proj.vy * dt;
      if (shotTrail.length === 0 || Math.hypot(proj.x - shotTrail[shotTrail.length - 1].x, proj.y - shotTrail[shotTrail.length - 1].y) > 8) {
        shotTrail.push({ x: proj.x, y: proj.y });
      }

      // Colisiones
      let hit = false;
      const terrainX = Math.floor(proj.x);

      const hitShield = gameRef.current.shields.find((shield) => shield.owner !== proj.shooter && Math.abs(proj.x - shield.x) < 7 && proj.y > 82 && proj.y < 252);
      if (hitShield) {
        proj.active = false;
        hit = true;
        resultMessage = "El disparo se estrella contra un escudo vertical.";
        setMessage(resultMessage);
      }

      const hitUnit = gameRef.current.units.find((unit) => unit.owner !== proj.shooter && Math.abs(proj.x - unit.x) < 16 && Math.abs(proj.y - (unit.y - 14)) < 18);
      if (!hit && hitUnit) {
        damageUnit(hitUnit, 2);
        proj.active = false;
        hit = true;
        resultMessage = "El cañón impacta contra una tropa enemiga.";
        setMessage(resultMessage);
      }

      // Out of bounds
      if (!hit && flightTime > 8) {
        proj.active = false;
        hit = true;
        resultMessage = "El proyectil se ha perdido en el cielo.";
        setMessage(resultMessage);
      }
      else if (!hit && (proj.x < 0 || proj.x > gameRef.current.width || proj.y > gameRef.current.height)) {
        proj.active = false;
        hit = true;
        resultMessage = "Vaya, el tiro se ha perdido.";
        setMessage(resultMessage);
      } 
      // Terreno
      else if (!hit && terrainX >= 0 && terrainX < gameRef.current.width && proj.y >= gameRef.current.terrain[terrainX]) {
         // Cráter en el terreno
         const ix = terrainX;
         for(let w = -20; w <= 20; w++){
           if(ix+w >=0 && ix+w < gameRef.current.width) {
             gameRef.current.terrain[ix+w] += Math.max(0, 20 - Math.abs(w)); 
           }
         }
         gameRef.current.p1.y = gameRef.current.terrain[gameRef.current.p1.x];
         gameRef.current.p2.y = gameRef.current.terrain[gameRef.current.p2.x];
         proj.active = false;
         hit = true;
         resultMessage = `¡Impacto en tierra firme! (${Math.floor(proj.x)}, ${Math.floor(proj.y)})`;
         setMessage(resultMessage);
      }
      
      // Hit Player 1
      if (proj.active && proj.shooter !== 1 && Math.abs(proj.x - gameRef.current.p1.x) < 25 && Math.abs(proj.y - (gameRef.current.p1.y - 18)) < 28) {
         damageCastle(1, 2);
         proj.active = false;
         hit = true;
         resultMessage = gameRef.current.p1.alive ? "El castillo rojo pierde 2 vidas." : "¡TINTA AZUL (2) GANA!";
         setMessage(resultMessage);
      }

      // Hit Player 2
      if (proj.active && proj.shooter !== 2 && Math.abs(proj.x - gameRef.current.p2.x) < 25 && Math.abs(proj.y - (gameRef.current.p2.y - 18)) < 28) {
         damageCastle(2, 2);
         proj.active = false;
         hit = true;
         resultMessage = gameRef.current.p2.alive ? "El castillo azul pierde 2 vidas." : "¡TINTA ROJA (1) GANA!";
         setMessage(resultMessage);
      }

      drawFrame();

      if (!hit) {
        return;
      } else {
        if (shotTimer !== null) {
          window.clearInterval(shotTimer);
        }
        setIsAnimating(false);
        const guideLength = Math.min(34, Math.max(8, Math.ceil(shotTrail.length * 0.38)));
        gameRef.current.lastGuide = shotTrail.slice(0, guideLength);
        setHasGuide(gameRef.current.lastGuide.length > 1);
        const finalMessage = gameRef.current.p1.alive && gameRef.current.p2.alive
          ? `${resultMessage || "Disparo resuelto."} El cañón queda usado; puedes mover tropas o terminar turno.`
          : resultMessage || "Disparo resuelto.";
        setMessage(finalMessage);
        refreshUi();
        drawFrame();
        void publishSnapshot(createSnapshot(turn, finalMessage));
      }
    };
    
    shotTimer = window.setInterval(() => update(performance.now()), 16);
  };

  const currentSideUnits = uiTick >= 0 ? gameRef.current.units.filter((unit) => unit.owner === turn) : [];
  const enemyLives = turn === 1 ? gameRef.current.p2.lives : gameRef.current.p1.lives;
  const ownLives = turn === 1 ? gameRef.current.p1.lives : gameRef.current.p2.lives;
  const selectedUnit = currentSideUnits.find((unit) => unit.id === selectedUnitId) ?? null;
  const selectedCannon = selectedUnitId === "cannon";
  const currentTroopCount = currentSideUnits.length;
  const cannonActed = gameRef.current.cannonActed[turn];
  const isKnightMove = selectedUnit?.type === "knight" && unitCommand === "move";
  const activeActionLabel = selectedUnit
    ? `${unitCommand === "move" ? "Ejecutar movimiento" : "Ejecutar acción"}: ${TROOPS[selectedUnit.type].label} #${selectedUnit.id}`
    : selectedCannon
      ? cannonActed ? "Cañón usado este turno" : "Disparar cañón"
      : "Selecciona cañón o tropa";
  const angleLabel = selectedUnit
    ? isKnightMove
      ? "TRAYECTORIA RECTA"
      : `ÁNGULO DE ${unitCommand === "move" ? "SALTO" : "ATAQUE"} (${angle}°)`
    : `ÁNGULO (${angle}°)`;
  const powerLabel = selectedUnit
    ? `POTENCIA DE ${unitCommand === "move" ? "MOVIMIENTO" : "ACCIÓN"} (${power})`
    : `PÓLVORA (${power})`;
  const executeActiveAction = () => {
    if (selectedUnit) {
      runUnitAction(selectedUnit.id, unitCommand);
      return;
    }
    if (selectedCannon) fireProjectile();
  };
  const endTurn = () => {
    if (isAnimating || !canAct) return;
    finishTurn("Turno terminado.");
  };

  return (
    <div className="page-shell min-h-screen py-10 px-4 bg-[#f4ead5] font-serif">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
         <Link href="/social" className="mb-6 self-start inline-flex items-center gap-2 text-sm text-[#8c673d] hover:text-[#3e2b22] font-bold transition-colors">
          <ArrowLeft size={16} /> Volver a la Tavera
        </Link>
        <div className="text-center mb-6">
           <h1 className="text-4xl font-black text-[#3e2b22] tracking-tight flex justify-center items-center gap-3">
             <Rocket className="text-[#a64020]" size={32}/> Artillería <span className="text-[#a64020]">Clásica</span>
           </h1>
           {phase === "playing" && <p className="text-[#8a765f] italic mt-2 font-medium">{message}</p>}
        </div>

        {phase === "menu" && (
           <div className="bg-[#fcfaf4] p-10 flex flex-col gap-4 text-center mt-10 rounded-sm w-full max-w-md mx-auto border border-[#d6c4a5] shadow-[5px_8px_15px_rgba(100,70,40,0.15)] relative transform rotate-1">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#cc6640] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-[#a64020]" />
              <h2 className="text-2xl font-serif font-bold text-[#3e3024] mb-6 mt-2">Modalidad de Partida</h2>
              <button onClick={() => { setGameMode("hotseat"); setPhase("playing"); }} className="w-full bg-[#f4ead5] border border-[#d6c4a5] text-[#453628] font-bold font-serif py-4 justify-center hover:bg-[#8c4030] hover:text-[#fdfbf7] shadow-sm transition-colors">
                 Jugar en Persona (Local)
              </button>
              <div className="flex items-center gap-4 text-[#a6967c] my-2">
                 <div className="flex-1 border-t border-dashed border-[#d6c4a5]"></div>
                 <span className="text-xs uppercase font-mono tracking-widest">Conexión Postal</span>
                 <div className="flex-1 border-t border-dashed border-[#d6c4a5]"></div>
              </div>
              <button 
                onClick={() => setPhase("queue")} 
                className="w-full bg-[#8c4030] text-[#fdfbf7] font-bold font-serif py-4 justify-center hover:bg-[#453628] shadow-sm transition-colors"
               >
                 Enviar Telegrama de Reto
              </button>
           </div>
        )}

        {phase === "queue" && (
           <MatchmakingLobby 
              gameKey="artillery" 
              gameName="Artillería Neón" 
              onCancel={() => setPhase("menu")}
              onMatchFound={(id, role) => {
                 setMatchId(id);
                 setOnlineRole(role as any);
                 setGameMode("online");
                 setPhase("playing");
              }}
           />
        )}

        {phase === "playing" && (
        <div className="w-full flex flex-col items-center">
           <div className="bg-[#fcfaf4] p-2 sm:p-4 shrink-0 w-full max-w-[820px] aspect-[820/460] mb-8 relative border-[8px] sm:border-[12px] border-[#3e3024] shadow-[10px_15px_30px_rgba(60,40,30,0.3)]">
             <canvas
               ref={canvasRef}
               width={800}
               height={400}
               className="bg-[#fcfaf4] mx-auto h-full w-full opacity-90"
             />
             <div className="pointer-events-none absolute left-3 top-3 sm:left-6 sm:top-6 rounded-sm border border-[#d6c4a5] bg-[#fcfaf4]/85 px-2 py-1 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#3e3024] shadow-sm">
                <span className="mr-2 text-[#8c4030]">{wind.strength > 0 ? "→" : wind.strength < 0 ? "←" : "·"}</span>
                Viento {wind.label} {Math.abs(wind.strength).toFixed(1)}
             </div>
             {hasGuide && (
               <div className="pointer-events-none absolute bottom-3 left-3 sm:bottom-6 sm:left-6 rounded-sm border border-[#d6c4a5] bg-[#fcfaf4]/85 px-2 py-1 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-semibold text-[#6f604f] shadow-sm">
                 Trazo parcial del disparo anterior
               </div>
             )}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-20 pointer-events-none mix-blend-multiply" />
           {(!gameRef.current.p1.alive || !gameRef.current.p2.alive) && (
               <div className="absolute inset-0 bg-[#3e3024]/80 backdrop-blur-sm flex flex-col justify-center items-center">
                  <h2 className="text-5xl font-black text-[#e8dcc4] mb-6 tracking-widest">FIN DEL COMBATE</h2>
                  <button onClick={initGame} className="px-8 py-4 bg-[#8c4030] font-bold text-[#fdfbf7] border-2 border-[#d6c4a5] hover:bg-[#a64020] transition-colors shadow-lg">
                    DIBUJAR NUEVO TERRENO
                  </button>
               </div>
           )}
        </div>

        <div className="w-full max-w-[820px] p-4 sm:p-6 bg-[#fcfaf4] shadow-md border-y border-[#d6c4a5] flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center relative sm:rotate-[0.5deg]">
           <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-sm border border-[#d6c4a5] bg-[#f4ead5] px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#5f503f] shadow-sm">
             {isOnline ? (canAct ? "Tu turno online" : "Esperando rival") : `Vidas: tú ${ownLives} · rival ${enemyLives}`}
           </div>
           <div className={`w-full p-4 flex-1 text-center font-bold font-serif transition-colors border-2 ${turn === 1 ? "bg-[#f4ead5] border-[#8c4030] text-[#8c4030]" : "border-transparent text-[#b5a38a]"}`}>
             <h3 className="mb-2">JUGADOR 1 (TINTA ROJA)</h3>
             {turn === 1 && !isAnimating && (
               <div className="text-[#3e3024] space-y-4 font-mono text-xs">
                 <div className="flex flex-col items-center">
                   <label className="block mb-1">{angleLabel}</label>
                   <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(Number(e.target.value))} disabled={isKnightMove} className="w-full accent-[#8c4030] disabled:opacity-45"/>
                 </div>
                 <div className="flex flex-col items-center">
                   <label className="block mb-1">{powerLabel}</label>
                   <input type="range" min="1" max="100" value={power} onChange={e => setPower(Number(e.target.value))} className="w-full accent-[#8c4030]"/>
                 </div>
                 <button disabled={!canAct || (!selectedUnit && !selectedCannon) || (selectedCannon && cannonActed)} onClick={executeActiveAction} className="w-full bg-[#8c4030] text-[#fdfbf7] font-bold font-serif py-2 mt-2 shadow-sm transition-colors hover:bg-[#a64020] disabled:cursor-not-allowed disabled:opacity-45">{activeActionLabel}</button>
               </div>
             )}
           </div>

           <div className="w-full sm:w-12 shrink-0 text-center text-[#8a765f] font-serif italic text-2xl px-2">VS</div>

           <div className={`w-full p-4 flex-1 text-center font-bold font-serif transition-colors border-2 ${turn === 2 ? "bg-[#e8dcc4] border-[#2e404d] text-[#2e404d]" : "border-transparent text-[#b5a38a]"}`}>
             <h3 className="mb-2">JUGADOR 2 (TINTA AZUL)</h3>
             {turn === 2 && !isAnimating && (
               <div className="text-[#3e3024] space-y-4 font-mono text-xs">
                 <div className="flex flex-col items-center">
                   <label className="block mb-1">{angleLabel}</label>
                   <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(Number(e.target.value))} disabled={isKnightMove} className="w-full accent-[#2e404d] disabled:opacity-45"/>
                 </div>
                 <div className="flex flex-col items-center">
                   <label className="block mb-1">{powerLabel}</label>
                   <input type="range" min="1" max="100" value={power} onChange={e => setPower(Number(e.target.value))} className="w-full accent-[#2e404d]"/>
                 </div>
                 <button disabled={!canAct || (!selectedUnit && !selectedCannon) || (selectedCannon && cannonActed)} onClick={executeActiveAction} className="w-full bg-[#2e404d] text-[#fdfbf7] font-bold font-serif py-2 mt-2 shadow-sm transition-colors hover:bg-[#3c5a6b] disabled:cursor-not-allowed disabled:opacity-45">{activeActionLabel}</button>
               </div>
             )}
           </div>
        </div>
        {!isAnimating && gameRef.current.p1.alive && gameRef.current.p2.alive && (
          <div className="mt-4 grid w-full max-w-[820px] gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border border-[#d6c4a5] bg-[#fcfaf4] p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8c673d]">Reserva táctica</p>
              <p className="mt-2 text-sm leading-6 text-[#6f604f]">{isOnline && !canAct ? "La partida está sincronizada: espera a que el rival termine su turno." : `Despliega hasta ${MAX_TROOPS_PER_PLAYER} tropas. Después usa el cañón o tus unidades y termina el turno manualmente.`}</p>
              {isOnline && onlineStatus ? <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8c4030]">{onlineStatus} v{onlineVersion}</p> : null}
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[#6f604f]">Tropas: {currentTroopCount}/{MAX_TROOPS_PER_PLAYER}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(Object.keys(TROOPS) as TroopType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedTroop(type)}
                    disabled={!canAct}
                    className={`border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-45 ${selectedTroop === type ? "border-[#8c4030] bg-[#f4ead5] text-[#8c4030]" : "border-[#d6c4a5] text-[#6f604f] hover:bg-[#f4ead5]"}`}
                  >
                    {TROOPS[type].label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!canAct || currentTroopCount >= MAX_TROOPS_PER_PLAYER}
                onClick={() => spawnTroop(selectedTroop)}
                className="mt-3 w-full bg-[#3e3024] px-4 py-3 text-sm font-bold text-[#fdfbf7] transition hover:bg-[#8c4030] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Lanzar tropa: {TROOPS[selectedTroop].label}
              </button>
              <button
                type="button"
                disabled={!canAct}
                onClick={endTurn}
                className="mt-2 w-full border border-[#8c4030] bg-[#f4ead5] px-4 py-3 text-sm font-bold text-[#8c4030] transition hover:bg-[#8c4030] hover:text-[#fdfbf7] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Terminar turno
              </button>
            </div>

            <div className="border border-[#d6c4a5] bg-[#fcfaf4] p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8c673d]">Tropas del turno</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUnitCommand("move")}
                    disabled={!canAct}
                    className={`border px-3 py-1 text-xs font-bold uppercase ${unitCommand === "move" ? "border-[#8c4030] bg-[#f4ead5] text-[#8c4030]" : "border-[#d6c4a5] text-[#6f604f]"}`}
                  >
                    Mover
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitCommand("attack")}
                    disabled={!canAct}
                    className={`border px-3 py-1 text-xs font-bold uppercase ${unitCommand === "attack" ? "border-[#8c4030] bg-[#f4ead5] text-[#8c4030]" : "border-[#d6c4a5] text-[#6f604f]"}`}
                  >
                    Atacar
                  </button>
                </div>
              </div>
              {selectedCannon ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6f604f]">
                  Orden preparada: Cañón del castillo
                </p>
              ) : selectedUnit ? (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#6f604f]">
                  Orden preparada: {TROOPS[selectedUnit.type].label} #{selectedUnit.id}
                </p>
              ) : null}
              <div className="mt-3 grid max-h-48 gap-2 overflow-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedUnitId("cannon")}
                  disabled={!canAct}
                  className={`flex items-center justify-between border px-3 py-2 text-left text-xs text-[#3e3024] transition hover:bg-[#f4ead5] disabled:cursor-not-allowed disabled:opacity-45 ${selectedCannon ? "border-[#8c4030] bg-[#f4ead5]" : "border-[#d6c4a5] bg-[#f4ead5]/45"}`}
                >
                  <span className="font-bold">Cañón del castillo</span>
                  <span>{cannonActed ? "disparó" : "listo"} · pólvora</span>
                </button>
                {currentSideUnits.length === 0 ? (
                  <p className="text-sm italic text-[#8a765f]">No hay tropas desplegadas; el cañón sigue disponible como unidad.</p>
                ) : (
                  currentSideUnits.map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => {
                        setSelectedUnitId(unit.id);
                        window.requestAnimationFrame(drawFrame);
                      }}
                      disabled={!canAct}
                      className={`flex items-center justify-between border px-3 py-2 text-left text-xs text-[#3e3024] transition hover:bg-[#f4ead5] disabled:cursor-not-allowed disabled:opacity-45 ${selectedUnitId === unit.id ? "border-[#8c4030] bg-[#f4ead5]" : "border-[#d6c4a5] bg-[#f4ead5]/45"}`}
                    >
                      <span className="font-bold">{TROOPS[unit.type].label} #{unit.id}</span>
                      <span>PV {unit.hp} · {unit.moved ? "movido" : "mover"} · {unit.acted ? "actuó" : "actuar"}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
         </div>
        )}
      </div>
    </div>
  );
}
