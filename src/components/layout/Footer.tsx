import Link from "next/link";

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full flex flex-col md:flex-row items-center justify-between px-8 py-8 z-10 text-[10px] tracking-[0.15em] text-zinc-500 uppercase">
      <span>© {currentYear} Codetopia. All rights reserved.</span>
      <div className="flex items-center gap-8 mt-4 md:mt-0 font-bold">
        {footerLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="hover:text-white transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
