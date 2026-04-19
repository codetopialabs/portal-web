"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Shield,
  Globe,
  History,
  LogOut,
  AppWindow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useLogoutMutation } from "@/hooks/useAuthMutations";

const menuGroups = [
  {
    label: "General",
    items: [
      { icon: Home, label: "Dashboard", href: "/" },
      { icon: Globe, label: "Community", href: "/community" },
    ],
  },
  {
    label: "My Identity",
    items: [
      { icon: User, label: "Profile", href: "/profile" },
      { icon: Shield, label: "Security", href: "/security" },
      { icon: AppWindow, label: "Authorized Apps", href: "/apps" },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: History, label: "Activity Log", href: "/activity" },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const logout = useLogoutMutation();

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
          <SidebarGroup key={group.label} className="mb-10 p-0">
            {!isCollapsed && (
              <SidebarGroupLabel className="px-2 mb-1 h-auto font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-bold">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActive}
                        className={cn(
                          "h-9 rounded-none transition-all duration-150",
                          isActive
                            ? "!bg-white !text-black shadow-sm"
                            : "text-white hover:text-white hover:bg-zinc-900"
                        )}
                      >
                        <Link href={item.href} className="flex items-center gap-3 px-3">
                          <item.icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              isActive ? "text-black" : "text-zinc-500"
                            )}
                          />
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

      {/* Footer */}
      <SidebarFooter className="p-3 bg-black">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="h-9 rounded-none text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors justify-center gap-2"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold">
                  Disconnect
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
