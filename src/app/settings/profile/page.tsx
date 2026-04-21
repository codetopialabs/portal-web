"use client";

import { Camera, Cpu, Globe, MapPin, Plus, User, X } from "lucide-react";
import React from "react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inputStyles =
  "h-11 rounded-none border-zinc-200 bg-white px-3 font-mono text-sm placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-zinc-900 transition-all";

const labelStyles = "font-mono text-xs uppercase tracking-widest text-zinc-400 font-bold";

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 bg-black text-white flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h2 className="font-sans font-black uppercase text-base tracking-widest text-zinc-900">
        {title}
      </h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-zinc-100" />;
}

export default function SettingsProfilePage() {
  const [location, setLocation] = React.useState("Toronto, Ontario, Canada");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [isLoadingLoc, setIsLoadingLoc] = React.useState(false);

  React.useEffect(() => {
    if (location.length < 3 || !showSuggestions) {
      setSuggestions([]);
      return;
    }
    setIsLoadingLoc(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&addressdetails=1&limit=5`
        );
        const data = await res.json();
        const results: string[] = Array.from(
          new Set(
            // biome-ignore lint/suspicious/noExplicitAny: nominatim API response
            data.map((item: any) => {
              const addr = item.address;
              const city = addr.city || addr.town || addr.village || addr.suburb || "";
              const country = addr.country || "";
              return city && country
                ? `${city}, ${country}`
                : item.display_name.split(",").slice(0, 2).join(", ");
            })
          )
        );
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoadingLoc(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [location, showSuggestions]);

  const [skills, setSkills] = React.useState([
    "React",
    "TypeScript",
    "Next.js",
    "Solidity",
    "Tailwind",
  ]);
  const [newSkill, setNewSkill] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);

  function addSkill() {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
    setNewSkill("");
    setIsAdding(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* LEFT — avatar + backdrop */}
      <div className="space-y-6">
        {/* Avatar */}
        <div className="bg-white border border-zinc-200 p-6 flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-zinc-200">
              {/* biome-ignore lint/performance/noImgElement: placeholder image */}
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="text-center">
            <p className="font-mono font-black text-base uppercase tracking-tight text-zinc-900">
              Kadin Vaccaro
            </p>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">kadin.v@codetopia.com</p>
          </div>
          <button
            type="button"
            className="w-full h-9 border border-zinc-200 font-mono text-xs uppercase tracking-widest text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-3.5 h-3.5" /> Change Photo
          </button>
        </div>

        {/* Backdrop */}
        <div className="bg-white border border-zinc-200 overflow-hidden">
          <div className="aspect-video relative group">
            {/* biome-ignore lint/performance/noImgElement: placeholder image */}
            <img
              src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop"
              alt="Backdrop"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                className="font-mono text-xs uppercase tracking-widest text-white border border-white px-4 py-2 hover:bg-white hover:text-black transition-all flex items-center gap-2"
              >
                <Camera className="w-3 h-3" /> Update
              </button>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-zinc-100">
            <p className="font-mono text-xs text-zinc-400">Profile Backdrop</p>
          </div>
        </div>

        {/* Public profile note */}
        <div className="p-4 bg-zinc-50 border border-zinc-200">
          <p className="font-mono text-xs text-zinc-500 leading-relaxed">
            Changes are visible across the Codetopia ecosystem once saved.
          </p>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="lg:col-span-2 space-y-8">
        {/* Personal Info */}
        <section className="space-y-5">
          <SectionHeader icon={User} title="Personal Info" />
          <div className="bg-white border border-zinc-200 p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className={labelStyles}>Display Name</Label>
                <Input defaultValue="Kadin Vaccaro" className={inputStyles} />
              </div>
              <div className="space-y-2">
                <Label className={labelStyles}>Username</Label>
                <Input defaultValue="kadin.v" className={inputStyles} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={labelStyles}>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <Input
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className={`${inputStyles} pl-9`}
                  placeholder="City, Country"
                />
                {showSuggestions && (suggestions.length > 0 || isLoadingLoc) && (
                  <div className="absolute top-full left-0 w-full bg-white border border-zinc-200 border-t-0 z-50 shadow-lg">
                    {isLoadingLoc ? (
                      <div className="px-4 py-3 font-mono text-xs uppercase tracking-widest text-zinc-400">
                        Searching...
                      </div>
                    ) : (
                      suggestions.map((loc) => (
                        <button
                          type="button"
                          key={loc}
                          onClick={() => {
                            setLocation(loc);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
                        >
                          {loc}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className={labelStyles}>Bio</Label>
              <textarea
                placeholder="Tell the community who you are..."
                className="min-h-[100px] w-full rounded-none border border-zinc-200 bg-white px-3 py-2.5 font-mono text-sm placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-all resize-none"
              />
            </div>
          </div>
        </section>

        <Divider />

        {/* Social Links */}
        <section className="space-y-5">
          <SectionHeader icon={Globe} title="Social Links" />
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
            {[
              { icon: FaGithub, placeholder: "github.com/username" },
              { icon: FaLinkedin, placeholder: "linkedin.com/in/username" },
              { icon: FaXTwitter, placeholder: "x.com/username" },
            ].map(({ icon: Icon, placeholder }) => (
              <div key={placeholder} className="flex items-center gap-3 px-4">
                <Icon className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  placeholder={placeholder}
                  className="flex-1 h-11 bg-transparent font-mono text-sm placeholder:text-zinc-300 focus:outline-none text-zinc-900"
                />
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Skills */}
        <section className="space-y-5">
          <SectionHeader icon={Cpu} title="Skills" />
          <div className="bg-white border border-zinc-200 p-5">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 h-8 bg-zinc-50 border border-zinc-200 font-mono text-xs uppercase tracking-widest text-zinc-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
                    className="text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {isAdding ? (
                <div className="inline-flex items-center gap-1.5">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSkill();
                      if (e.key === "Escape") {
                        setIsAdding(false);
                        setNewSkill("");
                      }
                    }}
                    className="h-8 w-28 border border-zinc-900 bg-white px-2 font-mono text-xs uppercase tracking-widest outline-none"
                    placeholder="Skill..."
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="h-8 w-8 bg-black text-white flex items-center justify-center hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 px-3 h-8 border border-dashed border-zinc-300 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:border-zinc-900 hover:text-zinc-900 transition-all"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            className="h-10 rounded-none border-zinc-200 font-mono text-xs uppercase tracking-widest px-6 hover:border-zinc-400"
          >
            Discard
          </Button>
          <Button className="h-10 rounded-none bg-black text-white font-mono text-xs uppercase tracking-widest px-6 hover:bg-zinc-800 transition-colors">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
