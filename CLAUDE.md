# PagePulse

Web page change monitoring tool. Track any webpage for visual changes.

## Design Language

### Philosophy
Brutalist, typographic, minimal. Same design system as lawn — bold and direct, like a poster.

### Colors
- **Background**: `#f0f0e8` (warm cream)
- **Text**: `#1a1a1a` (near-black)
- **Muted text**: `#888888`
- **Primary accent**: `#2d5a2d` (deep forest green)
- **Accent hover**: `#3a6a3a`
- **Highlight**: `#7cb87c` (soft green for emphasis)
- **Borders**: `#1a1a1a` (strong) or `#ccc` (subtle)
- **Inverted sections**: `#1a1a1a` background with `#f0f0e8` text

### Typography
- **Headings**: Font-black (900 weight), tight tracking
- **Body**: Geist Mono for everything
- **Size contrast**: Massive headlines with small supporting text

### Borders & Spacing
- Strong 2px borders in `#1a1a1a`
- Shadow offset: `shadow-[8px_8px_0px_0px]` on cards
- Generous padding (p-6 to p-8)

### Do's
- Use bold typography to create hierarchy
- Embrace whitespace
- Keep interactions obvious and direct
- Use green sparingly as accent

### Don'ts
- No gradients or shadows (except brutalist offset shadows)
- No rounded corners
- No decorative icons
- Don't hide information behind hover states

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
