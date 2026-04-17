import Link from "next/link";
import { MoveRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          {/* Replicating the logo from image */}
          <div className="relative flex items-center justify-center w-10 h-10 border-2 border-white rounded-full">
            <div className="absolute w-2 h-2 bg-white rounded-full -left-1 top-1/2 -translate-y-1/2" />
            <div className="absolute w-2 h-2 bg-white rounded-full -right-1 top-1/2 -translate-y-1/2" />
            <span className="text-xl font-light scale-y-150">/</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Codetopia | <span className="font-normal opacity-70">Community</span></span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-widest uppercase">
          <Link href="#" className="hover:opacity-70 transition-opacity">About</Link>
          <Link href="#" className="hover:opacity-70 transition-opacity">Team</Link>
          <Link href="#" className="hover:opacity-70 transition-opacity">Event & Activities</Link>
          <Link href="#" className="hover:opacity-70 transition-opacity">Articles</Link>
          <Link href="#" className="hover:opacity-70 transition-opacity">Gallery</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background Image / Pattern Placeholder */}
        <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070')] bg-cover bg-center mix-blend-overlay" />
        
        <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter opacity-20 leading-none">
              GROW, COLLABORATE,
            </h2>
            <h1 className="text-7xl md:text-9xl font-black tracking-tight leading-none mt-[-10px]">
              AND LEAD
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto font-medium leading-relaxed">
            A community where developers and technologists learn together, collaborate, and grow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <div className="relative group w-fit">
              <div className="absolute inset-0 border border-white translate-x-[4px] translate-y-[4px] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
              <Link 
                href="/signup" 
                className="relative z-10 flex items-center justify-center h-16 px-10 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-zinc-200 transition-colors"
              >
                Join our community
              </Link>
            </div>
            
            <div className="relative group w-fit">
              <div className="absolute inset-0 border border-zinc-800 translate-x-[4px] translate-y-[4px] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
              <Link 
                href="/login" 
                className="relative z-10 flex items-center justify-center gap-3 h-16 px-10 bg-black text-white border border-zinc-800 font-bold uppercase tracking-widest text-sm hover:bg-zinc-900 transition-colors"
              >
                Login <MoveRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Branding */}
      <footer className="py-12 flex flex-col items-center gap-4 opacity-30">
        <div className="h-px w-24 bg-white/50 mb-4" />
        <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.3em]">
          <span>Security</span>
          <span>Sovereignty</span>
          <span>Scalability</span>
        </div>
      </footer>
    </div>
  );
}
