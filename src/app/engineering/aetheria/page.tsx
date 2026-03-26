"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Swords, SkipForward, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardDef, NORMALS, RARES, PALADINS, CardSide } from '@/lib/aetheria/classes';

type Player = 'P1' | 'P2';
type GameMode = 'LOCAL' | 'AI' | null;
type Phase = 'MENU' | 'DRAFT_P1' | 'DRAFT_P2' | 'PLAYING' | 'RESOLVING' | 'SUDDEN_DEATH' | 'GAMEOVER';

interface InGameCard extends CardDef {
  currentHealth: number;
  instanceId: string;
}

interface BoardSlot {
  card: InGameCard;
  owner: Player;
}

interface DamageIndicator {
  r: number; c: number;
  val: number;
  type: 'DMG' | 'HEAL';
  id: string;
}

export default function AetheriaPage() {
  const [phase, setPhase] = useState<Phase>('MENU');
  const [mode, setMode] = useState<GameMode>(null);
  
  // Game State
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);
  const [handP1, setHandP1] = useState<InGameCard[]>([]);
  const [handP2, setHandP2] = useState<InGameCard[]>([]);
  const [board, setBoard] = useState<(BoardSlot | null)[][]>(Array.from({ length: 4 }, () => Array(4).fill(null)));

  // Turn Logic
  const [currentTurn, setCurrentTurn] = useState<Player>('P1');
  const [roundTurn, setRoundTurn] = useState<Player>('P1'); 
  const [roundNumber, setRoundNumber] = useState(1);
  
  // Pending Moves
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);
  const [pendingMove, setPendingMove] = useState<{ r: number, c: number, card: InGameCard, handIndex: number } | null>(null);
  const [p1Moves, setP1Moves] = useState<{ r: number, c: number } | null>(null);
  const [p2Moves, setP2Moves] = useState<{ r: number, c: number } | null>(null);

  // Animations State
  const [damageIndicators, setDamageIndicators] = useState<DamageIndicator[]>([]);
  const [sdWarning, setSdWarning] = useState(false);

  // Draft State
  const [draftStep, setDraftStep] = useState<number>(0);
  const [selectedDraft, setSelectedDraft] = useState<InGameCard[]>([]);

  // --- INITIALIZATION ---
  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setPhase('DRAFT_P1');
    setDraftStep(0);
    setHandP1([]); setHandP2([]); setSelectedDraft([]);
    setBoard(Array.from({ length: 4 }, () => Array(4).fill(null)));
    setP1Moves(null); setP2Moves(null); setPendingMove(null);
    setRoundNumber(1); setRoundTurn('P1'); setCurrentTurn('P1');
    setDamageIndicators([]);
  };

  // --- DRAFTING ---
  const toggleDraftSelection = (cardDef: CardDef, maxAllowed: number) => {
    if (selectedDraft.length < maxAllowed) {
       setSelectedDraft([...selectedDraft, { ...cardDef, currentHealth: cardDef.health, instanceId: Math.random().toString() }]);
    } else {
       const newDraft = [...selectedDraft];
       newDraft.pop();
       setSelectedDraft([...newDraft, { ...cardDef, currentHealth: cardDef.health, instanceId: Math.random().toString() }]);
    }
  };

  const confirmDraftStep = () => {
    let nextStep = draftStep + 1;
    let nextPhase = phase;
    const setter = phase === 'DRAFT_P1' ? setHandP1 : setHandP2;
    setter(prev => [...prev, ...selectedDraft]);
    setSelectedDraft([]);

    if (nextStep > 2) {
      if (phase === 'DRAFT_P1') {
         nextPhase = 'DRAFT_P2';
         nextStep = 0;
         if (mode === 'AI') {
            const aiDeck: InGameCard[] = [];
            for(let i=0; i<2; i++) aiDeck.push({ ...PALADINS[Math.floor(Math.random()*PALADINS.length)], currentHealth: 15, instanceId: Math.random().toString() });
            for(let i=0; i<3; i++) aiDeck.push({ ...RARES[Math.floor(Math.random()*RARES.length)], currentHealth: 10, instanceId: Math.random().toString() });
            for(let i=0; i<5; i++) aiDeck.push({ ...NORMALS[Math.floor(Math.random()*NORMALS.length)], currentHealth: 6, instanceId: Math.random().toString() });
            const fixedAiDeck = aiDeck.map(c => ({...c, currentHealth: c.health}));
            setHandP2(fixedAiDeck);
            setPhase('PLAYING');
            return;
         }
      } else {
         nextPhase = 'PLAYING';
      }
    }
    setDraftStep(nextStep);
    setPhase(nextPhase);
  };

  // --- PLAYING LOGIC ---
  const handleCellClick = (r: number, c: number) => {
    if (phase !== 'PLAYING') return;
    if (selectedHandIndex === null) return;
    if (board[r][c] !== null) return;
    if (p1Moves && p1Moves.r === r && p1Moves.c === c) return;
    if (p2Moves && p2Moves.r === r && p2Moves.c === c) return;
    if (mode === 'AI' && currentTurn === 'P2') return;

    const activeHand = currentTurn === 'P1' ? handP1 : handP2;
    const cardToPlay = activeHand[selectedHandIndex];
    setPendingMove({ r, c, card: cardToPlay, handIndex: selectedHandIndex });
  };

  const confirmMove = () => {
    if (!pendingMove) return;
    const isP1 = currentTurn === 'P1';

    if (isP1) {
       setHandP1(handP1.filter((_, i) => i !== pendingMove.handIndex));
       setP1Moves({ r: pendingMove.r, c: pendingMove.c });
       const tempBoard = board.map(row => [...row]);
       tempBoard[pendingMove.r][pendingMove.c] = { card: pendingMove.card, owner: 'P1' };
       setBoard(tempBoard);
    } else {
       setHandP2(handP2.filter((_, i) => i !== pendingMove.handIndex));
       setP2Moves({ r: pendingMove.r, c: pendingMove.c });
       const tempBoard = board.map(row => [...row]);
       tempBoard[pendingMove.r][pendingMove.c] = { card: pendingMove.card, owner: 'P2' };
       setBoard(tempBoard);
    }

    setPendingMove(null);
    setSelectedHandIndex(null);

    // Evaluate Next State
    const p1Done = isP1 || p1Moves || (isP1 ? handP1.length - 1 : handP1.length) === 0;
    const p2Done = !isP1 || p2Moves || (!isP1 ? handP2.length - 1 : handP2.length) === 0;

    if (p1Done && p2Done) {
       triggerCombatResolution();
    } else {
       const nextTurn = isP1 ? 'P2' : 'P1';
       setCurrentTurn(nextTurn);
    }
  };

  const cancelMove = () => {
    setPendingMove(null);
    setSelectedHandIndex(null);
  };

  // --- AI LOGIC ---
  useEffect(() => {
    if (phase === 'PLAYING' && mode === 'AI' && currentTurn === 'P2' && !pendingMove) {
      if (handP2.length === 0) return; // Should have triggered resolve if P1 done

      const runAI = setTimeout(() => {
         let bestScore = -Infinity;
         let bestR = 0; let bestC = 0;
         const availableCards = handP2.map((c, i) => ({ c, i }));

         for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
               if (board[r][c] === null && (!p1Moves || p1Moves.r !== r || p1Moves.c !== c)) {
                  let score = 0;
                  if (r>0 && board[r-1][c]?.owner === 'P1') score++;
                  if (r<3 && board[r+1][c]?.owner === 'P1') score++;
                  if (c>0 && board[r][c-1]?.owner === 'P1') score++;
                  if (c<3 && board[r][c+1]?.owner === 'P1') score++;
                  const cornerBonus = (r===0||r===3) && (c===0||c===3) ? 0.5 : 0;
                  score += cornerBonus;

                  if (score > bestScore) {
                     bestScore = score;
                     bestR = r; bestC = c;
                  }
               }
            }
         }

         const chosenIndex = availableCards[Math.floor(Math.random() * availableCards.length)].i;
         const cardToPlay = handP2[chosenIndex];

         setHandP2(prev => prev.filter((_, i) => i !== chosenIndex));
         setP2Moves({ r: bestR, c: bestC });
         const tempBoard = board.map(row => [...row]);
         tempBoard[bestR][bestC] = { card: cardToPlay, owner: 'P2' };
         setBoard(tempBoard);

         const p1Done = p1Moves || handP1.length === 0;
         if (p1Done) {
            triggerCombatResolution();
         } else {
            setCurrentTurn('P1');
         }
      }, 1000);
      return () => clearTimeout(runAI);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, phase, board, pendingMove, handP2.length, mode, p1Moves]);

  // --- COMBAT ANIMATION & RESOLUTION ---
  const triggerCombatResolution = () => {
     setPhase('RESOLVING');
     // Allow UI to show "¡COMBATE!"
     const healthDeltas = Array.from({ length: 4 }, () => Array(4).fill(0));
     const newIndicators: DamageIndicator[] = [];

     const evaluateFaceOff = (attackerR: number, attackerC: number, defenderR: number, defenderC: number, attSide: CardSide, defSide: CardSide, isRanged=false) => {
       const attSlot = board[attackerR]?.[attackerC];
       const defSlot = board[defenderR]?.[defenderC];
       if (!attSlot || !defSlot) return;

       if (attSide.type === 'HEAL' && attSlot.owner === defSlot.owner) {
          healthDeltas[defenderR][defenderC] += attSide.value; // Cura!
          newIndicators.push({r: defenderR, c: defenderC, val: attSide.value, type: 'HEAL', id: Math.random().toString()});
          return;
       }

       if (attSlot.owner !== defSlot.owner && (attSide.type === 'ATTACK' || (attSide.type === 'RANGED' && isRanged))) {
          const defValue = defSide.type === 'SHIELD' ? defSide.value : 0;
          const damage = Math.max(0, attSide.value - defValue);
          if (damage > 0) {
             healthDeltas[defenderR][defenderC] -= damage;
             newIndicators.push({r: defenderR, c: defenderC, val: damage, type: 'DMG', id: Math.random().toString()});
          }
       }
     };

     for (let r = 0; r < 4; r++) {
       for (let c = 0; c < 4; c++) {
         const slot = board[r][c];
         if (!slot) continue;
         if (r > 0) evaluateFaceOff(r, c, r-1, c, slot.card.top, board[r-1][c]?.card.bottom || {type:'NONE', value:0});
         if (r < 3) evaluateFaceOff(r, c, r+1, c, slot.card.bottom, board[r+1][c]?.card.top || {type:'NONE', value:0});
         if (c > 0) evaluateFaceOff(r, c, r, c-1, slot.card.left, board[r][c-1]?.card.right || {type:'NONE', value:0});
         if (c < 3) evaluateFaceOff(r, c, r, c+1, slot.card.right, board[r][c+1]?.card.left || {type:'NONE', value:0});

         if (slot.card.top.type === 'RANGED' && r > 1) evaluateFaceOff(r, c, r-2, c, slot.card.top, board[r-2][c]?.card.bottom || {type:'NONE', value:0}, true);
         if (slot.card.bottom.type === 'RANGED' && r < 2) evaluateFaceOff(r, c, r+2, c, slot.card.bottom, board[r+2][c]?.card.top || {type:'NONE', value:0}, true);
         if (slot.card.left.type === 'RANGED' && c > 1) evaluateFaceOff(r, c, r, c-2, slot.card.left, board[r][c-2]?.card.right || {type:'NONE', value:0}, true);
         if (slot.card.right.type === 'RANGED' && c < 2) evaluateFaceOff(r, c, r, c+2, slot.card.right, board[r][c+2]?.card.left || {type:'NONE', value:0}, true);
       }
     }

     setTimeout(() => {
        setDamageIndicators(newIndicators);
     }, 1000);

     setTimeout(() => {
        const newBoard = board.map(r => r.map(c => c ? { card: { ...c.card }, owner: c.owner } : null));
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
             if (newBoard[r][c]) {
                const currentHp = newBoard[r][c]!.card.currentHealth;
                newBoard[r][c]!.card.currentHealth = Math.min(newBoard[r][c]!.card.health, currentHp + healthDeltas[r][c]);
                if (newBoard[r][c]!.card.currentHealth <= 0) {
                  newBoard[r][c] = null;
                }
             }
          }
        }
        setBoard(newBoard);
        setDamageIndicators([]);
        
        // Finalize Round or Sudden Death
        setTimeout(() => checkGameState(newBoard), 500);
     }, 2800); // Wait for numbers to float
  };

  const checkGameState = (currentBoard: (BoardSlot | null)[][]) => {
     let hp1 = 0; let hp2 = 0; let p1Count = 0; let p2Count = 0;
     currentBoard.flat().forEach(s => {
        if (s?.owner === 'P1') { hp1 += s.card.currentHealth; p1Count++; }
        if (s?.owner === 'P2') { hp2 += s.card.currentHealth; p2Count++; }
     });

     if (handP1.length === 0 && handP2.length === 0) {
        if (p1Count > 0 && p2Count > 0) {
           setPhase('SUDDEN_DEATH');
        } else {
           if (hp1 > hp2) setWinner('P1');
           else if (hp2 > hp1) setWinner('P2');
           else setWinner('DRAW');
           setPhase('GAMEOVER');
        }
     } else {
        setP1Moves(null);
        setP2Moves(null);
        setRoundNumber(r => r + 1);
        const nextStart = roundTurn === 'P1' ? 'P2' : 'P1';
        setRoundTurn(nextStart);
        
        // Make sure next start has cards
        if ((nextStart === 'P1' && handP1.length > 0) || (nextStart === 'P2' && handP2.length > 0)) {
           setCurrentTurn(nextStart);
        } else {
           setCurrentTurn(nextStart === 'P1' ? 'P2' : 'P1');
        }
        setPhase('PLAYING');
     }
  };

  // --- SUDDEN DEATH ---
  useEffect(() => {
     if (phase === 'SUDDEN_DEATH') {
        const warningTimer = setTimeout(() => setSdWarning(true), 100);
        const interval = setInterval(() => {
           setBoard(prev => {
              const b = prev.map(r => r.map(c => c ? { card: { ...c.card }, owner: c.owner } : null));
              let p1Alive = 0; let p2Alive = 0;
              for (let r=0; r<4; r++) {
                 for (let c=0; c<4; c++) {
                    if (b[r][c]) {
                       b[r][c]!.card.currentHealth -= 1;
                       if (b[r][c]!.card.currentHealth <= 0) b[r][c] = null;
                       else {
                          if (b[r][c]!.owner === 'P1') p1Alive++;
                          if (b[r][c]!.owner === 'P2') p2Alive++;
                       }
                    }
                 }
              }
              
              if (p1Alive === 0 || p2Alive === 0) {
                 clearInterval(interval);
                 if (p1Alive > p2Alive) setWinner('P1');
                 else if (p2Alive > p1Alive) setWinner('P2');
                 else setWinner('DRAW');
                 setPhase('GAMEOVER');
              }
              return b;
           });
        }, 1500); // -1 HP every 1.5s
        
        return () => { clearInterval(interval); clearTimeout(warningTimer); };
     }
  }, [phase]);


  // --- UI RENDERERS ---
  const renderGems = (side: CardSide, isHorizontal: boolean) => {
     if (side.type === 'NONE' || side.value === 0) return null;
     const dots = Array.from({length: side.value}, (_,i) => i);
     
     let gemColor = "";
     switch(side.type) {
        case 'ATTACK': gemColor = "bg-red-800 border-red-950"; break;
        case 'SHIELD': gemColor = "bg-blue-800 border-blue-950"; break;
        case 'RANGED': gemColor = "bg-emerald-800 border-emerald-950"; break;
        case 'HEAL': gemColor = "bg-amber-700 border-amber-950"; break;
     }

     return (
        <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center justify-center gap-1 w-full h-full p-0.5`}>
           {dots.map(d => (
              <div key={d} className={`w-2.5 h-2.5 rounded-sm bg-gradient-to-tr border ${gemColor} shadow-inner opacity-90`} />
           ))}
        </div>
     );
  };

  const renderSideBorder = (side: CardSide, positionClass: string, isHorizontal: boolean) => {
     if (side.type === 'NONE') return null;

     // Subtle background color for the side region depending on type
     let bgTone = "";
     switch(side.type) {
        case 'ATTACK': bgTone = "bg-red-900/20"; break;
        case 'SHIELD': bgTone = "bg-blue-900/20"; break;
        case 'RANGED': bgTone = "bg-emerald-900/20"; break;
        case 'HEAL': bgTone = "bg-amber-900/20"; break;
     }

     return (
        <div className={`absolute ${positionClass} flex items-center justify-center ${bgTone} border border-white/5`}>
           {renderGems(side, isHorizontal)}
        </div>
     );
  };

  const renderCard = (card: InGameCard, owner: Player | null, isSelected = false, onClick?: () => void, isPending = false) => {
    let rarityBorder = 'border-zinc-600';
    if (card.rarity === 'RARE') rarityBorder = 'border-purple-800';
    if (card.rarity === 'PALADIN') rarityBorder = 'border-amber-600';

    const bgBase = owner === 'P1' ? 'bg-[#3b2824]' : (owner === 'P2' ? 'bg-[#242c3b]' : 'bg-[#2a2a2a]');
    const outline = isSelected ? 'ring-2 ring-white scale-110 z-20' : '';
    const pendingClass = isPending ? 'opacity-60 border-dashed' : 'border-solid border-2';

    return (
      <motion.div 
        layoutId={card.instanceId} 
        onClick={onClick}
        whileHover={{ y: onClick ? -5 : 0 }}
        className={`w-[100px] h-[140px] rounded-md cursor-pointer relative flex flex-col items-center justify-center transition-all ${bgBase} ${outline} ${pendingClass} ${rarityBorder} shadow-lg`}
        style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.15' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
         {/* Elegante marco interior */}
         <div className="absolute inset-1 border border-white/10 rounded-sm pointer-events-none"></div>

         {renderSideBorder(card.top, "top-1 left-4 right-4 h-5 rounded-t-sm", true)}
         {renderSideBorder(card.bottom, "bottom-1 left-4 right-4 h-5 rounded-b-sm", true)}
         {renderSideBorder(card.left, "left-1 top-4 bottom-4 w-5 rounded-l-sm", false)}
         {renderSideBorder(card.right, "right-1 top-4 bottom-4 w-5 rounded-r-sm", false)}

         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-zinc-900 border border-zinc-500 rounded-full shadow-inner">
             <span className="text-xl font-bold text-zinc-100">{card.currentHealth}</span>
         </div>
         
         <div className="absolute top-6 w-full text-center px-1">
            <p className="text-[8px] font-semibold uppercase tracking-wider text-zinc-300 truncate bg-black/40 py-0.5 rounded-sm">{card.name}</p>
         </div>
         {owner && (
            <div className={`absolute bottom-6 w-3 h-3 rounded-sm rotate-45 border border-white/20 ${owner === 'P1' ? 'bg-red-700' : 'bg-blue-700'}`} />
         )}
      </motion.div>
    );
  };

  return (
    <main className={`min-h-screen w-screen text-zinc-300 flex flex-col relative font-serif transition-colors duration-1000 ${phase === 'SUDDEN_DEATH' ? 'bg-[#2a1b1b]' : 'bg-[#1e1c1a]'}`}
          style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
    >
      
      {phase === 'SUDDEN_DEATH' && (
         <div className="absolute inset-0 pointer-events-none z-0">
            <motion.div animate={{ opacity: [0, 0.2, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-full h-full bg-red-900/20 mix-blend-overlay"></motion.div>
         </div>
      )}

      {/* Header */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/engineering" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
          <ArrowLeft size={14} /> MANDO CENTRAL
        </Link>
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center relative p-8 flex-1 z-10">
        
        {phase === 'MENU' && (
           <div className="flex flex-col items-center text-center bg-zinc-900/60 p-12 rounded-xl border border-white/10 shadow-2xl backdrop-blur-sm">
             <Swords className="w-16 h-16 text-amber-600 mb-6" />
             <h1 className="text-6xl font-bold tracking-tight mb-2 text-zinc-100 font-serif">Aetheria Tactics</h1>
             <div className="h-px w-32 bg-amber-600/50 mb-4 mx-auto"></div>
             <p className="text-zinc-400 mb-12 uppercase tracking-widest text-xs font-semibold">Táctica, Posicionamiento y Combate</p>
             <button onClick={() => startGame('LOCAL')} className="px-12 py-4 border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-400 text-zinc-100 rounded shadow-md font-semibold uppercase tracking-widest text-sm transition-all mb-4">Duelo de Mesa (PvP)</button>
             <button onClick={() => startGame('AI')} className="px-12 py-4 border border-zinc-800 bg-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 rounded font-semibold uppercase tracking-widest text-sm transition-all">Contra Autómata (PvE)</button>
          </div>
        )}

        {(phase === 'DRAFT_P1' || phase === 'DRAFT_P2') && (
           <div className="flex flex-col items-center w-full max-w-5xl bg-zinc-900/40 p-10 rounded-xl border border-white/5 backdrop-blur-sm shadow-xl">
              <h2 className="text-3xl font-bold uppercase text-zinc-100 mb-2 font-serif tracking-wide">Construye tu Mazo</h2>
              <div className="h-px w-24 bg-zinc-700 mb-4 mx-auto"></div>
              <p className="text-zinc-400 uppercase tracking-widest text-xs font-semibold mb-10">
                Turno de: <span className={phase === 'DRAFT_P1' ? 'text-red-400 font-bold' : 'text-blue-400 font-bold'}>{phase === 'DRAFT_P1' ? 'JUGADOR 1' : mode === 'AI' ? 'AUTÓMATA' : 'JUGADOR 2'}</span>
              </p>

              <div className="mb-6 text-center px-8 py-3 bg-black/30 border border-white/5 rounded-md">
                 {draftStep === 0 && <p className="text-amber-500 font-semibold uppercase tracking-widest text-sm">Elige 2 Paladines</p>}
                 {draftStep === 1 && <p className="text-purple-400 font-semibold uppercase tracking-widest text-sm">Elige 3 Tropas Raras</p>}
                 {draftStep === 2 && <p className="text-zinc-300 font-semibold uppercase tracking-widest text-sm">Elige 5 Tropas Normales</p>}
              </div>

              <div className="grid grid-cols-6 gap-6 mb-12 min-h-[160px]">
                 {(draftStep === 0 ? PALADINS : draftStep === 1 ? RARES : NORMALS).map(c => (
                    <div key={c.id}>
                       {renderCard({ ...c, currentHealth: c.health, instanceId: '' }, null, selectedDraft.some(sc => sc.id === c.id), () => {
                          const limit = draftStep === 0 ? 2 : draftStep === 1 ? 3 : 5;
                          toggleDraftSelection(c, limit);
                       })}
                    </div>
                 ))}
               </div>
               
               <button 
                  onClick={confirmDraftStep}
                  disabled={selectedDraft.length !== (draftStep === 0 ? 2 : draftStep === 1 ? 3 : 5)}
                  className={`px-12 py-4 rounded font-bold uppercase tracking-widest text-sm transition-all ${selectedDraft.length === (draftStep === 0 ? 2 : draftStep === 1 ? 3 : 5) ? 'bg-zinc-200 text-zinc-900 hover:bg-white shadow-lg' : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-600 cursor-not-allowed'}`}
               >
                  Confirmar Selección ({selectedDraft.length} / {draftStep === 0 ? 2 : draftStep === 1 ? 3 : 5})
               </button>
           </div>
        )}

        {(phase === 'PLAYING' || phase === 'RESOLVING' || phase === 'SUDDEN_DEATH') && (
           <div className="flex w-full h-[650px] justify-between max-w-[1300px] gap-8 relative">
              
              {phase === 'RESOLVING' && (
                 <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }} className="bg-zinc-900/90 px-16 py-8 border-y border-amber-700/50 backdrop-blur-md shadow-2xl">
                       <h2 className="text-5xl font-bold text-amber-500 tracking-widest uppercase font-serif">Resolución</h2>
                    </motion.div>
                 </div>
              )}

              {phase === 'SUDDEN_DEATH' && sdWarning && (
                 <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none opacity-10">
                    <AlertTriangle size={400} className="text-red-900" />
                 </div>
              )}

              {/* HAND P1 */}
              <div className="w-[280px] flex flex-wrap gap-4 content-start overflow-y-auto custom-scrollbar p-6 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm relative shadow-xl">
                 <h3 className="w-full text-center text-red-400 font-bold uppercase mb-4 tracking-widest text-sm border-b border-white/5 pb-2">J1 - Cartas: {handP1.length}</h3>
                 <AnimatePresence>
                    {handP1.map((c, i) => (
                       <motion.div key={c.instanceId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0 }}>
                          {renderCard(c, 'P1',  phase === 'PLAYING' && currentTurn === 'P1' && selectedHandIndex === i && !pendingMove, () => {
                             if (phase === 'PLAYING' && currentTurn === 'P1' && !pendingMove) setSelectedHandIndex(i);
                          })}
                       </motion.div>
                    ))}
                 </AnimatePresence>
                 {currentTurn === 'P1' && phase === 'PLAYING' && !pendingMove && <div className="absolute inset-0 border border-red-900/50 rounded-xl pointer-events-none"></div>}
              </div>

              {/* TABLERO */}
              <div className="flex-1 flex flex-col items-center justify-center">
                 <div className="mb-6 text-center h-[60px] flex flex-col items-center justify-center">
                    {phase === 'SUDDEN_DEATH' ? (
                       <h2 className="text-2xl font-bold text-red-500 tracking-widest uppercase font-serif">Muerte Súbita</h2>
                    ) : (
                       <>
                          <p className="text-zinc-500 uppercase font-semibold tracking-widest text-xs mb-1">Ronda {roundNumber}</p>
                          <div className="px-6 py-2 bg-black/50 border border-white/5 rounded">
                             <p className="text-lg text-zinc-100 font-bold uppercase tracking-wider font-serif">
                                {currentTurn === 'P1' ? <span className="text-red-400">Turno de Jugador 1</span> : <span className="text-blue-400">Turno de Jugador 2</span>}
                             </p>
                          </div>
                       </>
                    )}
                 </div>

                 <div className="w-[500px] h-[500px] bg-[#151312] rounded-xl p-4 grid grid-cols-4 grid-rows-4 gap-2 border border-zinc-800 shadow-2xl relative">
                    
                    {/* Liners for aesthetics */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '117px 117px', backgroundPosition: 'center' }}></div>

                    {board.map((row, rIdx) => 
                       row.map((slot, cIdx) => (
                          <div 
                             key={`${rIdx}-${cIdx}`} 
                             onClick={() => handleCellClick(rIdx, cIdx)}
                             className={`w-full h-full rounded border border-white/5 flex items-center justify-center relative bg-zinc-900/40 z-10 transition-colors ${(selectedHandIndex !== null && currentTurn === 'P1' && !p1Moves && !pendingMove) || (selectedHandIndex !== null && currentTurn === 'P2' && !p2Moves && !pendingMove) ? 'hover:bg-zinc-800/60 cursor-crosshair border-white/10' : ''}`}
                          >
                             {slot && renderCard(slot.card, slot.owner)}
                             
                             {/* Pending Move Indicator */}
                             {pendingMove?.r === rIdx && pendingMove?.c === cIdx && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-80 scale-95">
                                   {renderCard(pendingMove.card, currentTurn, false, undefined, true)}
                                </div>
                             )}

                             {/* Float Damage Indicator */}
                             <AnimatePresence>
                                {damageIndicators.filter(d => d.r === rIdx && d.c === cIdx).map(d => (
                                   <motion.div key={d.id} initial={{ y: 10, opacity: 0 }} animate={{ y: -30, opacity: 1 }} exit={{ opacity: 0 }} className={`absolute z-50 text-3xl font-bold bg-black/50 px-2 py-1 rounded-md border border-white/10 shadow-lg ${d.type === 'HEAL' ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {d.type === 'HEAL' ? '+' : '-'}{d.val}
                                   </motion.div>
                                ))}
                             </AnimatePresence>
                          </div>
                       ))
                    )}
                 </div>
              </div>

              {/* HAND P2 */}
              <div className="w-[280px] flex flex-wrap gap-4 content-start overflow-y-auto custom-scrollbar p-6 bg-black/40 rounded-xl border border-white/5 backdrop-blur-sm relative shadow-xl">
                 <h3 className="w-full text-center text-blue-400 font-bold uppercase mb-4 tracking-widest text-sm border-b border-white/5 pb-2">{mode === 'AI' ? 'Autómata' : 'J2'} - Cartas: {handP2.length}</h3>
                 <AnimatePresence>
                    {handP2.map((c, i) => (
                       <motion.div key={c.instanceId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0 }}>
                          {mode === 'AI' ? (
                             <div className="w-[100px] h-[140px] bg-zinc-900 border border-zinc-800 rounded-md flex items-center justify-center shadow-inner">
                                <div className="w-8 h-8 rounded-full border border-zinc-700/50 flex items-center justify-center opacity-30">
                                   <span className="text-zinc-500 font-serif font-bold text-xl">?</span>
                                </div>
                             </div>
                          ) : (
                             renderCard(c, 'P2', phase === 'PLAYING' && currentTurn === 'P2' && selectedHandIndex === i && !pendingMove, () => {
                                if (phase === 'PLAYING' && currentTurn === 'P2' && !pendingMove) setSelectedHandIndex(i);
                             })
                          )}
                       </motion.div>
                    ))}
                 </AnimatePresence>
                 {currentTurn === 'P2' && phase === 'PLAYING' && !pendingMove && <div className="absolute inset-0 border border-blue-900/50 rounded-xl pointer-events-none"></div>}
              </div>

              {/* BOTONERA CONFIRMACION */}
              {pendingMove && (
                 <div className="absolute w-full bottom-[-70px] flex justify-center z-50">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex gap-4 p-4 bg-zinc-900/90 border border-white/10 shadow-2xl rounded-lg backdrop-blur-sm">
                       <button onClick={cancelMove} className="px-8 py-3 bg-transparent text-zinc-400 font-semibold uppercase tracking-widest text-xs border border-zinc-700 rounded hover:text-white hover:border-zinc-500 transition-colors">Cancelar</button>
                       <button onClick={confirmMove} className="px-12 py-3 bg-zinc-200 text-zinc-900 font-bold uppercase tracking-widest text-xs rounded hover:bg-white flex items-center gap-2 shadow-md">
                          <SkipForward size={16} /> Confirmar Turno
                       </button>
                    </motion.div>
                 </div>
              )}
           </div>
        )}

        {phase === 'GAMEOVER' && (
           <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="bg-zinc-900/80 p-16 rounded-2xl border border-white/5 shadow-2xl flex flex-col items-center">
                 <h2 className={`text-6xl font-bold uppercase mb-2 tracking-wide font-serif ${winner === 'P1' ? 'text-red-500' : winner === 'P2' ? 'text-blue-500' : 'text-zinc-400'}`}>
                    {winner === 'DRAW' ? 'Tablas' : `${winner === 'P1' ? 'Jugador 1' : mode === 'AI' ? 'Autómata' : 'Jugador 2'} Triunfa`}
                 </h2>
                 <div className="h-px w-32 bg-zinc-700 mb-10"></div>
                 <div className="flex gap-20 text-3xl font-bold text-zinc-300 mb-12">
                    <span className="text-red-400/80 text-center flex flex-col gap-2 items-center">
                       <span className="text-xs uppercase tracking-widest text-zinc-500 font-sans">Supervivientes J1</span>
                       {board.flat().reduce((acc, s) => acc + (s?.owner === 'P1' ? s.card.currentHealth : 0), 0)} HP
                    </span>
                    <span className="text-blue-400/80 text-center flex flex-col gap-2 items-center">
                       <span className="text-xs uppercase tracking-widest text-zinc-500 font-sans">Supervivientes J2</span>
                       {board.flat().reduce((acc, s) => acc + (s?.owner === 'P2' ? s.card.currentHealth : 0), 0)} HP
                    </span>
                 </div>
                 <button onClick={() => setPhase('MENU')} className="px-10 py-4 border border-zinc-600 bg-zinc-800 text-zinc-200 font-semibold uppercase tracking-widest rounded hover:bg-zinc-700 transition-colors text-xs">Volver al Menú Principal</button>
              </div>
           </div>
        )}
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </main>
  );
}
