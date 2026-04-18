"use client";

import React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";
import {
  User,
  Globe,
  Camera,
  Save,
  Cpu,
  Plus,
  ShieldCheck,
  MapPin
} from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const inputStyles = "h-12 rounded-none border border-zinc-300 !bg-white px-4 font-mono text-[11px] uppercase tracking-wide placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:border-zinc-950 transition-all";
  const textareaStyles = "min-h-[120px] w-full rounded-none border border-zinc-300 !bg-white px-4 py-3 font-mono text-[11px] uppercase tracking-wide placeholder:text-zinc-400 focus-visible:outline-none focus-visible:border-zinc-950 transition-all resize-none";

  const [location, setLocation] = React.useState("Toronto, Ontario, Canada");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchPlaces = async () => {
      if (location.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&addressdetails=1&limit=5`);
        const data = await response.json();
        
        const results = data.map((item: any) => {
          const addr = item.address;
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.hamlet || "";
          const country = addr.country || "";
          
          if (city && country) return `${city}, ${country}`;
          return item.display_name.split(",").slice(0, 2).join(", "); // Fallback to first two segments
        });
        
        // Filter out unique values
        setSuggestions(Array.from(new Set(results)));
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (showSuggestions) fetchPlaces();
    }, 500);

    return () => clearTimeout(timer);
  }, [location, showSuggestions]);

  const [skills, setSkills] = React.useState(["React", "TypeScript", "Next.js", "Solidity", "Tailwind"]);
  const [newSkill, setNewSkill] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
      setIsAdding(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl space-y-12">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900">Manage Profile</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Control your digital presence and connected identities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Main Form */}
          <div className="lg:col-span-2 space-y-10">

            {/* General Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">Personal Identity</h2>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="displayName" className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Display Name</Label>
                  <Input id="displayName" defaultValue="Kadin Vaccaro" className={inputStyles} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location" className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-zinc-400 pointer-events-none" />
                    <Input 
                      id="location" 
                      value={location} 
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className={`${inputStyles} pl-12`} 
                      placeholder="Enter your location..."
                    />
                    
                    {showSuggestions && (suggestions.length > 0 || isLoading) && (
                      <div className="absolute top-full left-0 w-full bg-white border border-zinc-900 z-50 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200">
                        {isLoading ? (
                          <div className="px-12 py-4 font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-400 italic">
                            Scanning global nodes...
                          </div>
                        ) : (
                          suggestions.map((loc) => (
                            <button
                              key={loc}
                              onClick={() => {
                                setLocation(loc);
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-12 py-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600 hover:bg-zinc-950 hover:text-white transition-colors border-b border-zinc-100 last:border-0"
                            >
                              {loc}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio" className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Short Biography</Label>
                  <textarea
                    id="bio"
                    placeholder="Tell the community who you are..."
                    className={textareaStyles}
                  />
                </div>
              </div>
            </section>

            <Separator className="bg-zinc-100" />

            {/* Social Links */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">Connected Hubs</h2>
              </div>

              <div className="grid gap-4">
                <div className="relative">
                  <FaGithub className="absolute left-4 top-4 w-4 h-4 text-zinc-400" />
                  <Input placeholder="github.com/username" className={`${inputStyles} pl-12`} />
                </div>
                <div className="relative">
                  <FaLinkedin className="absolute left-4 top-4 w-4 h-4 text-zinc-400" />
                  <Input placeholder="linkedin.com/in/username" className={`${inputStyles} pl-12`} />
                </div>
                <div className="relative">
                  <FaXTwitter className="absolute left-4 top-4 w-4 h-4 text-zinc-400" />
                  <Input placeholder="x.com/username" className={`${inputStyles} pl-12`} />
                </div>
              </div>
            </section>

            <Separator className="bg-zinc-100" />

            {/* Skills / Tags */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">Skillset & Expertise</h2>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="px-3 h-8 bg-zinc-50 border border-zinc-200 font-mono text-[9px] uppercase tracking-widest text-zinc-600 flex items-center gap-2 group animate-in fade-in zoom-in duration-200">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-500 font-black transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {isAdding ? (
                    <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                      <input
                        autoFocus
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addSkill();
                          if (e.key === 'Escape') setIsAdding(false);
                        }}
                        className="h-8 w-32 border border-zinc-900 bg-white px-2 font-mono text-[9px] uppercase outline-none"
                        placeholder="Type skill..."
                      />
                      <button onClick={addSkill} className="h-8 w-8 bg-black text-white flex items-center justify-center hover:bg-zinc-800">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAdding(true)}
                      className="px-3 h-8 border border-dashed border-zinc-300 font-mono text-[9px] uppercase tracking-widest text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3" /> Add Skill
                    </button>
                  )}
                </div>
              </div>
            </section>

            <div className="pt-6">
              <Button className="h-14 px-12 rounded-none bg-black text-white font-sans font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all flex items-center gap-3 group shadow-lg shadow-black/5">
                Save All Changes <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Right: Media & Status */}
          <div className="space-y-8">
            {/* Backdrop Area */}
            <div className="bg-white border border-zinc-200 overflow-hidden group">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold p-6 border-b border-zinc-100">Profile Backdrop</div>
              <div className="aspect-[21/9] bg-zinc-100 relative group/banner overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop" 
                  alt="Backdrop" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="px-6 py-2 bg-white text-black font-mono text-[9px] uppercase tracking-widest font-black shadow-xl hover:bg-zinc-100 transition-all flex items-center gap-2">
                      <Camera className="w-3 h-3" /> Update Backdrop
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white border border-zinc-200 space-y-6">
               <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-4">Identity Display</div>
               
               <div className="relative group w-32 h-32 mx-auto">
                 <div className="w-full h-full rounded-full overflow-hidden border-2 border-zinc-100 group-hover:border-zinc-900 transition-all">
                   <img 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                   />
                 </div>
                 <button className="absolute bottom-1 right-1 w-12 h-12 bg-black text-white flex items-center justify-center rounded-full border-4 border-white hover:scale-110 transition-transform shadow-xl">
                   <Camera className="w-5 h-5" />
                 </button>
               </div>

               <p className="text-center font-mono text-[9px] uppercase tracking-widest text-zinc-400 px-4">
                 Upload a square image. Recommended size: 400x400px.
               </p>
            </div>

            <div className="p-10 bg-zinc-950 text-white space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Public Profile</span>
              </div>
              <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                Changes made here will be visible across the Codetopia ecosystem once saved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
