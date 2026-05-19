"use client";

import Image from "next/image";
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
import { getDashboardMenuGroups } from "@/data/navigation";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const canAccessAdmin = usePermission("admin.panel.access");

  const menuGroups = getDashboardMenuGroups(canAccessAdmin);

  function isActive(activePrefix: string) {
    return activePrefix === "/" ? pathname === "/" : pathname.startsWith(activePrefix);
  }

  function itemClass(active: boolean) {
    return cn(
      "h-9 rounded-none transition-all duration-150",
      active ? "!bg-white !text-black shadow-sm" : "text-white hover:text-white hover:bg-zinc-900"
    );
  }

  function iconClass(active: boolean) {
    return cn("w-4 h-4 shrink-0", active ? "text-black" : "text-zinc-500");
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-zinc-900 bg-black text-white">
      {/* Logo */}
      <SidebarHeader className="px-5 pt-8 pb-6 bg-black">
        <Link href="/" className="flex items-center overflow-hidden">
          <div
            className={cn(
              "relative transition-all duration-500 shrink-0",
              isCollapsed ? "w-8 h-8" : "w-44 h-12"
            )}
          >
            <Image
              src="/logos/codetopia-community.png"
              alt="Codetopia Community"
              fill
              sizes="(max-width: 768px) 32px, 176px"
              className="object-contain transition-all duration-500 brightness-0 invert"
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
