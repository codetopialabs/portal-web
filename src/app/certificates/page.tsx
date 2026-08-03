"use client";

import { Download, ExternalLink, Loader2, ScrollText, ShieldOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyCertificates } from "@/hooks/useCertificates";
import { getCertificateVerifyUrl } from "@/lib/utils";
import type { MyCertificate } from "@/types/certificates.types";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(iso)
  );
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "certificate"
  );
}

function extensionFromUrl(url: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(url);
  return match ? match[1] : "png";
}

// A plain <a download href="https://cloudinary.../..."> is silently ignored
// by browsers for cross-origin URLs -- the file just opens/displays instead
// of saving. Fetching it as a blob first and downloading from an object URL
// (same-origin) is what actually forces a save-to-disk.
async function downloadCertificate(url: string, filename: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Download failed.");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    toast.error("Couldn't download directly — opening it instead, save it from there.");
    window.open(url, "_blank", "noreferrer");
  }
}

function DownloadButton({ certificate }: { certificate: MyCertificate }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const filename = `${slugify(certificate.title)}-${certificate.verificationCode}.${extensionFromUrl(certificate.artworkUrl)}`;
      await downloadCertificate(certificate.artworkUrl, filename);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-700 hover:text-zinc-950 disabled:opacity-50"
    >
      {downloading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Download className="h-3 w-3" />
      )}
      {downloading ? "Downloading…" : "Download"}
    </button>
  );
}

function CertificateCard({ certificate }: { certificate: MyCertificate }) {
  const isRevoked = certificate.status === "revoked";

  return (
    <article
      className={`border bg-white p-5 transition-all ${isRevoked ? "border-zinc-200 opacity-60" : "border-zinc-200 hover:border-zinc-950"}`}
    >
      <div className="flex h-36 items-center justify-center overflow-hidden border border-dashed border-zinc-200 bg-zinc-50">
        {certificate.artworkUrl ? (
          // biome-ignore lint/performance/noImgElement: remote Cloudinary artwork
          <img src={certificate.artworkUrl} alt="" className="h-full w-full object-contain p-2" />
        ) : (
          <ScrollText className="h-10 w-10 text-zinc-200" />
        )}
      </div>

      <div className="mt-4">
        <span
          className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest ${
            isRevoked
              ? "border-zinc-300 bg-zinc-100 text-zinc-500"
              : "border-zinc-900 bg-zinc-900 text-white"
          }`}
        >
          {isRevoked && <ShieldOff className="h-2.5 w-2.5" />}
          {isRevoked ? "Revoked" : certificate.certificateType}
        </span>
        <h2 className="mt-2 font-sans text-base font-black text-zinc-950">{certificate.title}</h2>
        <p className="mt-1 font-mono text-[10px] text-zinc-400">
          Issued {formatDate(certificate.issuedDate)}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-zinc-100 pt-3">
        {!isRevoked && certificate.artworkUrl && <DownloadButton certificate={certificate} />}
        <a
          href={getCertificateVerifyUrl(certificate.verificationCode)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 hover:text-zinc-700"
        >
          <ExternalLink className="h-3 w-3" />
          Public verification
        </a>
      </div>
    </article>
  );
}

function CertificatesContent() {
  const { data: certificates = [], isLoading } = useMyCertificates();

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <header className="border-b border-zinc-200 pb-7">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Your record
          </p>
          <h1 className="mt-5 font-sans text-3xl font-black uppercase tracking-widest sm:text-4xl">
            Certificates
          </h1>
          <p className="mt-3 max-w-xl font-mono text-xs leading-6 text-zinc-500">
            Every certificate issued to you, ready to download.
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-72 rounded-none" />
            ))}
          </div>
        ) : certificates.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-zinc-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center bg-zinc-50 text-zinc-500">
              <ScrollText className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-black text-zinc-950">Nothing here yet</h2>
            <p className="mx-auto mt-2 max-w-sm font-mono text-xs leading-6 text-zinc-500">
              Certificates issued to you will show up here as soon as they're published.
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function CertificatesPage() {
  return (
    <RouteGuard permission="authenticated">
      <CertificatesContent />
    </RouteGuard>
  );
}
