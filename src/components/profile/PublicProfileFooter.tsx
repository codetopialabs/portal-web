import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaBluesky, FaThreads, FaXTwitter } from "react-icons/fa6";

export function PublicProfileFooter() {
  const communityLinks = [
    { label: "Code of Conduct", href: "#" },
    { label: "Become a Sponsor", href: "#" },
    { label: "Become a Volunteer", href: "#" },
    { label: "Join Our Discord Server", href: "https://discord.gg/3nBFMfdNmB" },
    {
      label: "Join Our WhatsApp Community",
      href: "https://chat.whatsapp.com/LiiirOwOnPz0XQ3vupioi9",
    },
  ];

  const socialLinks = [
    { href: "https://discord.gg/3nBFMfdNmB", Icon: FaDiscord },
    { href: "https://www.youtube.com/channel/UCJqs2xW7x-cs1V0bRG7ucXg", Icon: FaYoutube },
    { href: "https://gh.linkedin.com/company/codetopia-community", Icon: FaLinkedinIn },
    { href: "https://twitter.com/codetopiacom", Icon: FaXTwitter },
    { href: "#", Icon: FaBluesky },
    { href: "#", Icon: FaThreads },
    { href: "https://www.tiktok.com/@codetopiacommunity", Icon: FaTiktok },
  ];

  const aboutLinks = [
    { label: "About Us", href: "#" },
    { label: "Events", href: "#" },
    { label: "Articles", href: "#" },
    { label: "Gallery", href: "#" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookies Policy", href: "#" },
  ];

  return (
    <footer className="relative w-full min-h-[400px] md:min-h-[344px] text-zinc-400 font-sans">
      <Image
        src="/codetopia-bg.jpg"
        alt="Codetopia background"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-zinc-950/80" />

      <div className="relative z-10 max-lg:px-4 py-12 md:py-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 xl:flex flex-wrap xl:justify-between">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              <Image
                width={150}
                height={72}
                src="/codetopia-logo.png"
                alt="Codetopia logo"
                className="brightness-0 invert"
              />
            </div>

            <p className="text-sm mb-6 text-zinc-400">A utopia for tech enthusiasts</p>

            <div className="flex flex-wrap gap-6 text-white">
              {socialLinks.map(({ href, Icon }, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static social links
                <Link key={index} href={href} target="_blank" rel="noreferrer">
                  <Icon className="w-5 h-5 hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Community</h3>
            <ul className="space-y-3 text-sm">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-zinc-500" />
                <Link
                  href="mailto:hello@codetopia.com"
                  className="hover:text-emerald-400 transition-colors"
                >
                  hello@codetopia.com
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-zinc-500" />
                <span>123 Tech Street, Innovation District</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span>(233) 55 555 5555</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-400">
          <p>&copy; 2020 - {new Date().getFullYear()} Codetopia Community</p>

          <div className="flex gap-6 mt-4 md:mt-0">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-emerald-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
