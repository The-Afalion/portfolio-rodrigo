import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Sora } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

import { Proveedores } from "@/components/Proveedores";
import ContenidoPrincipal from "@/components/ContenidoPrincipal";
import { siteConfig } from "@/config/site";

const fuenteSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
});

const fuenteDisplay = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: 'swap',
});

const fuenteMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe6" },
    { media: "(prefers-color-scheme: dark)", color: "#161a20" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Rodrigo Alonso", "Ingeniero Informático", "Desarrollador Web", "React", "Next.js", "Three.js", "IA", "Portafolio"],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: siteConfig.siteUrl,
    title: siteConfig.title,
    description: "Explora proyectos, laboratorios técnicos y experimentos inmersivos.",
    siteName: `${siteConfig.name} Portfolio`,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rodrigo Alonso Portfolio',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: siteConfig.socialHandle,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function DisposicionRaiz({
  children,
  modal, // Recibimos el slot del modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode; // Tipo para el slot
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${fuenteSans.variable} ${fuenteDisplay.variable} ${fuenteMono.variable} font-sans antialiased text-foreground bg-background selection:bg-primary/20 selection:text-foreground`}
      >
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'font-mono',
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '1.1rem',
              boxShadow: '0 18px 48px rgba(15, 23, 42, 0.14)',
            },
          }}
        />
        <Proveedores>
          <ContenidoPrincipal>{children}</ContenidoPrincipal>
          {modal} {/* Renderizamos el modal aquí */}
        </Proveedores>
      </body>
    </html>
  );
}
