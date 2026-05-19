import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/layout/Providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codetopia | Community Portal",
  description: "The official community portal for The Codetopian Collective.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased min-h-screen bg-white text-zinc-950 flex flex-col overflow-x-hidden`}
      >
        <Providers>
          <TooltipProvider>
            <Toaster position="top-center" richColors theme="dark" />
            {children}
            <Analytics />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
