"use client";

import { ArrowRight, Bell } from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/Shell";
import { useNotifications } from "@/hooks/useNotifications";
import type { BannerVariant } from "@/components/dashboard/Navbar";

type Tab = "all" | "alert" | "warning" | "info";

export default function NotificationsPage() {
    const allBanners = useNotifications();
    const [activeTab, setActiveTab] = useState<Tab>("all");

    const counts = {
        all: allBanners.length,
        alert: allBanners.filter(b => b.variant === "alert").length,
        warning: allBanners.filter(b => b.variant === "warning").length,
        info: allBanners.filter(b => b.variant === "info").length,
    };

    const banners = allBanners.filter(b => activeTab === "all" || b.variant === activeTab);

    return (
        <DashboardShell>
            <div className="w-full max-w-none space-y-6 pb-20">
                <div className="flex flex-col gap-4 pb-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="font-mono text-xs font-medium text-zinc-400">Action items</p>
                        <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight text-zinc-950">
                            Notifications
                        </h1>
                        <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-zinc-500">
                            Review pending tasks and important account updates that require your attention.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-6 mb-6">
                    {(["all", "alert", "warning", "info"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-medium border ${
                                activeTab === tab
                                    ? "bg-zinc-900 text-white border-zinc-900"
                                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                            }`}
                        >
                            <span className="capitalize">{tab}</span>
                            <span className={`px-1.5 py-0.5 text-[10px] ${
                                activeTab === tab ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-500"
                            }`}>
                                {counts[tab]}
                            </span>
                        </button>
                    ))}
                </div>

                {banners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-300 bg-zinc-50/50">
                        <div className="w-12 h-12 border border-zinc-200 bg-white flex items-center justify-center mb-4">
                            <Bell className="w-5 h-5 text-zinc-300" />
                        </div>
                        <p className="font-mono text-sm text-zinc-500">
                            {activeTab === "all" ? "You're all caught up!" : `No ${activeTab} notifications.`}
                        </p>
                    </div>
                ) : (
                    <div className="relative pl-4 sm:pl-8">
                        {/* Vertical timeline dashed line */}
                        <div className="absolute left-[35px] sm:left-[51px] top-6 bottom-6 w-px border-l border-dashed border-zinc-200" />
                        
                        <div className="space-y-8">
                            {banners.map((banner) => {
                                const Icon = banner.icon;
                                let iconColorClasses = "";
                                let buttonStyles = "";
                                
                                if (banner.variant === "alert") {
                                    iconColorClasses = "bg-red-50 border-red-500 text-red-600";
                                    buttonStyles = "bg-red-600 text-white hover:bg-red-700";
                                } else if (banner.variant === "warning") {
                                    iconColorClasses = "bg-amber-50 border-amber-500 text-amber-600";
                                    buttonStyles = "bg-amber-500 text-white hover:bg-amber-600";
                                } else {
                                    iconColorClasses = "bg-zinc-50 border-zinc-400 text-zinc-600";
                                    buttonStyles = "bg-zinc-800 text-white hover:bg-zinc-900";
                                }

                                return (
                                    <div key={banner.id} className="relative flex items-start gap-4 sm:gap-6">
                                        <div className={`relative z-10 w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${iconColorClasses}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-2.5">
                                            <h3 className="font-sans font-semibold text-sm text-zinc-900 leading-tight">
                                                {banner.label}
                                            </h3>
                                            
                                            {(banner.body || (banner.ctaLabel && banner.ctaHref)) && (
                                                <div className="mt-3 bg-white border border-dashed border-zinc-200 p-4">
                                                    {banner.body && (
                                                        <p className="font-mono text-xs text-zinc-600 leading-relaxed">
                                                            {banner.body}
                                                        </p>
                                                    )}
                                                    
                                                    {banner.ctaLabel && banner.ctaHref && (
                                                        <Link
                                                            href={banner.ctaHref}
                                                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 mt-3 font-mono text-xs font-semibold ${buttonStyles}`}
                                                        >
                                                            {banner.ctaLabel}
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}
