import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
};

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <main className={`page-shell ${className}`.trim()}>
      <div className="page-container">{children}</div>
    </main>
  );
}

export function PageHero({ eyebrow, title, description, actions, aside }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="space-y-5">
        {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
        <div className="space-y-4">
          <h1 className="page-title">{title}</h1>
          <p className="page-lead">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
      {aside ? <div className="w-full max-w-sm">{aside}</div> : null}
    </section>
  );
}

export function SectionPanel({ children, className = "" }: SectionProps) {
  return <section className={`surface-panel p-6 md:p-8 ${className}`.trim()}>{children}</section>;
}

export function SectionInset({ children, className = "" }: SectionProps) {
  return <section className={`surface-panel-muted p-5 md:p-6 ${className}`.trim()}>{children}</section>;
}
