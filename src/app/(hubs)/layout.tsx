export default function HubsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flat-theme min-h-screen w-full bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
      {children}
    </div>
  )
}
