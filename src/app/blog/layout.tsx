export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="latte-theme min-h-screen bg-[#fcfaf4] pb-16 pt-16 font-serif text-[#3e3024]">
      {children}
    </div>
  );
}
