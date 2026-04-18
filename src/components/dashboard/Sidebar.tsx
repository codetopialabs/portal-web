"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Shield,
  Key,
  Globe,
  History,
  Settings,
  LogOut,
  AppWindow,
  CreditCard,
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
      { icon: Key, label: "Credentials", href: "/credentials" },
      { icon: AppWindow, label: "Authorized Apps", href: "/apps" },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: History, label: "Activity Log", href: "/activity" },
      { icon: Settings, label: "Preferences", href: "/settings" },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-white">
      {/* Logo */}
      <SidebarHeader className="px-5 pt-6 pb-4">
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
              className="h-full w-auto object-contain object-left grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-3 py-2 no-scrollbar">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label} className="mb-2 p-0">
            {!isCollapsed && (
              <SidebarGroupLabel className="px-2 mb-1 h-auto font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">
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
                            ? "!bg-white !text-zinc-900 border border-zinc-200 shadow-sm hover:!bg-white hover:!text-zinc-900 data-[active=true]:!bg-white data-[active=true]:!text-zinc-900"
                            : "text-zinc-500 hover:text-zinc-900 hover:!bg-white hover:border hover:border-zinc-200"
                        )}
                      >
                        <Link href={item.href} className="flex items-center gap-3 px-3">
                          <item.icon
                            className={cn(
                              "w-4 h-4 shrink-0",
                              isActive ? "text-zinc-900" : "text-zinc-400"
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
      <SidebarFooter className="p-3">


        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Log out"
              className="h-9 rounded-none text-zinc-500 hover:text-zinc-900 hover:bg-white/60 transition-colors justify-center gap-2"
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
