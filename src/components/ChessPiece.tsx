"use client";
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

// Mapeo de nombres de piezas a nombres de nodos en el GLB
const pieceNodeMap: { [key: string]: string } = {
  'wK': 'King_White',
  'wQ': 'Queen_White',
  'wR': 'Rook_White',
  'wB': 'Bishop_White',
  'wN': 'Knight_White',
  'wP': 'Pawn_White',
  'bK': 'King_Black',
  'bQ': 'Queen_Black',
  'bR': 'Rook_Black',
  'bB': 'Bishop_Black',
  'bN': 'Knight_Black',
  'bP': 'Pawn_Black',
};

export function ChessPiece({ piece, ...props }: { piece: string; [key: string]: any }) {
  const { nodes } = useGLTF('/models/chess_pieces.glb');
  
  const pieceName = pieceNodeMap[piece];
  const geometry = useMemo(() => {
    if (nodes[pieceName]) {
      return (nodes[pieceName] as any).geometry;
    }
    return null;
  }, [nodes, pieceName]);

  if (!geometry) {
    return null; // No renderizar si la pieza no se encuentra
  }

  const color = piece[0] === 'w' ? '#ffffff' : '#222222';

  return (
    <mesh {...props} geometry={geometry}>
      <meshStandardMaterial 
        color={color} 
        roughness={0.2} 
        metalness={0.8}
      />
    </mesh>
  );
}
