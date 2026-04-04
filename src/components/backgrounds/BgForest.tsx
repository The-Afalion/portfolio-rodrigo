"use client";

export default function BgForest() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-90">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(124,161,143,0.18),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(218,202,184,0.08),transparent_22%)]" />
      <div className="absolute inset-x-0 top-[22%] h-px bg-gradient-to-r from-transparent via-emerald-100/10 to-transparent" />
      <div className="absolute inset-y-0 right-[14%] w-px bg-gradient-to-b from-transparent via-emerald-100/10 to-transparent" />
    </div>
  );
}
