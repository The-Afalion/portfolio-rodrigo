import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundSpotlight from "@/components/BackgroundSpotlight";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Rodrigo Alonso | Portfolio",
  description: "Ingeniero Informático & Desarrollador Full Stack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${mono.variable} font-sans antialiased`}
      >
        <Providers>
          <BackgroundSpotlight />
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
