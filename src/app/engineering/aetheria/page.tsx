"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardDef, NORMALS, RARES, PALADINS, CardSide, SideType } from '@/lib/aetheria/classes';

type Player = 'P1' | 'P2';
type GameMode = 'LOCAL' | 'AI' | null;
type Phase = 'MENU' | 'DRAFT_P1' | 'DRAFT_P2' | 'PLAYING' | 'GAMEOVER';

interface InGameCard extends CardDef {
  currentHealth: number;
  instanceId: string; // Para distinguir 2 cartas iguales en la mesa
}

interface BoardSlot {
  card: InGameCard;
  owner: Player;
}

export default function AetheriaPage() {
  const [phase, setPhase] = useState<Phase>('MENU');
  const [mode, setMode] = useState<GameMode>(null);
  
  // Rondas
  const [roundWinner, setRoundWinner] = useState<Player | 'DRAW' | null>(null);
  const [p1Moves, setP1Moves] = useState<{ r: number, c: number } | null>(null);
  const [p2Moves, setP2Moves] = useState<{ r: number, c: number } | null>(null);
  const [roundTurn, setRoundTurn] = useState<Player>('P1'); // Quien pone primero en la ronda
  const [currentTurn, setCurrentTurn] = useState<Player>('P1'); // Quien está picando ahora
  const [roundNumber, setRoundNumber] = useState(1);

  // Deck State
  const [handP1, setHandP1] = useState<InGameCard[]>([]);
  const [handP2, setHandP2] = useState<InGameCard[]>([]);

  // Draft Temp State
  const [draftStep, setDraftStep] = useState<number>(0); // 0=Paladines, 1=Raras, 2=Normales
  const [selectedDraft, setSelectedDraft] = useState<InGameCard[]>([]);

  // Board State
  const [board, setBoard] = useState<(BoardSlot | null)[][]>(Array.from({ length: 4 }, () => Array(4).fill(null)));
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);

  // --- INITIALIZATION ---
  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setPhase('DRAFT_P1');
    setDraftStep(0);
    setHandP1([]); setHandP2([]); setSelectedDraft([]);
    setBoard(Array.from({ length: 4 }, () => Array(4).fill(null)));
    setP1Moves(null); setP2Moves(null); setRoundNumber(1);
    setRoundTurn('P1'); setCurrentTurn('P1');
  };

  // --- DRAFTING PHASE ---
  const toggleDraftSelection = (cardDef: CardDef, maxAllowed: number) => {
    // Check if we can add
    const currentCount = selectedDraft.filter(c => c.id === cardDef.id).length;
    // Permitir duplicados si no excedemos maxTotal
    if (selectedDraft.length < maxAllowed) {
       setSelectedDraft([...selectedDraft, { ...cardDef, currentHealth: cardDef.health, instanceId: Math.random().toString() }]);
    } else {
       // Eliminar el último
       const newDraft = [...selectedDraft];
       newDraft.pop();
       setSelectedDraft([...newDraft, { ...cardDef, currentHealth: cardDef.health, instanceId: Math.random().toString() }]);
    }
  };

  const confirmDraftStep = () => {
    let nextStep = draftStep + 1;
    let nextPhase = phase;
    let currentPool = phase === 'DRAFT_P1' ? handP1 : handP2;
    const setter = phase === 'DRAFT_P1' ? setHandP1 : setHandP2;

    setter([...currentPool, ...selectedDraft]);
    setSelectedDraft([]);

    if (nextStep > 2) {
      if (phase === 'DRAFT_P1') {
         nextPhase = 'DRAFT_P2';
         nextStep = 0;
         if (mode === 'AI') {
            // Generar Draft IA automático (2P, 3R, 5N)
            const aiDeck: InGameCard[] = [];
            for(let i=0; i<2; i++) aiDeck.push({ ...PALADINS[Math.floor(Math.random()*PALADINS.length)], currentHealth: 15, instanceId: Math.random().toString() });
            for(let i=0; i<3; i++) aiDeck.push({ ...RARES[Math.floor(Math.random()*RARES.length)], currentHealth: 10, instanceId: Math.random().toString() });
            for(let i=0; i<5; i++) aiDeck.push({ ...NORMALS[Math.floor(Math.random()*NORMALS.length)], currentHealth: 6, instanceId: Math.random().toString() });
            
            // Reparar currentHealth con su base real
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

  // --- COMBAT RESOLUTION ---
  const resolveRound = () => {
    const newBoard = board.map(r => r.map(c => c ? { card: { ...c.card }, owner: c.owner } : null));

    // Array 2D para almacenar los cambios netos de Vida per Slot
    const healthDeltas = Array.from({ length: 4 }, () => Array(4).fill(0));

    // Función pura para calcular daño/curación de A hacia B
    const evaluateFaceOff = (attackerR: number, attackerC: number, defenderR: number, defenderC: number, attSide: CardSide, defSide: CardSide, isRanged=false) => {
       const attSlot = newBoard[attackerR]?.[attackerC];
       const defSlot = newBoard[defenderR]?.[defenderC];
       
       if (!attSlot || !defSlot) return;

       if (attSide.type === 'HEAL' && attSlot.owner === defSlot.owner) {
          healthDeltas[defenderR][defenderC] += attSide.value; // Cura!
          return;
       }

       if (attSlot.owner !== defSlot.owner && (attSide.type === 'ATTACK' || (attSide.type === 'RANGED' && isRanged))) {
          // Si el atacante ataca, el defensor defiende SOLO con el lado que encara el ataque.
          const defValue = defSide.type === 'SHIELD' ? defSide.value : 0;
          const damage = Math.max(0, attSide.value - defValue);
          healthDeltas[defenderR][defenderC] -= damage;
       }
    };

    // Evaluar direcciones para cada celda
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const slot = newBoard[r][c];
        if (!slot) continue;

        // TOP ataca al BOTTOM del slot de arriba
        if (r > 0) evaluateFaceOff(r, c, r-1, c, slot.card.top, newBoard[r-1][c]?.card.bottom || {type:'NONE', value:0});
        // BOTTOM ataca al TOP del slot de abajo
        if (r < 3) evaluateFaceOff(r, c, r+1, c, slot.card.bottom, newBoard[r+1][c]?.card.top || {type:'NONE', value:0});
        // LEFT ataca al RIGHT
        if (c > 0) evaluateFaceOff(r, c, r, c-1, slot.card.left, newBoard[r][c-1]?.card.right || {type:'NONE', value:0});
        // RIGHT ataca al LEFT
        if (c < 3) evaluateFaceOff(r, c, r, c+1, slot.card.right, newBoard[r][c+1]?.card.left || {type:'NONE', value:0});

        // Habilidades Especiales (RANGED ataca a 2 casillas)
        if (slot.card.top.type === 'RANGED' && r > 1) evaluateFaceOff(r, c, r-2, c, slot.card.top, newBoard[r-2][c]?.card.bottom || {type:'NONE', value:0}, true);
        if (slot.card.bottom.type === 'RANGED' && r < 2) evaluateFaceOff(r, c, r+2, c, slot.card.bottom, newBoard[r+2][c]?.card.top || {type:'NONE', value:0}, true);
        if (slot.card.left.type === 'RANGED' && c > 1) evaluateFaceOff(r, c, r, c-2, slot.card.left, newBoard[r][c-2]?.card.right || {type:'NONE', value:0}, true);
        if (slot.card.right.type === 'RANGED' && c < 2) evaluateFaceOff(r, c, r, c+2, slot.card.right, newBoard[r][c+2]?.card.left || {type:'NONE', value:0}, true);
      }
    }

    // Aplicar los deltas
    let anyDestroyed = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
         if (newBoard[r][c]) {
            const currentHp = newBoard[r][c]!.card.currentHealth;
            // Cap health a su maximo inicial si se cura
            newBoard[r][c]!.card.currentHealth = Math.min(newBoard[r][c]!.card.health, currentHp + healthDeltas[r][c]);
            
            if (newBoard[r][c]!.card.currentHealth <= 0) {
              newBoard[r][c] = null; // Destruida!
              anyDestroyed = true;
            }
         }
      }
    }

    setBoard(newBoard);
    
    // Preparar Siguiente Ronda
    setP1Moves(null);
    setP2Moves(null);
    setRoundNumber(roundNumber + 1);
    setRoundTurn(roundTurn === 'P1' ? 'P2' : 'P1');
    setCurrentTurn(roundTurn === 'P1' ? 'P2' : 'P1'); // Si en la ronda n empezó P1, en n+1 empieza P2
  };

  // --- GAMEPLAY PHASE ---
  const handleCellClick = (row: number, col: number) => {
    if (phase !== 'PLAYING' || selectedHandIndex === null) return;
    if (board[row][col] !== null) return; // Celda ocupada
    
    // Si la celda ya fue reservada para jugar esta ronda por el otro jugador!
    if (p1Moves && p1Moves.r === row && p1Moves.c === col) return;
    if (p2Moves && p2Moves.r === row && p2Moves.c === col) return;

    if (mode === 'AI' && currentTurn === 'P2') return;

    const isP1 = currentTurn === 'P1';
    const activeHand = isP1 ? handP1 : handP2;
    const cardToPlay = activeHand[selectedHandIndex];

    if (isP1) {
       setHandP1(handP1.filter((_, i) => i !== selectedHandIndex));
       setP1Moves({ r: row, c: col });
       
       const tempBoard = board.map(r => [...r]);
       tempBoard[row][col] = { card: cardToPlay, owner: 'P1' };
       setBoard(tempBoard);

       if (p2Moves) {
          setTimeout(resolveRound, 1000);
       } else {
          setCurrentTurn('P2');
       }
    } else {
       setHandP2(handP2.filter((_, i) => i !== selectedHandIndex));
       setP2Moves({ r: row, c: col });
       
       const tempBoard = board.map(r => [...r]);
       tempBoard[row][col] = { card: cardToPlay, owner: 'P2' };
       setBoard(tempBoard);

       if (p1Moves) {
          setTimeout(resolveRound, 1000);
       } else {
          setCurrentTurn('P1');
       }
    }

    setSelectedHandIndex(null);
  };

  // --- AI LOGIC ---
  useEffect(() => {
    if (phase === 'PLAYING' && mode === 'AI' && currentTurn === 'P2' && handP2.length > 0) {
      const runAI = setTimeout(() => {
         // Encuentra la celda con más enemigos alrededor (Greedy)
         let bestScore = -Infinity;
         let bestMove = { handIdx: 0, r: 0, c: 0 };

         for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
               if (board[r][c] === null && (!p1Moves || p1Moves.r !== r || p1Moves.c !== c)) {
                  // Contar adyacencias enemigas
                  let score = 0;
                  if (r>0 && board[r-1][c]?.owner === 'P1') score++;
                  if (r<3 && board[r+1][c]?.owner === 'P1') score++;
                  if (c>0 && board[r][c-1]?.owner === 'P1') score++;
                  if (c<3 && board[r][c+1]?.owner === 'P1') score++;
                  
                  // Rompe empates con esquinas
                  const cornerBonus = (r===0||r===3) && (c===0||c===3) ? 0.5 : 0;
                  score += cornerBonus;

                  if (score > bestScore) {
                     bestScore = score;
                     bestMove = { handIdx: Math.floor(Math.random()*handP2.length), r, c };
                  }
               }
            }
         }

         // Jugar la carta
         const cardToPlay = handP2[bestMove.handIdx];
         setHandP2(handP2.filter((_, i) => i !== bestMove.handIdx));
         setP2Moves({ r: bestMove.r, c: bestMove.c });

         const tempBoard = board.map(row => [...row]);
         tempBoard[bestMove.r][bestMove.c] = { card: cardToPlay, owner: 'P2' };
         setBoard(tempBoard);

         if (p1Moves) {
            setTimeout(resolveRound, 1000);
         } else {
            setCurrentTurn('P1');
         }

      }, 1000);
      return () => clearTimeout(runAI);
    }
  }, [currentTurn, phase, board]);

  // --- WIN CONDITION ---
  useEffect(() => {
    if (phase === 'PLAYING') {
      // Comprobar si ambos mazos están vacíos.
      if (handP1.length === 0 && handP2.length === 0 && !p1Moves && !p2Moves) {
         let hp1 = board.flat().reduce((acc, s) => acc + (s?.owner === 'P1' ? s.card.currentHealth : 0), 0);
         let hp2 = board.flat().reduce((acc, s) => acc + (s?.owner === 'P2' ? s.card.currentHealth : 0), 0);
         
         if (hp1 > hp2) setRoundWinner('P1');
         else if (hp2 > hp1) setRoundWinner('P2');
         else setRoundWinner('DRAW');
         setPhase('GAMEOVER');
      }
    }
  }, [board, handP1.length, handP2.length, phase, p1Moves, p2Moves]);

  // --- UI RENDERERS ---
  const renderDots = (side: CardSide, isHorizontal: boolean) => {
     if (side.type === 'NONE' || side.value === 0) return null;
     const dots = Array.from({length: side.value}, (_,i) => i);
     
     let dotColor = "bg-white";
     switch(side.type) {
        case 'ATTACK': dotColor = "bg-red-500 shadow-[0_0_8px_#ef4444]"; break;
        case 'SHIELD': dotColor = "bg-blue-400 shadow-[0_0_8px_#60a5fa]"; break;
        case 'RANGED': dotColor = "bg-green-400 shadow-[0_0_8px_#4ade80]"; break;
        case 'HEAL': dotColor = "bg-yellow-400 shadow-[0_0_8px_#facc15]"; break;
     }

     return (
        <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center justify-center gap-1 w-full h-full p-0.5`}>
           {dots.map(d => (
              <div key={d} className={`w-2 h-2 rounded-full ${dotColor}`} />
           ))}
        </div>
     );
  };

  const renderSideBorder = (side: CardSide, positionClass: string, isHorizontal: boolean) => {
     if (side.type === 'NONE') return null;
     
     let borderColor = "";
     switch(side.type) {
        case 'ATTACK': borderColor = "bg-red-950/40 border-red-500/50"; break;
        case 'SHIELD': borderColor = "bg-blue-950/40 border-blue-500/50"; break;
        case 'RANGED': borderColor = "bg-green-950/40 border-green-500/50"; break;
        case 'HEAL': borderColor = "bg-yellow-950/40 border-yellow-500/50"; break;
     }

     return (
        <div className={`absolute ${positionClass} flex items-center justify-center ${borderColor} border`}>
           {renderDots(side, isHorizontal)}
        </div>
     );
  };

  const renderCard = (card: InGameCard, owner: Player | null, isSelected = false, onClick?: () => void) => {
    const isP1 = owner === 'P1';
    let rarityColor = 'border-zinc-700';
    if (card.rarity === 'RARE') rarityColor = 'border-purple-500';
    if (card.rarity === 'PALADIN') rarityColor = 'border-yellow-400';

    const bgBase = isP1 ? 'bg-red-950/20' : (owner === 'P2' ? 'bg-blue-950/20' : 'bg-black/60');
    const outline = isSelected ? 'shadow-[0_0_20px_rgba(255,255,255,0.8)] scale-105 z-20' : '';

    return (
      <motion.div 
        layoutId={card.instanceId} 
        onClick={onClick}
        className={`w-28 h-40 rounded cursor-pointer relative flex flex-col items-center justify-center transition-all ${bgBase} ${outline}`}
      >
         {/* BORDES (DOTS API) */}
         <div className={`absolute inset-0 rounded border-2 ${rarityColor} pointer-events-none`} />
         
         {renderSideBorder(card.top, "top-0 left-1 right-1 h-3 rounded-b-md", true)}
         {renderSideBorder(card.bottom, "bottom-0 left-1 right-1 h-3 rounded-t-md", true)}
         {renderSideBorder(card.left, "left-0 top-1 bottom-1 w-3 rounded-r-md", false)}
         {renderSideBorder(card.right, "right-0 top-1 bottom-1 w-3 rounded-l-md", false)}

         {/* CENTRO: VIDA */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
             <span className="text-3xl font-black text-white drop-shadow-md">{card.currentHealth}</span>
         </div>
         
         {/* NOMBRE & TIPO */}
         <div className="absolute top-4 w-full text-center">
            <p className={`text-[8px] font-bold uppercase tracking-widest ${card.rarity === 'PALADIN' ? 'text-yellow-400' : (card.rarity === 'RARE' ? 'text-purple-400' : 'text-zinc-400')}`}>{card.name}</p>
         </div>
         {owner && (
            <div className={`absolute bottom-4 w-3 h-3 rounded-full ${owner === 'P1' ? 'bg-red-500' : 'bg-blue-500'}`} />
         )}
      </motion.div>
    );
  };

  return (
    <main className="min-h-screen w-screen bg-[#111] text-zinc-200 flex flex-col relative font-sans">
      
      {/* Header */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/engineering" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
          <ArrowLeft size={14} /> SYSTEM NEUTRAL
        </Link>
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center relative p-12 flex-1">
        
        {phase === 'MENU' && (
          <div className="flex flex-col items-center text-center">
             <h1 className="text-5xl font-black tracking-tight mb-2 uppercase text-white">Aetheria Tactics</h1>
             <p className="text-zinc-500 mb-8 uppercase tracking-widest text-xs">Simulación Táctica V3 - Dots System</p>
             <div className="flex gap-4">
                <button onClick={() => startGame('LOCAL')} className="px-8 py-3 bg-white text-black rounded font-bold uppercase tracking-widest text-xs">PVP MESA</button>
                <button onClick={() => startGame('AI')} className="px-8 py-3 border border-zinc-700 rounded font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">VS AUTÓMATA</button>
             </div>
          </div>
        )}

        {(phase === 'DRAFT_P1' || phase === 'DRAFT_P2') && (
           <div className="flex flex-col items-center w-full max-w-5xl">
              <h2 className="text-3xl font-black uppercase text-white mb-2">Construcción de Mazo</h2>
              <p className="text-zinc-500 uppercase tracking-widest text-sm font-bold mb-8">
                TURNO DE <span className={phase === 'DRAFT_P1' ? 'text-red-400' : 'text-blue-400'}>{phase === 'DRAFT_P1' ? 'JUGADOR 1' : mode === 'AI' ? 'AUTÓMATA' : 'JUGADOR 2'}</span>
              </p>

              <div className="mb-4 text-center">
                 {draftStep === 0 && <p className="text-yellow-400 font-bold uppercase">SELECCIONA 2 PALADINES (ÉLITE)</p>}
                 {draftStep === 1 && <p className="text-purple-400 font-bold uppercase">SELECCIONA 3 TROPAS RARAS</p>}
                 {draftStep === 2 && <p className="text-zinc-400 font-bold uppercase">SELECCIONA 5 TROPAS NORMALES</p>}
              </div>

              <div className="grid grid-cols-6 gap-6 mb-12 min-h-[160px]">
                 {(draftStep === 0 ? PALADINS : draftStep === 1 ? RARES : NORMALS).map(c => (
                    <div key={c.id}>
                       {renderCard({ ...c, currentHealth: c.health, instanceId: '' }, null, false, () => {
                          const limit = draftStep === 0 ? 2 : draftStep === 1 ? 3 : 5;
                          toggleDraftSelection(c, limit);
                       })}
                    </div>
                 ))}
               </div>
               
               <button 
                  onClick={confirmDraftStep}
                  disabled={selectedDraft.length !== (draftStep === 0 ? 2 : draftStep === 1 ? 3 : 5)}
                  className={`px-12 py-4 rounded font-bold uppercase tracking-widest transition-all ${(selectedDraft.length === (draftStep === 0 ? 2 : draftStep === 1 ? 3 : 5)) ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-600'}`}
               >
                  CONFIRMAR ({selectedDraft.length} / {draftStep === 0 ? 2 : draftStep === 1 ? 3 : 5})
               </button>
           </div>
        )}

        {phase === 'PLAYING' && (
           <div className="flex w-full h-[700px] justify-between max-w-[1200px] gap-8">
              {/* HAND P1 */}
              <div className="w-1/4 flex flex-wrap gap-4 content-start overflow-y-auto custom-scrollbar p-6 bg-zinc-900/50 rounded-lg">
                 <h3 className="w-full text-center text-red-500 font-black uppercase mb-4 tracking-widest">J1 ({handP1.length})</h3>
                 <AnimatePresence>
                    {handP1.map((c, i) => (
                       <motion.div key={c.instanceId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          {renderCard(c, 'P1', currentTurn === 'P1' && selectedHandIndex === i, () => {
                             if (currentTurn === 'P1' && !p1Moves) setSelectedHandIndex(i);
                          })}
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>

              {/* TABLERO */}
              <div className="flex-1 flex flex-col items-center">
                 <div className="mb-4 text-center">
                    <p className="text-zinc-600 uppercase font-black tracking-widest">Ronda {roundNumber}</p>
                    <p className="text-xl text-white font-bold uppercase">
                       {currentTurn === 'P1' ? <span className="text-red-400">JUGADOR 1 ELIGE...</span> : <span className="text-blue-400">JUGADOR 2 ELIGE...</span>}
                    </p>
                 </div>

                 <div className="w-[500px] h-[500px] bg-zinc-950 rounded-xl p-4 grid grid-cols-4 grid-rows-4 gap-2 border border-zinc-800">
                    {board.map((row, rIdx) => 
                       row.map((slot, cIdx) => (
                          <div 
                             key={`${rIdx}-${cIdx}`} 
                             onClick={() => handleCellClick(rIdx, cIdx)}
                             className={`w-full h-full rounded border border-zinc-800/50 flex items-center justify-center transition-all bg-zinc-900 ${(selectedHandIndex !== null && currentTurn === 'P1' && (!p1Moves)) || (selectedHandIndex !== null && currentTurn === 'P2' && (!p2Moves)) ? 'hover:bg-zinc-800 cursor-crosshair' : ''}`}
                          >
                             {slot && renderCard(slot.card, slot.owner)}
                             {p1Moves?.r === rIdx && p1Moves?.c === cIdx && !slot && <div className="w-full h-full bg-red-900/40 rounded animate-pulse border border-red-500"></div>}
                             {p2Moves?.r === rIdx && p2Moves?.c === cIdx && !slot && <div className="w-full h-full bg-blue-900/40 rounded animate-pulse border border-blue-500"></div>}
                          </div>
                       ))
                    )}
                 </div>
              </div>

              {/* HAND P2 */}
              <div className="w-1/4 flex flex-wrap gap-4 content-start overflow-y-auto custom-scrollbar p-6 bg-zinc-900/50 rounded-lg">
                 <h3 className="w-full text-center text-blue-500 font-black uppercase mb-4 tracking-widest">{mode === 'AI' ? 'AUTÓMATA' : 'J2'} ({handP2.length})</h3>
                 <AnimatePresence>
                    {handP2.map((c, i) => (
                       <motion.div key={c.instanceId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          {mode === 'AI' ? (
                             <div className="w-28 h-40 bg-zinc-950 border border-blue-900/30 rounded flex items-center justify-center text-blue-900 font-bold">CARGA</div>
                          ) : (
                             renderCard(c, 'P2', currentTurn === 'P2' && selectedHandIndex === i, () => {
                                if (currentTurn === 'P2' && !p2Moves) setSelectedHandIndex(i);
                             })
                          )}
                       </motion.div>
                    ))}
                 </AnimatePresence>
              </div>
           </div>
        )}

        {phase === 'GAMEOVER' && (
           <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
              <h2 className={`text-6xl font-black uppercase mb-4 ${roundWinner === 'P1' ? 'text-red-500' : roundWinner === 'P2' ? 'text-blue-500' : 'text-zinc-500'}`}>
                 {roundWinner === 'DRAW' ? 'EMPATE' : `VICTORIA DEL ${roundWinner === 'P1' ? 'JUGADOR 1' : 'JUGADOR 2'}`}
              </h2>
              <div className="flex gap-16 text-3xl font-black text-white/50 mb-12">
                 <span className="text-red-400 text-center">P1<br/>{board.flat().reduce((acc, s) => acc + (s?.owner === 'P1' ? s.card.currentHealth : 0), 0)} HP</span>
                 <span className="w-px bg-zinc-700 h-full block"></span>
                 <span className="text-blue-400 text-center">P2<br/>{board.flat().reduce((acc, s) => acc + (s?.owner === 'P2' ? s.card.currentHealth : 0), 0)} HP</span>
              </div>
              <button onClick={() => setPhase('MENU')} className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded">SALIR AL NÚCLEO</button>
           </div>
        )}
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
      `}</style>
    </main>
  );
}
