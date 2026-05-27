import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex flex-col font-mono text-white relative">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-6 w-full bg-black/60 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center">
          <Image
            src="/logos/codetopia-community.png"
            alt="Codetopia Community Logo"
            width={180}
            height={48}
            className="object-contain h-8 w-auto"
            priority
          />
        </div>
      </header>

      {/* Main Content Node */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-4 w-full mt-12 mb-16">
        {/* The Auth Card */}
        <LoginForm />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
