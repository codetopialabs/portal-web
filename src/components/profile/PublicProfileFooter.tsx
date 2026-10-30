import Image from "next/image";
import Link from "next/link";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaMastodon,
  FaThreads,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { SiBluesky } from "react-icons/si";

const COMMUNITY_SITE_URL = "https://community.codetopia.org";

const socialIcons = [
  { icon: FaYoutube, href: "https://www.youtube.com/@codetopiacommunity", label: "YouTube" },
  {
    icon: FaLinkedinIn,
    href: "https://www.linkedin.com/company/codetopiacommunity",
    label: "LinkedIn",
  },
  { icon: FaXTwitter, href: "https://x.com/codetopiacom", label: "X" },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/codetopiacommunity/",
    label: "Instagram",
  },
  { icon: FaThreads, href: "http://www.threads.com/codetopiacommunity/", label: "Threads" },
  { icon: FaTiktok, href: "https://www.tiktok.com/@codetopiacommunity", label: "TikTok" },
  {
    icon: SiBluesky,
    href: "https://bsky.app/profile/codetopiacommunity.bsky.social",
    label: "Bluesky",
  },
  { icon: FaMastodon, href: "https://mastodon.social/@codetopiacommunity", label: "Mastodon" },
  {
    icon: FaWhatsapp,
    href: "https://whatsapp.com/channel/0029VaFHtkR8KMqpEVu24v2o",
    label: "WhatsApp",
  },
  { icon: FaGithub, href: "https://github.com/codetopiacommunity", label: "GitHub" },
];

const footerLinks = [
  { label: "Community site", href: COMMUNITY_SITE_URL },
  { label: "Code of conduct", href: `${COMMUNITY_SITE_URL}/code-of-conduct` },
  { label: "Privacy", href: `${COMMUNITY_SITE_URL}/privacy` },
  { label: "hello@codetopia.org", href: "mailto:hello@codetopia.org" },
];

// Slim on purpose: the profile is the page, the footer only says whose
// community this is and where to go next.
export function PublicProfileFooter() {
  return (
    <footer className="w-full bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4">
          <Link href="/" className="inline-block">
            <Image
              src="/logos/codetopia-community.png"
              alt="Codetopia Community"
              width={128}
              height={32}
              className="h-7 w-auto object-contain brightness-0 invert"
            />
          </Link>
          <p className="max-w-sm font-mono text-sm leading-relaxed text-zinc-400">
            An open community where people in tech do real work together. Based in Ghana, open to
            the world.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-sm">
          {footerLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              className="text-zinc-400 transition-colors hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap gap-4">
          {socialIcons.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="text-zinc-500 transition-colors hover:text-white"
            >
              <social.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <p suppressHydrationWarning className="font-mono text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Codetopia. A{" "}
          <a
            href="https://codetopia.org"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            Codetopia
          </a>{" "}
          initiative.
        </p>
      </div>
    </footer>
  );
}
