import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "Codetopia | Identity Provider",
  description: "Secure and sovereign identity management for the Codetopia community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased min-h-screen bg-black text-white flex flex-col overflow-x-hidden`}
      >
        <Toaster position="top-center" richColors theme="dark" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
