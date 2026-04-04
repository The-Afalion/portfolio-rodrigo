"use client";

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { incrementLikes } from './actions';
import toast from 'react-hot-toast';

export default function LikeButton({ slug, initialLikes }: { slug: string, initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isPending, startTransition] = useTransition();
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (hasLiked) {
      toast.error("Ya has dado tu aplauso.");
      return;
    }
    
    setHasLiked(true);
    setLikes(prev => prev + 1); // Actualización optimista

    startTransition(async () => {
      const newLikes = await incrementLikes(slug);
      if (newLikes !== null) {
        setLikes(newLikes);
      } else {
        // Si falla, revertimos la actualización optimista
        setLikes(prev => prev - 1);
        setHasLiked(false);
        toast.error("No se pudo registrar el aplauso.");
      }
    });
  };

  return (
    <button
      onClick={handleLike}
      disabled={isPending || hasLiked}
      className="flex items-center gap-2 px-6 py-3 border rounded-full transition-all disabled:cursor-not-allowed group"
    >
      <Heart 
        className={`transition-all ${hasLiked ? 'text-red-500 fill-red-500' : 'text-muted-foreground group-hover:text-red-500'}`} 
        size={24} 
      />
      <span className="font-mono text-lg font-bold">{likes.toLocaleString('es-ES')}</span>
    </button>
  );
}
