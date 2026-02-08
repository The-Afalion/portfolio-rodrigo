import { supabaseAdmin } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, Plus, Map, Activity } from 'lucide-react';

// --- COMPONENTES DE UI ---

function SlalomCard({ course }: { course: any }) {
  // Calculamos estadísticas simples basadas en el layout
  const gates = Array.isArray(course.layout) ? course.layout : [];
  const greenGates = gates.filter((g: any) => g.type === 'green').length;
  const redGates = gates.filter((g: any) => g.type === 'red').length;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-secondary/20 p-6 transition-all hover:bg-secondary/40 hover:border-blue-500/50">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{course.name}</h3>
          <p className="text-xs text-muted-foreground font-mono">por {course.authorName}</p>
        </div>
        <div className="p-2 bg-background/50 rounded-lg text-muted-foreground">
          <Map size={18} />
        </div>
      </div>
      
      <div className="flex gap-4 text-sm font-mono text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> {greenGates}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> {redGates}</span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
        <span className="text-xs text-muted-foreground">{new Date(course.createdAt).toLocaleDateString()}</span>
        <span className="text-xs font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
          Ver Diseño
        </span>
      </div>
    </div>
  );
}

async function getCourses() {
  const { data, error } = await supabaseAdmin
    .from('SlalomCourse')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching courses:", error.message);
    return [];
  }
  return data;
}

export default async function SlalomPage() {
  const courses = await getCourses();

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden">
      {/* Fondo sutil técnico */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4">
              <ArrowLeft size={16} /> Volver al Portfolio
            </Link>
            <h1 className="text-4xl font-bold tracking-tight">Slalom Architect</h1>
            <p className="text-muted-foreground mt-2">Diseña, analiza y comparte circuitos de competición.</p>
          </div>

          <Link href="/slalom/editor" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus size={18} /> Nuevo Diseño
          </Link>
        </header>

        {/* Stats / Heatmap Link */}
        <div className="mb-12 p-6 rounded-xl border border-border bg-secondary/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="font-bold">Análisis de Tendencias</h3>
              <p className="text-sm text-muted-foreground">Visualiza el mapa de calor global de todos los diseños.</p>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors">
            Ver Heatmap
          </button>
        </div>

        {/* Gallery */}
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Map size={20} className="text-blue-500" /> Diseños Recientes
        </h2>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <SlalomCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Aún no hay diseños. ¡Sé el primero en crear uno!</p>
          </div>
        )}
      </div>
    </main>
  );
}
