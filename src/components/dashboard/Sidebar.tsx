"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
import { useMyInvites } from "@/hooks/useTeams";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const canAccessAdmin = usePermission("admin.panel.access");

  const menuGroups = getDashboardMenuGroups(canAccessAdmin);
  const { data: myInvites } = useMyInvites();
  const pendingInviteCount = myInvites?.filter((i) => i.status === "pending").length ?? 0;

  function isActive(activePrefix: string, href: string) {
    if (activePrefix === "/") return pathname === "/";
    if (href === "/admin" && pathname !== "/admin") return false;
    return pathname.startsWith(activePrefix);
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
        {menuGroups.map((group) => {
          const isGroupCollapsed = collapsedGroups.has(group.label);
          return (
            <SidebarGroup key={group.label} className="mb-8 p-0">
              <SidebarGroupLabel asChild className="px-2 mb-1 h-auto">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between font-mono text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {group.label}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 shrink-0 transition-transform duration-150",
                      isGroupCollapsed && "-rotate-90"
                    )}
                  />
                </button>
              </SidebarGroupLabel>
              {!isGroupCollapsed && (
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0">
                    {group.items.map((item) => {
                      const active = isActive(item.activePrefix, item.href);
                      return (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton
                            asChild
                            tooltip={item.comingSoon ? `${item.label} (Coming Soon)` : item.label}
                            isActive={active}
                            className={
                              item.comingSoon
                                ? "h-9 rounded-none text-zinc-600 hover:text-zinc-400 hover:bg-transparent"
                                : itemClass(active)
                            }
                          >
                            <Link href={item.href} className="flex items-center gap-3 px-3">
                              <item.icon
                                className={
                                  item.comingSoon
                                    ? "w-4 h-4 shrink-0 text-zinc-700"
                                    : iconClass(active)
                                }
                              />
                              <span className="font-mono text-sm font-medium">{item.label}</span>
                              {item.comingSoon && (
                                <span className="ml-auto font-mono text-[8px] uppercase tracking-wider text-zinc-600 border border-zinc-800 px-1 py-0.5">
                                  Soon
                                </span>
                              )}
                              {item.href === "/teams" && pendingInviteCount > 0 && (
                                <span className="ml-auto flex h-4 min-w-4 items-center justify-center bg-white text-black font-mono text-[9px] font-bold px-1">
                                  {pendingInviteCount > 9 ? "9+" : pendingInviteCount}
                                </span>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
