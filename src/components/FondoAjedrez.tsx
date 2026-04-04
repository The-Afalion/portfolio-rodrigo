"use client";

export default function FondoAjedrez() {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-background">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, hsl(var(--border)) 25%, transparent 25%), 
            linear-gradient(-45deg, hsl(var(--border)) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, hsl(var(--border)) 75%),
            linear-gradient(-45deg, transparent 75%, hsl(var(--border)) 75%)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
          opacity: 0.1,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
    </div>
  );
}
