# Portal Web

Next.js frontend for the Codetopia Community Portal — a membership and operations platform for a mentorship-driven, multi-discipline tech community based in Ghana.

The portal replaces scattered manual processes across WhatsApp, Discord, and spreadsheets with a single structured system that manages the full member lifecycle — from signup to verification to active participation.

Members self-register, complete a structured onboarding journey, and get verified by the Community Manager before gaining full access. Once verified, they are automatically added to the Codetopia Discord server via Vector, Codetopia's custom bot.

The platform serves two distinct audiences. Members use it to manage their community journey — tracking onboarding progress, viewing programs, and managing their profile. The Core Team uses it to manage membership operations — reviewing onboarding pipelines, verifying members, managing roles and permissions, and monitoring community health in real time.

## Stack

- [Next.js 16](https://nextjs.org/) (Turbopack)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Biome](https://biomejs.dev/) for linting and formatting
- TypeScript

## Setup

```bash
pnpm install
cp .env.example .env  # fill in your values
pnpm dev
```

## Scripts

```bash
pnpm dev        # start development server
pnpm build      # production build
pnpm start      # start production server
pnpm lint       # lint
pnpm lint:fix   # lint and auto-fix
pnpm format     # format
```
