import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

const SortingVisualizer = dynamic(() => import('./SortingVisualizer'), {
  ssr: false,
});

export default function AlgorithmsPage() {
  return (
    <main className="min-h-screen bg-black text-magenta-500 font-mono p-6 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col">
        <header className="flex items-center justify-between mb-8 border-b border-magenta-900/50 pb-4">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-magenta-700 hover:text-magenta-500 transition-colors text-sm mb-2">
              <ArrowLeft size={16} /> SYSTEM_EXIT
            </Link>
            <h1 className="text-3xl font-bold tracking-tighter text-white">ALGO VISION</h1>
            <p className="text-magenta-800 text-xs">Visualización de Complejidad Algorítmica</p>
          </div>
        </header>

        <SortingVisualizer />
      </div>
    </main>
  );
}
