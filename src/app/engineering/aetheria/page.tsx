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

         setHandP2(handP2.filter((_, i) => i !== chosenIndex));
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
  }, [currentTurn, phase, board, pendingMove]);

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
        case 'ATTACK': gemColor = "from-red-600 to-red-400 shadow-[0_0_8px_#ef4444] border-red-950"; break;
        case 'SHIELD': gemColor = "from-blue-500 to-blue-300 shadow-[0_0_8px_#3b82f6] border-blue-900"; break;
        case 'RANGED': gemColor = "from-emerald-500 to-emerald-300 shadow-[0_0_8px_#10b981] border-emerald-900"; break;
        case 'HEAL': gemColor = "from-yellow-500 to-yellow-200 shadow-[0_0_8px_#eab308] border-yellow-900"; break;
     }

     return (
        <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center justify-center gap-1.5 w-full h-full p-0.5 bg-black/60 rounded-full border border-white/5`}>
           {dots.map(d => (
              <div key={d} className={`w-2.5 h-2.5 rounded-full bg-gradient-to-tr border ${gemColor}`} />
           ))}
        </div>
     );
  };

  const renderSideBorder = (side: CardSide, positionClass: string, isHorizontal: boolean) => {
     if (side.type === 'NONE') return null;
     return (
        <div className={`absolute ${positionClass} flex items-center justify-center`}>
           {renderGems(side, isHorizontal)}
        </div>
     );
  };

  const renderCard = (card: InGameCard, owner: Player | null, isSelected = false, onClick?: () => void, isPending = false) => {
    let rarityGlow = 'border-zinc-700';
    if (card.rarity === 'RARE') rarityGlow = 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
    if (card.rarity === 'PALADIN') rarityGlow = 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]';

    const bgBase = owner === 'P1' ? 'bg-[#2a1315]' : (owner === 'P2' ? 'bg-[#131d2a]' : 'bg-[#18181b]');
    const outline = isSelected ? 'shadow-[0_0_30px_rgba(255,255,255,1)] scale-110 z-20' : '';
    const pendingClass = isPending ? 'opacity-50 border-dashed' : 'border-solid border-2';

    return (
      <motion.div 
        layoutId={card.instanceId} 
        onClick={onClick}
        whileHover={{ y: onClick ? -5 : 0 }}
        className={`w-[100px] h-[140px] rounded-lg cursor-pointer relative flex flex-col items-center justify-center transition-all ${bgBase} ${outline} ${pendingClass} ${rarityGlow}`}
      >
         {renderSideBorder(card.top, "top-1 left-3 right-3 h-4", true)}
         {renderSideBorder(card.bottom, "bottom-1 left-3 right-3 h-4", true)}
         {renderSideBorder(card.left, "left-1 top-3 bottom-3 w-4", false)}
         {renderSideBorder(card.right, "right-1 top-3 bottom-3 w-4", false)}

         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 border border-zinc-700 bg-black/80 rounded rotate-45">
             <span className="text-2xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] -rotate-45">{card.currentHealth}</span>
         </div>
         
         <div className="absolute top-4 w-full text-center px-1">
            <p className="text-[7px] font-bold uppercase tracking-widest text-zinc-300 drop-shadow-md truncate">{card.name}</p>
         </div>
         {owner && (
            <div className={`absolute bottom-5 w-2 h-2 rounded-full ${owner === 'P1' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'}`} />
         )}
      </motion.div>
    );
  };

  return (
    <main className={`min-h-screen w-screen text-zinc-200 flex flex-col relative font-sans transition-colors duration-1000 ${phase === 'SUDDEN_DEATH' ? 'bg-[#2a0808]' : 'bg-[#0f0f11]'}`}>
      
      {phase === 'SUDDEN_DEATH' && (
         <div className="absolute inset-0 pointer-events-none z-0">
            <motion.div animate={{ opacity: [0, 0.4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-full h-full bg-red-900/40 mix-blend-overlay"></motion.div>
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
           <div className="flex flex-col items-center text-center">
             <Swords className="w-16 h-16 text-yellow-500 mb-6 drop-shadow-[0_0_20px_#eab308]" />
             <h1 className="text-6xl font-black tracking-tighter mb-4 text-white">Aetheria Tactics</h1>
             <p className="text-zinc-500 mb-12 uppercase tracking-widest text-sm font-bold">Gemas, Estrategia y Vida Limitada</p>
             <button onClick={() => startGame('LOCAL')} className="px-10 py-4 border-2 border-white/20 bg-white/5 hover:bg-white hover:text-black rounded font-black uppercase tracking-widest text-sm transition-all mb-4">PvP Mesa</button>
             <button onClick={() => startGame('AI')} className="px-10 py-4 border-2 border-zinc-800 bg-transparent text-zinc-400 hover:border-zinc-500 rounded font-black uppercase tracking-widest text-sm transition-all">Vs Autómata</button>
          </div>
        )}

        {(phase === 'DRAFT_P1' || phase === 'DRAFT_P2') && (
           <div className="flex flex-col items-center w-full max-w-5xl">
              <h2 className="text-3xl font-black uppercase text-white mb-2">CONSTRUYE TU MAZO</h2>
              <p className="text-zinc-500 uppercase tracking-widest text-sm font-bold mb-10">
                Turno de: <span className={phase === 'DRAFT_P1' ? 'text-red-400' : 'text-blue-400'}>{phase === 'DRAFT_P1' ? 'JUGADOR 1' : mode === 'AI' ? 'AUTÓMATA' : 'JUGADOR 2'}</span>
              </p>

              <div className="mb-4 text-center">
                 {draftStep === 0 && <p className="text-yellow-400 font-bold uppercase tracking-widest">Elige 2 Paladines</p>}
                 {draftStep === 1 && <p className="text-purple-400 font-bold uppercase tracking-widest">Elige 3 Tropas Raras</p>}
                 {draftStep === 2 && <p className="text-zinc-400 font-bold uppercase tracking-widest">Elige 5 Tropas Normales</p>}
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
                  className={`px-12 py-4 rounded font-black uppercase tracking-widest transition-all ${selectedDraft.length === (draftStep === 0 ? 2 : draftStep === 1 ? 3 : 5) ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:bg-zinc-200' : 'bg-zinc-900 border border-zinc-800 text-zinc-600'}`}
               >
                  CONFIRMAR ({selectedDraft.length} / {draftStep === 0 ? 2 : draftStep === 1 ? 3 : 5})
               </button>
           </div>
        )}

        {(phase === 'PLAYING' || phase === 'RESOLVING' || phase === 'SUDDEN_DEATH') && (
           <div className="flex w-full h-[650px] justify-between max-w-[1300px] gap-8 relative">
              
              {phase === 'RESOLVING' && (
                 <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="bg-black/80 px-12 py-6 border-y-2 border-red-500 backdrop-blur-md">
                       <h2 className="text-6xl font-black text-red-500 tracking-widest uppercase italic">¡Combate!</h2>
                    </motion.div>
                 </div>
              )}

              {phase === 'SUDDEN_DEATH' && sdWarning && (
                 <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none opacity-20">
                    <AlertTriangle size={400} className="text-red-600 drop-shadow-[0_0_100px_#ef4444]" />
                 </div>
              )}

              {/* HAND P1 */}
              <div className="w-[280px] flex flex-wrap gap-4 content-start overflow-y-auto custom-scrollbar p-6 bg-zinc-900/30 rounded-2xl border border-zinc-800 backdrop-blur-sm relative">
                 <h3 className="w-full text-center text-red-500 font-black uppercase mb-4 tracking-widest">J1 ({handP1.length})</h3>
                 <AnimatePresence>
                    {handP1.map((c, i) => (
                       <motion.div key={c.instanceId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0 }}>
                          {renderCard(c, 'P1',  phase === 'PLAYING' && currentTurn === 'P1' && selectedHandIndex === i && !pendingMove, () => {
                             if (phase === 'PLAYING' && currentTurn === 'P1' && !pendingMove) setSelectedHandIndex(i);
                          })}
                       </motion.div>
                    ))}
                 </AnimatePresence>
                 {currentTurn === 'P1' && phase === 'PLAYING' && !pendingMove && <div className="absolute inset-0 border-2 border-red-500/30 rounded-2xl pointer-events-none animate-pulse"></div>}
              </div>

              {/* TABLERO */}
              <div className="flex-1 flex flex-col items-center justify-center">
                 <div className="mb-6 text-center h-[60px]">
                    {phase === 'SUDDEN_DEATH' ? (
                       <h2 className="text-3xl font-black text-red-500 tracking-widest uppercase animate-pulse">Muerte Súbita</h2>
                    ) : (
                       <>
                          <p className="text-zinc-600 uppercase font-black tracking-widest text-sm">Ronda {roundNumber}</p>
                          <p className="text-2xl text-white font-black uppercase tracking-wide">
                             {currentTurn === 'P1' ? <span className="text-red-400">JUGADOR 1</span> : <span className="text-blue-400">JUGADOR 2</span>}
                          </p>
                       </>
                    )}
                 </div>

                 <div className="w-[500px] h-[500px] bg-[#1a1a1f] rounded-2xl p-4 grid grid-cols-4 grid-rows-4 gap-2 border-2 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
                    
                    {/* Liners for aesthetics */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '71px 71px' }}></div>

                    {board.map((row, rIdx) => 
                       row.map((slot, cIdx) => (
                          <div 
                             key={`${rIdx}-${cIdx}`} 
                             onClick={() => handleCellClick(rIdx, cIdx)}
                             className={`w-full h-full rounded border border-white/5 flex items-center justify-center relative bg-black/40 z-10 transition-colors ${(selectedHandIndex !== null && currentTurn === 'P1' && !p1Moves && !pendingMove) || (selectedHandIndex !== null && currentTurn === 'P2' && !p2Moves && !pendingMove) ? 'hover:bg-zinc-800/80 cursor-crosshair border-white/20' : ''}`}
                          >
                             {slot && renderCard(slot.card, slot.owner)}
                             
                             {/* Pending Move Indicator */}
                             {pendingMove?.r === rIdx && pendingMove?.c === cIdx && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center scale-90">
                                   {renderCard(pendingMove.card, currentTurn, false, undefined, true)}
                                </div>
                             )}

                             {/* Float Damage Indicator */}
                             <AnimatePresence>
                                {damageIndicators.filter(d => d.r === rIdx && d.c === cIdx).map(d => (
                                   <motion.div key={d.id} initial={{ y: 20, opacity: 0 }} animate={{ y: -40, opacity: 1 }} exit={{ opacity: 0 }} className={`absolute z-50 text-4xl font-black drop-shadow-[0_0_5px_rgba(0,0,0,1)] ${d.type === 'HEAL' ? 'text-green-400' : 'text-red-500'}`}>
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
              <div className="w-[280px] flex flex-wrap gap-4 content-start overflow-y-auto custom-scrollbar p-6 bg-zinc-900/30 rounded-2xl border border-zinc-800 backdrop-blur-sm relative">
                 <h3 className="w-full text-center text-blue-500 font-black uppercase mb-4 tracking-widest">{mode === 'AI' ? 'AUTÓMATA' : 'J2'} ({handP2.length})</h3>
                 <AnimatePresence>
                    {handP2.map((c, i) => (
                       <motion.div key={c.instanceId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0 }}>
                          {mode === 'AI' ? (
                             <div className="w-[100px] h-[140px] bg-black border border-blue-900/30 rounded flex items-center justify-center font-bold text-blue-900 shadow-inner">
                                <span className="rotate-90 tracking-widest text-[10px]">INCOGNITO</span>
                             </div>
                          ) : (
                             renderCard(c, 'P2', phase === 'PLAYING' && currentTurn === 'P2' && selectedHandIndex === i && !pendingMove, () => {
                                if (phase === 'PLAYING' && currentTurn === 'P2' && !pendingMove) setSelectedHandIndex(i);
                             })
                          )}
                       </motion.div>
                    ))}
                 </AnimatePresence>
                 {currentTurn === 'P2' && phase === 'PLAYING' && !pendingMove && <div className="absolute inset-0 border-2 border-blue-500/30 rounded-2xl pointer-events-none animate-pulse"></div>}
              </div>

              {/* BOTONERA CONFIRMACION */}
              {pendingMove && (
                 <div className="absolute w-full bottom-[-80px] flex justify-center z-50">
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex gap-4 p-4 bg-zinc-900 border border-zinc-700 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl">
                       <button onClick={cancelMove} className="px-8 py-3 bg-transparent text-zinc-400 font-bold uppercase tracking-widest border border-zinc-700 rounded hover:text-white transition-colors">Cancelar</button>
                       <button onClick={confirmMove} className="px-12 py-3 bg-white text-black font-black uppercase tracking-widest rounded shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-zinc-200 flex items-center gap-2">
                          <SkipForward size={18} /> Confirmar Turno
                       </button>
                    </motion.div>
                 </div>
              )}
           </div>
        )}

        {phase === 'GAMEOVER' && (
           <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center backdrop-blur-md">
              <h2 className={`text-7xl font-black uppercase mb-6 tracking-tighter ${winner === 'P1' ? 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]' : winner === 'P2' ? 'text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'text-zinc-500'}`}>
                 {winner === 'DRAW' ? 'EMPATE TOTAL' : `${winner === 'P1' ? 'JUGADOR 1' : mode === 'AI' ? 'AUTÓMATA' : 'JUGADOR 2'} VENCE`}
              </h2>
              <div className="flex gap-20 text-4xl font-black text-white/50 mb-16">
                 <span className="text-red-400 text-center flex flex-col gap-2"><span className="text-sm tracking-widest">SUPERVIVIENTES P1</span>{board.flat().reduce((acc, s) => acc + (s?.owner === 'P1' ? s.card.currentHealth : 0), 0)} HP</span>
                 <span className="text-blue-400 text-center flex flex-col gap-2"><span className="text-sm tracking-widest">SUPERVIVIENTES P2</span>{board.flat().reduce((acc, s) => acc + (s?.owner === 'P2' ? s.card.currentHealth : 0), 0)} HP</span>
              </div>
              <button onClick={() => setPhase('MENU')} className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)] text-sm">NUEVO DESPLIEGUE</button>
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
