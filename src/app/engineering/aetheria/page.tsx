"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Sword, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardDef, HEROES, TROOPS, GENERALS } from '@/lib/aetheria/classes';

type Player = 'P1' | 'P2';
type GameMode = 'LOCAL' | 'AI' | null;
type Phase = 'MENU' | 'DRAFT_HERO' | 'DRAFT_GENERALS' | 'PLAYING' | 'GAMEOVER';

// Extendemos CardDef para instanciar su vida actual sin mutar la base de datos
interface InGameCard extends CardDef {
  currentHealth: number;
}

interface BoardSlot {
  card: InGameCard;
  owner: Player;
}

export default function AetheriaPage() {
  const [phase, setPhase] = useState<Phase>('MENU');
  const [mode, setMode] = useState<GameMode>(null);
  const [turn, setTurn] = useState<Player>('P1');
  const [draftingPlayer, setDraftingPlayer] = useState<Player>('P1');
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);

  // Deck State
  const [heroP1, setHeroP1] = useState<InGameCard | null>(null);
  const [heroP2, setHeroP2] = useState<InGameCard | null>(null);
  
  const [handP1, setHandP1] = useState<InGameCard[]>([]);
  const [handP2, setHandP2] = useState<InGameCard[]>([]);

  // Draft Temp State
  const [selectedGenerals, setSelectedGenerals] = useState<InGameCard[]>([]);

  // Board State
  const [board, setBoard] = useState<(BoardSlot | null)[][]>(Array.from({ length: 4 }, () => Array(4).fill(null)));
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);

  // --- INITIALIZATION ---
  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setPhase('DRAFT_HERO');
    setDraftingPlayer('P1');
    setHeroP1(null); setHeroP2(null);
    setHandP1([]);   setHandP2([]);
    setBoard(Array.from({ length: 4 }, () => Array(4).fill(null)));
    setSelectedGenerals([]);
  };

  // --- DRAFTING PHASE ---
  const selectHero = (heroDef: CardDef) => {
    const hero: InGameCard = { ...heroDef, currentHealth: heroDef.health };
    const troops = TROOPS.filter(t => t.classType === hero.classType).map(t => ({ ...t, currentHealth: t.health }));
    
    // Aplicar Buffs del Héroe
    if (hero.classType === 'PALADIN') {
       troops.forEach(t => t.currentHealth += 2);
    } else if (hero.classType === 'RANGER') {
       troops.forEach(t => t.top.shield += 2);
    } // Warlock tiene +1 Daño que aplicaremos dinámicamente en el combate

    if (draftingPlayer === 'P1') {
      setHeroP1(hero);
      setHandP1(troops);
      setPhase('DRAFT_GENERALS');
    } else {
      setHeroP2(hero);
      setHandP2(troops);
      if (mode === 'LOCAL') {
         setPhase('DRAFT_GENERALS');
      }
    }
  };

  const toggleGeneralSelection = (genDef: CardDef) => {
    const exists = selectedGenerals.find(g => g.id === genDef.id);
    if (exists) {
      setSelectedGenerals(selectedGenerals.filter(g => g.id !== genDef.id));
    } else {
      if (selectedGenerals.length < 3) setSelectedGenerals([...selectedGenerals, { ...genDef, currentHealth: genDef.health }]);
    }
  };

  const confirmGenerals = () => {
    if (selectedGenerals.length !== 3) return;
    
    if (draftingPlayer === 'P1') {
      setHandP1(prev => [...prev, ...selectedGenerals]);
      setSelectedGenerals([]);
      
      if (mode === 'LOCAL') {
        setDraftingPlayer('P2');
        setPhase('DRAFT_HERO');
      } else {
        // Generar Draft de la IA
        setTimeout(() => {
           const aiHeroDef = HEROES[Math.floor(Math.random() * HEROES.length)];
           const aiHero: InGameCard = { ...aiHeroDef, currentHealth: aiHeroDef.health };
           const aiTroops = TROOPS.filter(t => t.classType === aiHero.classType).map(t => ({ ...t, currentHealth: t.health }));
           
           if (aiHero.classType === 'PALADIN') aiTroops.forEach(t => t.currentHealth += 2);
           if (aiHero.classType === 'RANGER') aiTroops.forEach(t => t.top.shield += 2);

           const shuffledGenerals = [...GENERALS].sort(() => 0.5 - Math.random());
           const aiGenerals = shuffledGenerals.slice(0, 3).map(g => ({ ...g, currentHealth: g.health }));
           
           setHeroP2(aiHero);
           setHandP2([...aiTroops, ...aiGenerals]);
           
           setDraftingPlayer('P1');
           setTurn('P1');
           setPhase('PLAYING');
        }, 800);
      }
    } else {
      setHandP2(prev => [...prev, ...selectedGenerals]);
      setSelectedGenerals([]);
      setDraftingPlayer('P1');
      setTurn('P1');
      setPhase('PLAYING');
    }
  };

  // --- COMBAT LOGIC (HEALTH & SURVIVAL) ---
  const resolveCombat = (currentBoard: (BoardSlot | null)[][], row: number, col: number, attacker: Player, heroAtt: InGameCard | null): (BoardSlot | null)[][] => {
    const newBoard = currentBoard.map(r => [...r]);
    const slot = newBoard[row][col];
    if (!slot) return newBoard;

    const executeAttack = (r: number, c: number, attackerSide: typeof slot.card.top, defenderSide: typeof slot.card.bottom, isRanged = false) => {
      const defSlot = newBoard[r][c];
      if (!defSlot) return; // Vacío

      if (attackerSide.ability === 'HEAL') {
         if (defSlot.owner === attacker) {
            defSlot.card.currentHealth += 5; // Cura a la tropa aliada
         }
         return;
      }

      if (defSlot.owner === attacker) return; // No ataca a aliados

      let attDmg = attackerSide.damage;
      // Warlock Buff: +1 Daño
      if (heroAtt?.classType === 'WARLOCK') attDmg += 1;

      let defShield = defenderSide.shield;
      if (attackerSide.ability === 'PIERCE') defShield = 0;

      const damageDealt = Math.max(0, attDmg - defShield);
      
      defSlot.card.currentHealth -= damageDealt;
      
      // Destrucción física
      if (defSlot.card.currentHealth <= 0) {
         newBoard[r][c] = null;
      }
    };

    // TOP
    if (row > 0) executeAttack(row - 1, col, slot.card.top, newBoard[row - 1][col]?.card.bottom || {damage:0, shield:0, ability:'NONE'});
    // BOTTOM
    if (row < 3) executeAttack(row + 1, col, slot.card.bottom, newBoard[row + 1][col]?.card.top || {damage:0, shield:0, ability:'NONE'});
    // LEFT
    if (col > 0) executeAttack(row, col - 1, slot.card.left, newBoard[row][col - 1]?.card.right || {damage:0, shield:0, ability:'NONE'});
    // RIGHT
    if (col < 3) executeAttack(row, col + 1, slot.card.right, newBoard[row][col + 1]?.card.left || {damage:0, shield:0, ability:'NONE'});

    // RANGED Extra
    if (slot.card.top.ability === 'RANGED' && row > 1) {
      executeAttack(row - 2, col, slot.card.top, newBoard[row - 2][col]?.card.bottom || {damage:0, shield:0, ability:'NONE'}, true);
    }
    if (slot.card.bottom.ability === 'RANGED' && row < 2) {
      executeAttack(row + 2, col, slot.card.bottom, newBoard[row + 2][col]?.card.top || {damage:0, shield:0, ability:'NONE'}, true);
    }
    if (slot.card.left.ability === 'RANGED' && col > 1) {
      executeAttack(row, col - 2, slot.card.left, newBoard[row][col - 2]?.card.right || {damage:0, shield:0, ability:'NONE'}, true);
    }
    if (slot.card.right.ability === 'RANGED' && col < 2) {
      executeAttack(row, col + 2, slot.card.right, newBoard[row][col + 2]?.card.left || {damage:0, shield:0, ability:'NONE'}, true);
    }

    return newBoard;
  };

  // --- PLAY TURN ---
  const handleCellClick = (row: number, col: number) => {
    if (phase !== 'PLAYING' || selectedHandIndex === null) return;
    if (board[row][col] !== null) return;
    if (mode === 'AI' && turn === 'P2') return;

    const isP1 = turn === 'P1';
    const activeHand = isP1 ? handP1 : handP2;
    const cardToPlay = activeHand[selectedHandIndex];
    const heroAtt = isP1 ? heroP1 : heroP2;

    if (isP1) setHandP1(handP1.filter((_, i) => i !== selectedHandIndex));
    else setHandP2(handP2.filter((_, i) => i !== selectedHandIndex));
    setSelectedHandIndex(null);

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = { card: { ...cardToPlay }, owner: turn };
    
    const finalBoard = resolveCombat(newBoard, row, col, turn, heroAtt);
    setBoard(finalBoard);
    setTurn(turn === 'P1' ? 'P2' : 'P1');
  };

  // --- AI LOGIC (MINIMAX GREEDY HP-BASED) ---
  useEffect(() => {
    if (phase === 'PLAYING' && mode === 'AI' && turn === 'P2' && handP2.length > 0 && !winner) {
      const t = setTimeout(executeAITurn, 1200);
      return () => clearTimeout(t);
    }
  }, [turn, phase, winner, handP2]);

  const executeAITurn = () => {
    let bestScore = -Infinity;
    let bestMove = { cardIndex: 0, r: 0, c: 0 };

    for (let i = 0; i < handP2.length; i++) {
      const testCard = handP2[i];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === null) {
            const simBoard = board.map(row => row.map(cell => cell ? { ...cell, card: { ...cell.card } } : null));
            simBoard[r][c] = { card: { ...testCard }, owner: 'P2' };
            const finalSimBoard = resolveCombat(simBoard, r, c, 'P2', heroP2);
            
            // Score = (Vida Total IA Sobreviviente * 1) - (Vida Total Jugador Sobreviviente * 2)
            let aiHp = 0; let p1Hp = 0;
            for (let tr = 0; tr < 4; tr++) {
              for (let tc = 0; tc < 4; tc++) {
                 const slot = finalSimBoard[tr][tc];
                 if (slot?.owner === 'P2') aiHp += slot.card.currentHealth;
                 if (slot?.owner === 'P1') p1Hp += slot.card.currentHealth;
              }
            }
            // Preferir esquinas
            const isCorner = (r===0||r===3) && (c===0||c===3) ? 2 : 0;
            const score = aiHp - (p1Hp * 2) + isCorner;

            if (score > bestScore) {
              bestScore = score;
              bestMove = { cardIndex: i, r, c };
            }
          }
        }
      }
    }

    const cardToPlay = handP2[bestMove.cardIndex];
    setHandP2(handP2.filter((_, idx) => idx !== bestMove.cardIndex));
    
    const newBoard = board.map(r => r.map(c => c ? { ...c, card: { ...c.card } } : null));
    newBoard[bestMove.r][bestMove.c] = { card: { ...cardToPlay }, owner: 'P2' };
    const finalBoard = resolveCombat(newBoard, bestMove.r, bestMove.c, 'P2', heroP2);
    
    setBoard(finalBoard);
    setTurn('P1');
  };

  // --- WIN CONDITION ---
  useEffect(() => {
    if (phase === 'PLAYING' && handP1.length === 0 && handP2.length === 0) {
      let hp1 = 0; let hp2 = 0;
      board.flat().forEach(s => {
        if (s?.owner === 'P1') hp1 += s.card.currentHealth;
        if (s?.owner === 'P2') hp2 += s.card.currentHealth;
      });
      if (hp1 > hp2) setWinner('P1');
      else if (hp2 > hp1) setWinner('P2');
      else setWinner('DRAW');
      setPhase('GAMEOVER');
    }
  }, [board, handP1.length, handP2.length, phase]);

  // --- UI RENDERERS ---
  const renderCard = (card: InGameCard | CardDef, owner: Player | null, isSelected: boolean = false, onClick?: () => void) => {
    const isP1 = owner === 'P1';
    const isElite = card.type === 'HERO' || card.type === 'GENERAL';
    const border = isSelected ? 'border-yellow-400 border-4 scale-105 shadow-[0_0_20px_#facc15]' : (isElite ? 'border-[#d4af37] border border-b-2' : 'border-zinc-700 border');
    const bgBase = isP1 ? 'bg-red-950/40' : (owner === 'P2' ? 'bg-blue-950/40' : 'bg-zinc-900/40');
    
    const renderStat = (side: typeof card.top, dirClass: string) => {
      if (side.damage === 0 && side.shield === 0 && side.ability === 'NONE') return null;
      return (
        <div className={`absolute ${dirClass} flex items-center justify-center gap-1.5 opacity-90 text-[10px]`}>
          <div className="flex items-center text-zinc-300"><Sword size={10} className="mr-0.5 text-zinc-500"/>{side.damage}</div>
          <div className="flex items-center text-zinc-300"><Shield size={10} className="mr-0.5 text-zinc-500"/>{side.shield}</div>
          {side.ability !== 'NONE' && <div className="text-yellow-400 font-bold ml-0.5"><Sparkles size={10} /></div>}
        </div>
      );
    };

    const hp = (card as InGameCard).currentHealth !== undefined ? (card as InGameCard).currentHealth : card.health;

    return (
      <motion.div 
        layoutId={card.id + Math.random()} 
        onClick={onClick}
        whileHover={{ y: onClick ? -5 : 0 }}
        className={`w-[120px] h-[160px] rounded-lg cursor-pointer select-none relative overflow-hidden backdrop-blur-md flex flex-col transition-all ${bgBase} ${border}`}
        style={{ backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.8) 100%)' }}
      >
        {/* Name and Type */}
        <div className="w-full text-center py-1 bg-black/50 border-b border-white/10 px-1">
           <p className={`text-[9px] font-bold truncate tracking-widest uppercase ${isElite ? 'text-[#d4af37]' : 'text-zinc-400'}`}>{card.name}</p>
        </div>

        {/* Stats */}
        <div className="flex-1 relative w-full">
           {renderStat(card.top, "top-1 left-1/2 -translate-x-1/2 flex-col")}
           {renderStat(card.bottom, "bottom-1 left-1/2 -translate-x-1/2 flex-col-reverse")}
           {renderStat(card.left, "left-1 top-1/2 -translate-y-1/2 flex-row")}
           {renderStat(card.right, "right-1 top-1/2 -translate-y-1/2 flex-row-reverse")}

           {/* Health Center */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-full w-12 h-12 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-black/60 border ${isElite ? 'border-[#d4af37]/30' : 'border-white/10'}`}>
              <Heart size={14} className="text-red-500/50 absolute top-2" />
              <span className={`text-xl font-black mt-2 tracking-tighter ${hp <= 0 ? 'text-zinc-600' : 'text-white'}`}>{hp}</span>
           </div>
        </div>
      </motion.div>
    );
  };

  return (
    <main className="min-h-screen w-screen bg-[#09090b] text-zinc-200 flex flex-col relative overflow-hidden font-sans">
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#09090b] to-[#09090b] pointer-events-none"></div>

      {/* Header */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/engineering" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold">
          <ArrowLeft size={14} /> SYSTEM NEUTRAL
        </Link>
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-12">
        {phase === 'MENU' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center max-w-xl text-center">
             <Heart className="text-[#d4af37] w-12 h-12 mb-6" />
             <h1 className="text-5xl font-black tracking-tight mb-4 uppercase text-white">Aetheria Tactics</h1>
             <p className="text-zinc-400 mb-12 text-sm leading-relaxed max-w-md">Una simulación de guerra estratégica. Posiciona tus tropas en el tablero 4x4. Reduce la vida de las cartas enemigas a 0 para aniquilarlas. Sobrevive.</p>
             <div className="flex gap-4">
                <button onClick={() => startGame('LOCAL')} className="px-8 py-4 bg-zinc-100 text-black rounded font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors cursor-pointer">Local PvP</button>
                <button onClick={() => startGame('AI')} className="px-8 py-4 bg-transparent text-white border border-zinc-700 rounded font-bold uppercase tracking-widest text-xs hover:border-zinc-500 transition-colors cursor-pointer">Vs Autómata</button>
             </div>
          </motion.div>
        )}

        {phase === 'DRAFT_HERO' && (
          <div className="flex flex-col items-center w-full max-w-5xl">
            <h2 className="text-2xl text-white font-black mb-2 uppercase tracking-wide">Despliegue de Comando</h2>
            <p className="text-zinc-500 mb-12 uppercase tracking-widest text-xs font-bold">
               SELECCIONA TU HÉROE - <span className={draftingPlayer === 'P1' ? 'text-red-400' : 'text-blue-400'}>{draftingPlayer}</span>
            </p>
            <div className="flex gap-8 justify-center">
               {HEROES.map(h => (
                  <div key={h.id} className="flex flex-col items-center">
                     {renderCard(h, null, false, () => selectHero(h))}
                     <p className="text-xs text-zinc-500 mt-4 max-w-[120px] text-center leading-tight">
                        Añade 6 tropas clase {h.classType} a tu mazo.
                     </p>
                  </div>
               ))}
            </div>
          </div>
        )}

        {phase === 'DRAFT_GENERALS' && (
          <div className="flex flex-col items-center w-full max-w-5xl">
            <h2 className="text-2xl text-white font-black mb-2 uppercase tracking-wide">Reclutamiento de Élite</h2>
            <p className="text-zinc-500 mb-12 uppercase tracking-widest text-xs font-bold">
               ELIGE 3 GENERALES - <span className={draftingPlayer === 'P1' ? 'text-red-400' : 'text-blue-400'}>{draftingPlayer}</span>
               <span className="text-white ml-4">({selectedGenerals.length}/3)</span>
            </p>
            <div className="grid grid-cols-6 gap-4 mb-12">
               {GENERALS.map(g => (
                  <div key={g.id}>
                     {renderCard(g, null, !!selectedGenerals.find(sg => sg.id === g.id), () => toggleGeneralSelection(g))}
                  </div>
               ))}
            </div>
            <button 
               onClick={confirmGenerals}
               disabled={selectedGenerals.length !== 3}
               className={`px-12 py-4 rounded font-bold uppercase tracking-widest text-xs transition-all ${selectedGenerals.length === 3 ? 'bg-[#d4af37] text-black hover:bg-yellow-400 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
            >
               Confirmar Élite
            </button>
          </div>
        )}

        {(phase === 'PLAYING' || phase === 'GAMEOVER') && (
          <div className="flex w-full h-[750px] justify-between items-center max-w-[1400px] relative mx-auto gap-8">
            
            {/* P1 HAND */}
            <div className="w-1/4 flex flex-col items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-2xl h-full relative">
               <div className="absolute -top-6 bg-zinc-900 px-4 py-1 border border-zinc-700 rounded-full">
                  <span className="text-red-400 font-black uppercase text-xs tracking-widest">JUGADOR 1</span>
               </div>
               
               {/* Hero Display */}
               <div className="mb-6 w-full flex flex-col items-center border-b border-zinc-800 pb-6 pointer-events-none opacity-80 scale-90">
                  {heroP1 && renderCard(heroP1, 'P1')}
               </div>

               <div className="flex flex-wrap gap-2 justify-center content-start flex-1 overflow-y-auto w-full custom-scrollbar pr-2">
                  <AnimatePresence>
                     {handP1.map((c, i) => (
                       <motion.div key={c.id + i} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 0.8 }} exit={{ opacity: 0, scale: 0 }}>
                         {renderCard(c, 'P1', turn === 'P1' && selectedHandIndex === i && phase === 'PLAYING', () => {
                            if (phase === 'PLAYING' && turn === 'P1') setSelectedHandIndex(i);
                         })}
                       </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>

            {/* BOARD */}
            <div className="flex-shrink-0 w-[600px] h-[600px] bg-zinc-950/80 rounded-2xl p-4 shadow-[0_0_50px_rgba(0,0,0,1)] border border-zinc-800 relative flex flex-col">
               <div className="absolute top-0 right-0 p-4 opacity-10 flex gap-4">
                  <Sword size={400} />
               </div>
               <div className="grid grid-cols-4 grid-rows-4 h-full w-full gap-2 relative z-10">
                  {board.map((row, rIdx) => 
                     row.map((slot, cIdx) => (
                        <div 
                           key={`${rIdx}-${cIdx}`} 
                           onClick={() => handleCellClick(rIdx, cIdx)}
                           className={`w-full h-full bg-zinc-900/80 rounded border border-zinc-800/50 flex items-center justify-center transition-all ${selectedHandIndex !== null && slot === null ? 'bg-zinc-800 hover:bg-zinc-700 cursor-crosshair border-zinc-600' : ''}`}
                        >
                           <AnimatePresence>
                              {slot && (
                                 <motion.div initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0, rotate: 10 }} transition={{ type: 'spring' }} className="w-full h-full flex items-center justify-center scale-90">
                                    {renderCard(slot.card, slot.owner)}
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     ))
                  )}
               </div>
            </div>

            {/* P2 HAND */}
            <div className="w-1/4 flex flex-col items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-2xl h-full relative">
               <div className="absolute -top-6 bg-zinc-900 px-4 py-1 border border-zinc-700 rounded-full">
                  <span className="text-blue-400 font-black uppercase text-xs tracking-widest">{mode === 'AI' ? 'AUTÓMATA' : 'JUGADOR 2'}</span>
               </div>
               
               {/* Hero Display */}
               <div className="mb-6 w-full flex flex-col items-center border-b border-zinc-800 pb-6 pointer-events-none opacity-80 scale-90">
                  {heroP2 && renderCard(heroP2, 'P2')}
               </div>

               {mode === 'AI' && turn === 'P2' && phase === 'PLAYING' && (
                  <div className="text-cyan-400 text-xs tracking-widest uppercase font-bold text-center mb-4 animate-pulse">Computando Estrategia...</div>
               )}

               <div className="flex flex-wrap gap-2 justify-center content-start flex-1 overflow-y-auto w-full custom-scrollbar pr-2">
                  <AnimatePresence>
                     {handP2.map((c, i) => (
                       <motion.div key={c.id + i} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 0.8 }} exit={{ opacity: 0, scale: 0 }}>
                          {mode === 'AI' ? (
                             <div className="w-[120px] h-[160px] bg-zinc-950 border border-blue-900/30 rounded-lg flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full border border-blue-500/20 text-blue-500 flex items-center justify-center text-[10px] font-black">AI</div>
                             </div>
                          ) : (
                             renderCard(c, 'P2', turn === 'P2' && selectedHandIndex === i && phase === 'PLAYING', () => {
                                if (phase === 'PLAYING' && turn === 'P2') setSelectedHandIndex(i);
                             })
                          )}
                       </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>

          </div>
        )}

      </div>

      {phase === 'GAMEOVER' && (
         <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
            <h2 className={`text-6xl font-black uppercase tracking-widest mb-4 ${winner === 'P1' ? 'text-red-500' : winner === 'P2' ? 'text-blue-500' : 'text-zinc-400'}`}>
               {winner === 'DRAW' ? 'EMPATE TOTAL' : `VICTORIA DEL ${winner === 'P1' ? 'JUGADOR 1' : mode === 'AI' ? 'AUTÓMATA' : 'JUGADOR 2'}`}
            </h2>
            <p className="text-zinc-500 uppercase tracking-widest text-sm mb-12">Todas las fuerzas hostiles eliminadas</p>
            
            <div className="flex gap-16 text-center text-4xl font-black text-white/80 mb-16">
               <div className="flex flex-col items-center gap-2 text-red-400">
                  <Heart size={32} />
                  <span>{board.flat().reduce((acc, s) => acc + (s?.owner === 'P1' ? s.card.currentHealth : 0), 0)} HP</span>
               </div>
               <div className="w-px h-full bg-zinc-800"></div>
               <div className="flex flex-col items-center gap-2 text-blue-400">
                  <Heart size={32} />
                  <span>{board.flat().reduce((acc, s) => acc + (s?.owner === 'P2' ? s.card.currentHealth : 0), 0)} HP</span>
               </div>
            </div>

            <button onClick={() => setPhase('MENU')} className="px-10 py-5 bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)]">
               RETORNAR A BASE
            </button>
         </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </main>
  );
}
