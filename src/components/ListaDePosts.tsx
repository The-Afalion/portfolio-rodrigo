"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
}

export default function ListaDePosts({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-10">
      {posts.map((post, index) => (
        <motion.div 
          key={post.slug}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 * (index + 1) } }}
        >
          <Link href={`/blog/${post.slug}`} className="block group">
            <article>
              <header>
                <h2 className="text-2xl sm:text-3xl font-bold group-hover:text-blue-500 transition-colors">
                  {post.title}
                </h2>
                <time dateTime={post.date} className="text-sm text-muted-foreground font-mono mt-1">
                  {new Date(post.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </header>
              <p className="mt-3 text-muted-foreground">{post.description}</p>
            </article>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
