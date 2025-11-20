"use client";
import NewsletterForm from "./NewsletterForm";

export default function NewsletterSection() {
  return (
    <section className="py-24 px-4 bg-secondary">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Mantente Actualizado</h2>
        <p className="text-muted-foreground mb-8">
          Suscríbete para ser el primero en saber sobre nuevos proyectos, artículos y experimentos. Sin spam, prometido.
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
