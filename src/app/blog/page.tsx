import { obtenerPostsOrdenados } from '@/lib/blog';
import ListaDePosts from '@/components/ListaDePosts';
import EncabezadoBlog from '@/components/EncabezadoBlog';

export const metadata = {
  title: 'Blog | Rodrigo Alonso',
  description: 'Artículos sobre desarrollo de software, inteligencia artificial y tecnología.',
};

export default function PaginaBlog() {
  const todosLosPosts = obtenerPostsOrdenados();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
        <EncabezadoBlog />
        <ListaDePosts posts={todosLosPosts} />
      </div>
    </main>
  );
}
