<!-- # Codetopia Design System Extraction Guide

This document provides a detailed breakdown of the styling, typography, colors, and interactive elements used in the Codetopia Community Website. Use these specifications to replicate the aesthetic in your new project.

## 1. Typography & Hierarchy
The site uses high-contrast typography, blending a bold sans-serif for impact with a technical monospaced font for details.

### Fonts
- **Primary Sans**: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
  - **Usage**: Headings, large display text, branding.
  - **Styles**: Typically `font-black` (900 weight), `uppercase`, with `tracking-tighter` (-0.05em).
- **Secondary Mono**: [Inter](https://fonts.google.com/specimen/Inter)
  - **Usage**: Body text, labels, metadata, technical descriptions.
  - **Styles**: `font-mono`, `font-medium`, often `uppercase` with `tracking-widest` (0.1em - 0.4em).

### Heading Styles (Next.js/Tailwind)
```tsx
// Large Hero/Section Heading
<h1 className="text-5xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter leading-none font-sans">
  Design System
</h1>

// Technical Subtitle
<p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em] font-black">
  Technical Specification v1.0
</p>
```

---

## 2. Color Palette (Primitive Tokens)
The design is strictly monochromatic with a focus on depth through greyscale levels.

| Token | Hex/Value | Usage |
| :--- | :--- | :--- |
| `grey-50` | `#f9fafb` | Light backgrounds / Dark text |
| `grey-900` | `#000000` | Dark backgrounds / Light text |
| `zinc-800` | `#27272a` | Primary borders & dividers |
| `zinc-900` | `#18181b` | Subtle section backgrounds |
| `success-500` | `#10b981` | Success states / Accents |
| `error-500` | `#ef4444` | Destructive actions |

### Semantic Mapping (Dark Mode)
- **Background**: `var(--grey-900)`
- **Foreground**: `var(--grey-50)`
- **Borders**: `var(--grey-800)`
- **Card/Popovers**: `var(--grey-800)`

---

## 3. UI Components Styling
The "premium" feel comes from sharp borders and minimalist layouts.

### The "Offset Border" Button (Signature Element)
The `CtaButton` uses a double-layer design that aligns on hover.

```tsx
// Structure
<div className="relative group">
  {/* Offset Border Layer */}
  <div className="absolute inset-0 border border-white translate-x-[4px] translate-y-[4px] group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
  
  {/* Main Button Layer */}
  <button className="relative z-10 h-16 px-10 bg-black text-white border border-white font-bold uppercase tracking-widest text-sm hover:bg-zinc-900 transition-colors">
    Explore More
  </button>
</div>
```

### Grids & Borders
- **Border Width**: `1px`
- **Border Color**: `zinc-800` (Dark) or `grey-200` (Light)
- **Grid Layouts**: Large 50/50 splits or asymmetric grids with clear border separation.

---

## 4. Animations & Micro-interactions
All animations are performant CSS-based transitions.

### Image Hover Effect
Images change from grayscale to color with a subtle zoom.
- **Classes**: `grayscale hover:grayscale-0 scale-100 hover:scale-[1.03] transition-all duration-1000`

### Link Hover Effect
Items typically involve a small transform or icon movement.
- **Arrow Icon**: `group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform`
- **Text Slide**: `lg:transform lg:-translate-x-1 lg:group-hover:translate-x-0 lg:transition-transform lg:duration-700`

---

## 5. Global CSS Foundation (Tailwind 4)
This is the core configuration to include in your `globals.css`.

```css
@theme {
  --font-sans: "Space Grotesk", sans-serif;
  --font-mono: "Inter", monospace;
  
  --color-background: #000000;
  --color-foreground: #ffffff;
  --color-border: #27272a;
  
  --radius-lg: 0.625rem;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

---

## 6. Layout Principles
- **Max Width**: Usually `max-w-screen-2xl` for content containers.
- **Padding**: Generous vertical spacing (`py-24` to `py-32`) to create a "gallery" feel.
- **Glassmorphism**: Limited use. Focus more on solid colors and sharp lines. -->
