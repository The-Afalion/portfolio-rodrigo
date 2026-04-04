"use client";

export default function BgSepia() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-85">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(168,132,104,0.14),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(221,197,174,0.18),transparent_22%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(90,66,48,0.04))]" />
      <div className="absolute left-[14%] top-[16%] h-[20rem] w-[20rem] rounded-full border border-stone-700/10" />
    </div>
  );
}
