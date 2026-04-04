import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Apuntamos al directorio donde guardaremos los artículos.
const directorioPosts = path.join(process.cwd(), 'content/blog');

/**
 * Obtiene los datos de todos los artículos y los ordena por fecha.
 */
export function obtenerPostsOrdenados() {
  // Lee todos los nombres de archivo en el directorio de posts.
  const nombresDeArchivo = fs.readdirSync(directorioPosts);
  
  const todosLosPosts = nombresDeArchivo.map(nombreDeArchivo => {
    // Quita la extensión ".md" para obtener el slug (ID del post).
    const slug = nombreDeArchivo.replace(/\.md$/, '');

    // Lee el contenido del archivo.
    const rutaCompleta = path.join(directorioPosts, nombreDeArchivo);
    const contenidoArchivo = fs.readFileSync(rutaCompleta, 'utf8');

    // Usa gray-matter para parsear los metadatos del post.
    const resultadoMatter = matter(contenidoArchivo);

    // Devuelve los datos junto con el slug.
    return {
      slug,
      ...(resultadoMatter.data as { title: string; date: string; description: string }),
    };
  });

  // Ordena los posts por fecha, del más reciente al más antiguo.
  return todosLosPosts.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

/**
 * Obtiene todos los slugs (IDs) posibles para los artículos.
 * Esto es necesario para que Next.js sepa qué rutas pre-renderizar.
 */
export function obtenerTodosLosSlugs() {
  const nombresDeArchivo = fs.readdirSync(directorioPosts);
  return nombresDeArchivo.map(nombreDeArchivo => {
    return {
      params: {
        slug: nombreDeArchivo.replace(/\.md$/, ''),
      },
    };
  });
}

/**
 * Obtiene los datos y el contenido HTML de un post específico a partir de su slug.
 */
export async function obtenerDatosPost(slug: string) {
  const rutaCompleta = path.join(directorioPosts, `${slug}.md`);
  const contenidoArchivo = fs.readFileSync(rutaCompleta, 'utf8');

  // Usa gray-matter para separar los metadatos del contenido.
  const resultadoMatter = matter(contenidoArchivo);

  // Usa remark para convertir el contenido Markdown a HTML.
  const contenidoProcesado = await remark()
    .use(html)
    .process(resultadoMatter.content);
  const contenidoHtml = contenidoProcesado.toString();

  // Devuelve todos los datos, incluyendo el contenido HTML.
  return {
    slug,
    contenidoHtml,
    ...(resultadoMatter.data as { title: string; date: string; description: string }),
  };
}
