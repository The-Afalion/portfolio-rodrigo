"use client";

export default function BgObsidian() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-90">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(115,146,171,0.16),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(179,158,138,0.08),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_45%)]" />
      <div className="absolute left-[10%] top-[12%] h-[24rem] w-[24rem] rounded-full border border-white/5" />
      <div className="absolute right-[8%] top-[14%] h-[18rem] w-[18rem] rounded-full border border-white/5" />
    </div>
  );
}
