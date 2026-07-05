import { UserX } from "lucide-react";
import Link from "next/link";
import { PublicProfileFooter } from "@/components/profile/PublicProfileFooter";
import { PublicProfileHeader } from "@/components/profile/PublicProfileHeader";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950">
      <PublicProfileHeader />
      <main className="flex flex-1 items-center justify-center px-4 pt-16">
        <div className="w-full max-w-sm border border-zinc-200 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-zinc-200 bg-zinc-50">
            <UserX className="h-5 w-5 text-zinc-300" />
          </div>
          <p className="font-mono text-sm font-bold text-zinc-900">This profile isn't available</p>
          <p className="mt-1 max-w-xs mx-auto font-mono text-sm text-zinc-500">
            It may not exist, or the member hasn't finished setting up their account yet.
          </p>
          <Link
            href="/community"
            className="mt-6 inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
          >
            Back to Community
          </Link>
        </div>
      </main>
      <PublicProfileFooter />
    </div>
  );
}
