"use client";

import { BookOpen, Globe, Home, Library, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuGroups = [
  {
    label: "Discover",
    items: [
      { icon: Home, label: "Dashboard", href: "/", activePrefix: "/" },
      { icon: Globe, label: "Community", href: "/community", activePrefix: "/community" },
    ],
  },
  {
    label: "My Space",
    items: [
      { icon: BookOpen, label: "Programs", href: "/programs", activePrefix: "/programs" },
      { icon: Users, label: "Mentorship", href: "/mentorship", activePrefix: "/mentorship" },
      { icon: Library, label: "Resources", href: "/resources", activePrefix: "/resources" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: Settings, label: "Settings", href: "/settings", activePrefix: "/settings" },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  function isActive(activePrefix: string) {
    return activePrefix === "/" ? pathname === "/" : pathname.startsWith(activePrefix);
  }

  function itemClass(active: boolean) {
    return cn(
      "h-9 rounded-none transition-all duration-150",
      active
        ? "!bg-white !text-black shadow-sm"
        : "text-white hover:text-white hover:bg-zinc-900"
    );
  }

  function iconClass(active: boolean) {
    return cn("w-4 h-4 shrink-0", active ? "text-black" : "text-zinc-500");
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-900 bg-black text-white">
      {/* Logo */}
      <SidebarHeader className="px-5 pt-6 pb-4 bg-black">
        <Link href="/" className="flex items-center overflow-hidden">
          <div
            className={cn(
              "relative transition-all duration-300 shrink-0",
              isCollapsed ? "w-7 h-7" : "w-40 h-7"
            )}
          >
            <img
              src="/logos/codetopia-community.png"
              alt="Codetopia Community"
              className="h-full w-auto object-contain object-left grayscale invert brightness-0 hover:grayscale-0 transition-all duration-300"
            />
          </div>
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-3 py-6 no-scrollbar bg-black">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label} className="mb-8 p-0">
            <SidebarGroupLabel className="px-2 mb-1 h-auto font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {group.items.map((item) => {
                  const active = isActive(item.activePrefix);
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={active}
                        className={itemClass(active)}
                      >
                        <Link href={item.href} className="flex items-center gap-3 px-3">
                          <item.icon className={iconClass(active)} />
                          <span className="font-mono text-[11px] uppercase tracking-wider">
                            {item.label}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
