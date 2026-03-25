"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AETHERIA_CARDS, CardDef, CardSide } from '@/lib/aetheria/cards';

type Player = 'P1' | 'P2';
type GameMode = 'LOCAL' | 'AI' | null;
type Phase = 'MENU' | 'DRAFTING' | 'PLAYING' | 'GAMEOVER';

interface BoardSlot {
  card: CardDef;
  owner: Player;
  shieldBonus: number;
}

export default function AetheriaPage() {
  const [phase, setPhase] = useState<Phase>('MENU');
  const [mode, setMode] = useState<GameMode>(null);
  const [turn, setTurn] = useState<Player>('P1');
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);

  // Drafting State
  const [draftPool, setDraftPool] = useState<CardDef[]>([]);
  const [handP1, setHandP1] = useState<CardDef[]>([]);
  const [handP2, setHandP2] = useState<CardDef[]>([]);

  // Board State
  const [board, setBoard] = useState<(BoardSlot | null)[][]>(() => 
    Array.from({ length: 4 }, () => Array(4).fill(null))
  );

  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);

  // --- GAME INITIALIZATION ---
  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    
    // Obtener 12 cartas aleatorias únicas
    const shuffled = [...AETHERIA_CARDS].sort(() => 0.5 - Math.random());
    setDraftPool(shuffled.slice(0, 12));
    
    setHandP1([]);
    setHandP2([]);
    setBoard(Array.from({ length: 4 }, () => Array(4).fill(null)));
    setTurn('P1');
    setWinner(null);
    setSelectedHandIndex(null);
    setPhase('DRAFTING');
  };

  // --- DRAFTING PHASE ---
  const handleDraftSelect = (cardIndex: number) => {
    if (phase !== 'DRAFTING') return;

    const selectedCard = draftPool[cardIndex];
    const newPool = draftPool.filter((_, i) => i !== cardIndex);

    if (turn === 'P1') {
      setHandP1(prev => [...prev, selectedCard]);
      setDraftPool(newPool);
      setTurn('P2');
      
      // Si el modo es AI, la AI roba inmediatamente
      if (mode === 'AI' && newPool.length > 0) {
        setTimeout(() => {
          // IA muy simple: roba la primera
          const aiCard = newPool[0];
          setHandP2(prev => [...prev, aiCard]);
          setDraftPool(newPool.slice(1));
          setTurn('P1');
        }, 500);
      }
    } else if (mode === 'LOCAL') {
      setHandP2(prev => [...prev, selectedCard]);
      setDraftPool(newPool);
      setTurn('P1');
    }
  };

  useEffect(() => {
    // Check si el draft ha terminado
    if (phase === 'DRAFTING' && handP1.length === 6 && handP2.length === 6) {
      setTimeout(() => {
        setPhase('PLAYING');
        setTurn('P1');
      }, 500);
    }
  }, [handP1.length, handP2.length, phase]);

  // --- COMBAT LOGIC ---
  const resolveCombat = (currentBoard: (BoardSlot | null)[][], row: number, col: number, attacker: Player): (BoardSlot | null)[][] => {
    const newBoard = currentBoard.map(r => [...r]);
    const slot = newBoard[row][col];
    if (!slot) return newBoard;

    const attack = (r: number, c: number, attackerSide: CardSide, defenderSide: CardSide, isRanged: boolean = false) => {
      const defSlot = newBoard[r][c];
      if (!defSlot || defSlot.owner === attacker) return; // Vacío o aliado

      let attDmg = attackerSide.damage;
      let defShield = defenderSide.shield + defSlot.shieldBonus;

      if (attackerSide.ability === 'PIERCE') defShield = 0;
      if (attackerSide.ability === 'HEAL') return; // Heal no ataca

      if (attDmg > defShield) {
        // Victoria! Captura la carta
        newBoard[r][c] = { ...defSlot, owner: attacker };
      }
    };

    const heal = (r: number, c: number) => {
      const allySlot = newBoard[r][c];
      if (allySlot && allySlot.owner === attacker) {
         newBoard[r][c] = { ...allySlot, shieldBonus: allySlot.shieldBonus + 2 };
      }
    };

    // TOP
    if (row > 0) attack(row - 1, col, slot.card.top, newBoard[row - 1][col]?.card.bottom || {damage:0, shield:99, ability:'NONE'});
    // BOTTOM
    if (row < 3) attack(row + 1, col, slot.card.bottom, newBoard[row + 1][col]?.card.top || {damage:0, shield:99, ability:'NONE'});
    // LEFT
    if (col > 0) attack(row, col - 1, slot.card.left, newBoard[row][col - 1]?.card.right || {damage:0, shield:99, ability:'NONE'});
    // RIGHT
    if (col < 3) attack(row, col + 1, slot.card.right, newBoard[row][col + 1]?.card.left || {damage:0, shield:99, ability:'NONE'});

    // Habilidades Especiales Adyacentes (HEAL)
    // TOP
    if (slot.card.top.ability === 'HEAL' && row > 0) heal(row - 1, col);
    if (slot.card.bottom.ability === 'HEAL' && row < 3) heal(row + 1, col);
    if (slot.card.left.ability === 'HEAL' && col > 0) heal(row, col - 1);
    if (slot.card.right.ability === 'HEAL' && col < 3) heal(row, col + 1);

    // Habilidades a Distancia (RANGED)
    if (slot.card.top.ability === 'RANGED' && row > 1) {
      attack(row - 2, col, slot.card.top, newBoard[row - 2][col]?.card.bottom || {damage:0, shield:99, ability:'NONE'}, true);
    }
    if (slot.card.bottom.ability === 'RANGED' && row < 2) {
      attack(row + 2, col, slot.card.bottom, newBoard[row + 2][col]?.card.top || {damage:0, shield:99, ability:'NONE'}, true);
    }
    if (slot.card.left.ability === 'RANGED' && col > 1) {
      attack(row, col - 2, slot.card.left, newBoard[row][col - 2]?.card.right || {damage:0, shield:99, ability:'NONE'}, true);
    }
    if (slot.card.right.ability === 'RANGED' && col < 2) {
      attack(row, col + 2, slot.card.right, newBoard[row][col + 2]?.card.left || {damage:0, shield:99, ability:'NONE'}, true);
    }

    return newBoard;
  };

  // --- GAMEPLAY PHASE ---
  const handleCellClick = (row: number, col: number) => {
    if (phase !== 'PLAYING') return;
    if (selectedHandIndex === null) return;
    if (board[row][col] !== null) return; // Celda ocupada
    if (mode === 'AI' && turn === 'P2') return; // Turno de la IA

    const isP1 = turn === 'P1';
    const activeHand = isP1 ? handP1 : handP2;
    const cardToPlay = activeHand[selectedHandIndex];

    // Quitar de la mano
    if (isP1) setHandP1(handP1.filter((_, i) => i !== selectedHandIndex));
    else setHandP2(handP2.filter((_, i) => i !== selectedHandIndex));

    setSelectedHandIndex(null);

    // Colocar carta
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = { card: cardToPlay, owner: turn, shieldBonus: 0 };
    
    // Resolver Combate
    const finalBoard = resolveCombat(newBoard, row, col, turn);
    setBoard(finalBoard);

    // Cambiar Turno
    setTurn(turn === 'P1' ? 'P2' : 'P1');
  };

  // --- AI LOGIC ---
  useEffect(() => {
    if (phase === 'PLAYING' && mode === 'AI' && turn === 'P2' && handP2.length > 0 && !winner) {
      const delay = setTimeout(() => {
        executeAITurn();
      }, 1000); // Dar a la IA 1 segundo para "pensar" (efecto visual)
      return () => clearTimeout(delay);
    }
  }, [turn, phase, winner, board, handP2]); // Dependency array para disparar cuando es su turno

  const executeAITurn = () => {
    let bestScore = -Infinity;
    let bestMove = { cardIndex: 0, r: 0, c: 0 };

    for (let i = 0; i < handP2.length; i++) {
      const testCard = handP2[i];
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (board[r][c] === null) {
            // Simulamos movimiento
            const simBoard = board.map(row => [...row]);
            simBoard[r][c] = { card: testCard, owner: 'P2', shieldBonus: 0 };
            const finalSimBoard = resolveCombat(simBoard, r, c, 'P2');
            
            // Contabilizamos cuántas cartas azules (P2) hay tras resolver
            let blueCount = 0;
            for (let tr = 0; tr < 4; tr++) {
              for (let tc = 0; tc < 4; tc++) {
                 if (finalSimBoard[tr][tc]?.owner === 'P2') blueCount++;
              }
            }
            
            // Tiebreaker: preferir colocar en las esquinas si el score es igual
            const isCorner = (r===0||r===3) && (c===0||c===3) ? 0.5 : 0;
            const score = blueCount + isCorner;

            if (score > bestScore) {
              bestScore = score;
              bestMove = { cardIndex: i, r, c };
            }
          }
        }
      }
    }

    // Ejecutar el mejor movimiento encontrado
    const cardToPlay = handP2[bestMove.cardIndex];
    setHandP2(handP2.filter((_, idx) => idx !== bestMove.cardIndex));
    
    const newBoard = board.map(row => [...row]);
    newBoard[bestMove.r][bestMove.c] = { card: cardToPlay, owner: 'P2', shieldBonus: 0 };
    const finalBoard = resolveCombat(newBoard, bestMove.r, bestMove.c, 'P2');
    setBoard(finalBoard);
    setTurn('P1');
  };

  // --- WIN CONDITION ---
  useEffect(() => {
    if (phase === 'PLAYING') {
      const emptySlots = board.flat().filter(s => s === null).length;
      if (emptySlots === 4 && handP1.length === 0 && handP2.length === 0) {
         // O todas las cartas jugadas
         let c1 = 0; let c2 = 0;
         board.flat().forEach(s => {
           if (s?.owner === 'P1') c1++;
           if (s?.owner === 'P2') c2++;
         });
         
         if (c1 > c2) setWinner('P1');
         else if (c2 > c1) setWinner('P2');
         else setWinner('DRAW');
         setPhase('GAMEOVER');
      }
    }
  }, [board, handP1, handP2, phase]);


  // --- UI RENDERERS ---
  const renderCard = (card: CardDef, owner: Player | null, isSelected: boolean = false, onClick?: () => void) => {
    const isP1 = owner === 'P1';
    const bgColor = owner ? (isP1 ? 'bg-red-900/80' : 'bg-blue-900/80') : 'bg-[#3e2723]';
    const borderColor = isSelected ? 'border-yellow-400 border-4' : 'border-[#d4af37] border-2';

    return (
      <motion.div 
        layoutId={card.id}
        whileHover={{ scale: onClick ? 1.05 : 1 }}
        onClick={onClick}
        className={`w-28 h-36 rounded-md shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_5px_15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-between p-1 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] ${bgColor} ${borderColor} cursor-pointer select-none relative overflow-hidden`}
        style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png'), linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.6))` }}
      >
        {/* TOP */}
        <div className="text-white text-[10px] font-bold absolute top-1 flex flex-col items-center leading-none">
          <span className="text-red-400">{card.top.damage}</span>
          <span className="text-cyan-300">{card.top.shield}</span>
          {card.top.ability !== 'NONE' && <span className="text-yellow-300 text-[8px]">{card.top.ability}</span>}
        </div>
        
        {/* LEFT */}
        <div className="text-white text-[10px] font-bold absolute left-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1 leading-none">
          <div className="flex flex-col text-center">
            <span className="text-red-400">{card.left.damage}</span>
            <span className="text-cyan-300">{card.left.shield}</span>
            {card.left.ability !== 'NONE' && <span className="text-yellow-300 text-[8px]">{card.left.ability}</span>}
          </div>
        </div>

        {/* RIGHT */}
        <div className="text-white text-[10px] font-bold absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1 leading-none">
          <div className="flex flex-col text-center">
            <span className="text-red-400">{card.right.damage}</span>
            <span className="text-cyan-300">{card.right.shield}</span>
            {card.right.ability !== 'NONE' && <span className="text-yellow-300 text-[8px]">{card.right.ability}</span>}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="text-white text-[10px] font-bold absolute bottom-1 flex flex-col items-center leading-none">
           {card.bottom.ability !== 'NONE' && <span className="text-yellow-300 text-[8px]">{card.bottom.ability}</span>}
           <span className="text-cyan-300">{card.bottom.shield}</span>
           <span className="text-red-400">{card.bottom.damage}</span>
        </div>

        {/* CENTER IMAGE/NAME */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full px-2 text-center pointer-events-none">
          <div className="w-12 h-12 bg-black/40 rounded-full border border-[#d4af37]/50 shadow-inner flex items-center justify-center mb-1">
             <span className="text-xs text-[#d4af37] opacity-80">{card.element}</span>
          </div>
          <span className="text-[10px] text-[#ffe082] font-black uppercase tracking-tighter leading-tight drop-shadow-md">{card.name}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <main className="min-h-screen w-screen bg-[#1c140f] flex flex-col items-center relative overflow-hidden font-serif" 
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-wood.png')` }}>
      
      {/* Header */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/engineering" className="flex items-center gap-2 text-[#d4af37]/70 hover:text-[#d4af37] transition-colors text-sm uppercase tracking-widest">
          <ArrowLeft size={16} /> Volver al Núcleo
        </Link>
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center py-10 px-4">
        
        {phase === 'MENU' && (
          <div className="flex flex-col items-center bg-black/60 p-12 rounded-xl border border-[#d4af37]/30 shadow-2xl backdrop-blur-md">
             <h1 className="text-5xl text-[#d4af37] font-black tracking-widest mb-2 drop-shadow-lg uppercase">Aetheria Tactics</h1>
             <p className="text-[#ffe082]/60 mb-12 italic">Elegancia. Posición. Dominio.</p>
             <div className="flex gap-6">
                <button onClick={() => startGame('LOCAL')} className="px-8 py-3 bg-gradient-to-b from-[#4e342e] to-[#3e2723] text-[#d4af37] border border-[#d4af37]/50 rounded font-bold uppercase tracking-wider hover:border-[#d4af37] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
                   Vs Jugador (Local)
                </button>
                <button onClick={() => startGame('AI')} className="px-8 py-3 bg-gradient-to-b from-[#37474f] to-[#263238] text-cyan-400 border border-cyan-500/50 rounded font-bold uppercase tracking-wider hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">
                   Vs Autómata (IA)
                </button>
             </div>
          </div>
        )}

        {phase === 'DRAFTING' && (
          <div className="flex flex-col items-center w-full max-w-6xl">
            <h2 className="text-3xl text-[#d4af37] font-bold mb-2">FASE DE SELECCIÓN</h2>
            <p className="text-white/60 mb-8 uppercase tracking-widest">
               Turno de Selección: <span className={turn === 'P1' ? 'text-red-400 font-bold' : 'text-blue-400 font-bold'}>{turn === 'P1' ? 'Jugador 1 (Rojo)' : 'Jugador 2 (Azul)'}</span>
            </p>
            
            <div className="grid grid-cols-6 gap-4 mb-12">
               <AnimatePresence>
                 {draftPool.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5 }}>
                       {renderCard(c, null, false, () => handleDraftSelect(i))}
                    </motion.div>
                 ))}
               </AnimatePresence>
            </div>

            <div className="flex w-full justify-between px-10">
               <div>
                  <h3 className="text-red-400 font-bold mb-4 uppercase tracking-widest text-center">MANO - J1 ({handP1.length}/6)</h3>
                  <div className="flex flex-wrap gap-2 justify-center w-[350px]">
                     {handP1.map(c => <div key={c.id} className="scale-75 origin-top">{renderCard(c, 'P1')}</div>)}
                  </div>
               </div>
               <div>
                  <h3 className="text-blue-400 font-bold mb-4 uppercase tracking-widest text-center">MANO - J2 ({handP2.length}/6)</h3>
                  <div className="flex flex-wrap gap-2 justify-center w-[350px]">
                     {handP2.map(c => <div key={c.id} className="scale-75 origin-top">{renderCard(c, 'P2')}</div>)}
                  </div>
               </div>
            </div>
          </div>
        )}

        {(phase === 'PLAYING' || phase === 'GAMEOVER') && (
          <div className="flex w-full h-[800px] justify-between items-center max-w-7xl relative mx-auto">
            
            {/* JUGADOR 1 */}
            <div className="w-1/4 flex flex-col items-center bg-red-950/20 p-6 rounded-xl border border-red-900/30">
               <h3 className="text-red-400 font-bold text-2xl mb-8 uppercase tracking-widest">JUGADOR 1</h3>
               <div className="flex flex-col gap-4">
                  {handP1.map((c, i) => (
                    <div key={c.id}>
                      {renderCard(c, 'P1', turn === 'P1' && selectedHandIndex === i && phase === 'PLAYING', () => {
                         if (phase === 'PLAYING' && turn === 'P1') setSelectedHandIndex(i);
                      })}
                    </div>
                  ))}
               </div>
            </div>

            {/* TABLERO */}
            <div className="w-[600px] h-[600px] bg-[#2e1d14] rounded-lg p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-4 border-[#1f1209] flex-shrink-0 relative overflow-hidden"
                 style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-pattern.png')` }}>
               
               {/* Grid */}
               <div className="grid grid-cols-4 grid-rows-4 h-full w-full gap-2 relative z-10">
                  {board.map((row, rIdx) => 
                    row.map((slot, cIdx) => (
                      <div 
                        key={`${rIdx}-${cIdx}`} 
                        onClick={() => handleCellClick(rIdx, cIdx)}
                        className={`w-full h-full bg-black/40 rounded shadow-inner border border-white/5 flex items-center justify-center relative cursor-crosshair hover:bg-white/10 transition-colors ${selectedHandIndex !== null && slot === null ? 'animate-pulse' : ''}`}
                      >
                         <AnimatePresence>
                           {slot && (
                             <motion.div initial={{ scale: 0, rotateY: -180 }} animate={{ scale: 1, rotateY: 0 }} transition={{ type: 'spring', damping: 15 }} className="w-[100%] h-[100%] flex items-center justify-center p-1">
                                {renderCard(slot.card, slot.owner)}
                             </motion.div>
                           )}
                         </AnimatePresence>
                         {slot?.shieldBonus ? (
                            <div className="absolute inset-0 border-2 border-cyan-400/50 rounded pointer-events-none animate-pulse"></div>
                         ) : null}
                      </div>
                    ))
                  )}
               </div>
            </div>

            {/* JUGADOR 2 / AI */}
            <div className="w-1/4 flex flex-col items-center bg-blue-950/20 p-6 rounded-xl border border-blue-900/30 relative">
               <h3 className="text-blue-400 font-bold text-2xl mb-8 uppercase tracking-widest">{mode === 'AI' ? 'AUTÓMATA' : 'JUGADOR 2'}</h3>
               {mode === 'AI' && turn === 'P2' && phase === 'PLAYING' && (
                  <div className="absolute top-2 w-full flex justify-center text-cyan-400 text-xs animate-pulse">Calculando movimientos...</div>
               )}
               <div className="flex flex-col gap-4 opacity-100">
                  {handP2.map((c, i) => (
                     <div key={c.id}>
                        {mode === 'AI' ? (
                           <div className="w-28 h-36 bg-black/80 border border-blue-500/30 flex items-center justify-center rounded-md">
                             {/* Ocultar cartas bot */}
                             <div className="w-12 h-12 bg-blue-900/50 rounded-full flex items-center justify-center"><span className="text-blue-300">A.I.</span></div>
                           </div>
                        ) : (
                           renderCard(c, 'P2', turn === 'P2' && selectedHandIndex === i && phase === 'PLAYING', () => {
                             if (phase === 'PLAYING' && turn === 'P2') setSelectedHandIndex(i);
                           })
                        )}
                     </div>
                  ))}
               </div>
            </div>

          </div>
        )}

      </div>

      {phase === 'GAMEOVER' && (
         <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center backdrop-blur-md">
            <h2 className="text-6xl font-black uppercase tracking-widest mb-6 drop-shadow-lg"
                style={{ color: winner === 'P1' ? '#f87171' : winner === 'P2' ? '#60a5fa' : '#d4af37' }}>
               {winner === 'DRAW' ? 'EMPATE ABSOLUTO' : `VICTORIA DEL ${winner === 'P1' ? 'JUGADOR 1' : mode === 'AI' ? 'AUTÓMATA' : 'JUGADOR 2'}`}
            </h2>
            <div className="flex gap-12 text-2xl text-white/50 mb-12 uppercase tracking-wide">
               <span className="text-red-400">Cartas J1: {board.flat().filter(s => s?.owner === 'P1').length}</span>
               <span className="text-blue-400">Cartas J2: {board.flat().filter(s => s?.owner === 'P2').length}</span>
            </div>
            <button onClick={() => setPhase('MENU')} className="px-10 py-4 bg-[#d4af37] text-white font-bold text-xl uppercase tracking-widest border border-yellow-200 shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:bg-[#fde047] transition-colors rounded">
               VOLVER A LA SALA
            </button>
         </div>
      )}

    </main>
  );
}
