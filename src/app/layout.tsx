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
            <Toaster
              position="top-center"
              theme="light"
              toastOptions={{
                classNames: {
                  toast:
                    "!rounded-none !shadow-none !border-grey-200 !bg-white !font-mono !text-sm !text-grey-900",
                  title: "!font-mono !text-sm !font-medium !text-grey-900",
                  description: "!font-mono !text-xs !text-grey-500",
                  actionButton:
                    "!rounded-none !bg-grey-900 !font-mono !text-xs !font-medium !text-white hover:!bg-grey-800",
                  cancelButton:
                    "!rounded-none !bg-transparent !font-mono !text-xs !text-grey-500 hover:!text-grey-900",
                  closeButton:
                    "!rounded-none !border-grey-200 !bg-white !text-grey-400 hover:!text-grey-900",
                  success: "!border-l-4 !border-l-emerald-600 [&_[data-icon]]:!text-emerald-600",
                  error: "!border-l-4 !border-l-red-600 [&_[data-icon]]:!text-red-600",
                  warning: "!border-l-4 !border-l-amber-600 [&_[data-icon]]:!text-amber-600",
                  info: "!border-l-4 !border-l-grey-900 [&_[data-icon]]:!text-grey-900",
                },
              }}
            />
            {children}
            <Analytics />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
