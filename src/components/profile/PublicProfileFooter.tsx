import Image from "next/image";
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
  { icon: FaXTwitter, href: "https://x.com/codetopiacomm", label: "X" },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/codetopiacommunity/",
    label: "Instagram",
  },
  { icon: FaThreads, href: "https://www.threads.com/@codetopiacommunity", label: "Threads" },
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
// On a profile, phones and tablets have the section bar fixed along the
// bottom, so the footer leaves room for it there.
export function PublicProfileFooter({ aboveBottomBar = false }: { aboveBottomBar?: boolean }) {
  return (
    <footer className={`w-full bg-black text-white ${aboveBottomBar ? "pb-16 lg:pb-0" : ""}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={COMMUNITY_SITE_URL}
            className="inline-block"
          >
            <Image
              src="/logos/community-logo-white.png"
              alt="Codetopia Community"
              width={773}
              height={156}
              unoptimized
              className="h-7 w-auto"
            />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <p className="max-w-sm font-mono text-sm leading-relaxed text-zinc-400">
            An open community where people in tech do real work together. Based in Ghana, open to
            the world.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-6 gap-y-3 font-sans text-sm sm:flex sm:flex-wrap">
          {footerLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              // The email is the longest; on phones it takes a row of its own.
              className={`text-zinc-400 transition-colors hover:text-white ${href.startsWith("mailto:") ? "col-span-2" : ""}`}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Each icon gets a finger-sized target; the row is pulled back so the
            first icon still lines up with the text above. */}
        <div className="-mx-2.5 flex flex-wrap">
          {socialIcons.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              className="p-2.5 text-zinc-500 transition-colors hover:text-white"
            >
              <social.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <p suppressHydrationWarning className="font-sans text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Codetopia Community. A{" "}
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
