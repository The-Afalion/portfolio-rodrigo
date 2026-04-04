"use client";

export default function BgAlabaster() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-80">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(163,180,198,0.16),transparent_24%),radial-gradient(circle_at_88%_14%,rgba(210,188,171,0.18),transparent_22%),linear-gradient(180deg,transparent,rgba(108,123,139,0.04))]" />
      <div className="absolute inset-x-0 top-[18%] h-px bg-gradient-to-r from-transparent via-slate-500/10 to-transparent" />
      <div className="absolute inset-y-0 left-[12%] w-px bg-gradient-to-b from-transparent via-slate-500/10 to-transparent" />
    </div>
  );
}
