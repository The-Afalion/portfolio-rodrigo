import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { Proveedores } from "@/components/Proveedores";
import ContenidoPrincipal from "@/components/ContenidoPrincipal";

const fuenteSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: 'swap',
});

const fuenteMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f19" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://rodocodes.dev'),
  title: {
    default: "Rodrigo Alonso | Ingeniero de Software",
    template: "%s | Rodrigo Alonso",
  },
  description: "Portafolio de Rodrigo Alonso. Ingeniero de Software especializado en desarrollo web, inteligencia artificial y experiencias inmersivas.",
  keywords: ["Rodrigo Alonso", "Ingeniero de Software", "Desarrollador Web", "React", "Next.js", "Three.js", "IA", "Portafolio"],
  authors: [{ name: "Rodrigo Alonso" }],
  creator: "Rodrigo Alonso",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://rodocodes.dev",
    title: "Rodrigo Alonso | Ingeniero de Software",
    description: "Explora mis proyectos, experimentos con IA y modelos 3D.",
    siteName: "Rodrigo Alonso Portfolio",
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
    title: "Rodrigo Alonso | Ingeniero de Software",
    description: "Ingeniero de Software. Construyendo puentes entre sistemas de precisión y experiencias inmersivas.",
    creator: "@rodocodes",
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${fuenteSans.variable} ${fuenteMono.variable} font-sans antialiased selection:bg-green-500 selection:text-black`}
      >
        <Proveedores>
          <ContenidoPrincipal>{children}</ContenidoPrincipal>
        </Proveedores>
      </body>
    </html>
  );
}
