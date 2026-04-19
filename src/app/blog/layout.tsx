export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-16 pt-16 font-serif text-[#3e3024]">
      {children}
    </div>
  );
}
