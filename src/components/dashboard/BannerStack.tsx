"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { SystemBanner } from "./Navbar";
import { usePathname } from "next/navigation";

export function BannerStack() {
    const pathname = usePathname();
    const banners = useNotifications();

    if (pathname === "/notifications") return null;
    if (banners.length === 0) return null;

    const primary = banners[0];
    const restCount = banners.length - 1;

    return (
        <div>
            {/* Primary banner — always visible */}
            <div className="relative">
                <SystemBanner
                    variant={primary.variant}
                    icon={primary.icon}
                    label={primary.label}
                    body={primary.body}
                    ctaLabel={primary.ctaLabel}
                    ctaHref={primary.ctaHref}
                    moreCount={restCount}
                />
            </div>
        </div>
    );
}
