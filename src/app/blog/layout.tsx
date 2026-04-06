export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="latte-theme min-h-screen bg-[#fcfaf4] font-serif text-[#3e3024] pt-16 pb-16">
      {children}
    </div>
  );
}
