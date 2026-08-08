# DESIGN.md — The Design System of the CBC Members Portal

> The binding design contract for this codebase. Adapted from the Jac/Jaseci
> brutalist engineering-document system for a Vite + React + Tailwind +
> shadcn/ui application. Tokens live in `src/index.css`; Tailwind mappings in
> `tailwind.config.ts`. **Every visual decision derives from this file.**

## 1. Thesis

The portal reads as a **stark, brutalist technical document**: hairline `1px`
rules, monospace uppercase labels, sharp corners everywhere (**zero** rounded
corners on the live UI), no soft shadows, no glassmorphism, no decorative
gradients, one orange. It looks like a spec sheet because the club is serious:
the design states receipts (counts, dates, points, statuses), not adjectives.

Two registers:
- **Engineering document** (default): paper, ink, hairlines, mono furniture.
- **Demo** (rare, earned): saturated color may appear only inside *live
  rendered proof* (e.g. the interactive 3D logo, QR codes, user-uploaded
  photos). Decoration must earn its color by being evidence.

## 2. Tokens (use ONLY these — never hardcode hex/rgb/named colors)

| Tailwind class | Light | Dark | Job |
|---|---|---|---|
| `bg-page` / `bg-background` | `#ffffff` | `#0f0f0f` | Paper |
| `text-foreground` / `bg-foreground` | `#000000` | `#ededed` | Ink |
| `border-border` | ink | ink | **Every hairline** (1px) |
| `text-muted-foreground` | `#595959` | `#a3a3a3` | Secondary text |
| `bg-primary` / `text-primary` / `border-primary` | `#ee5a24` | same | **The one orange** (identical in both themes) |
| `text-primary-foreground` / `text-on-primary` | white | white | Text on orange |
| `bg-secondary` / `bg-muted` | `#f5f5f5` | `#1f1f1f`/`#1a1a1a` | Quiet fills (rare — prefer paper + border) |
| `bg-destructive` | `#c8430f` | same | Danger (stays in the accent family) |
| `text-ink-soft` | `#1a1a1a` | `#d2d2d2` | Strong body copy |
| `text-grey-2` | `#8f8f8f` | same | Dim notes, code comments |
| `text-grey-3` / `border-grey-3` | `#b3b3b3` | `#565656` | Faint furniture: line numbers, idle chips |
| `bg-grey-4` | `#d4d4d4` | `#333333` | Ghost: progress track |
| `border-hairline-faint` / `divide-hairline-faint` | 15% ink | 22% paper | Sub-weight rules (inner card rules, table rows, code gutters) |
| `bg-tint` | 5% ink | 8% paper | Hover wash on flat surfaces |
| `bg-accent-hover` / `hover:bg-accent-hover` | `#c8430f` | same | Pressed orange |

Utility: `.hatch` — the diagonal blueprint texture (1px line / 9px, 45°).
Apply to **chrome zones only**: titlebars, section headers of window-like
surfaces, the top strip of modals/terminals. Never on content.

Dark mode is automatic via these tokens (`.dark` on `<html>`). **Never** write
`bg-white`, `text-black`, `bg-orange-500`, `text-red-600`, `dark:` overrides,
or any literal color. If you type a hex value, you are wrong.

## 3. Typography (Geist = sans, JetBrains Mono = mono; already loaded)

Three voices:
- **Machine voice — `font-mono`**: ALL h2-level headings, eyebrows, labels,
  chips, stats furniture, buttons/CTAs, nav items, table heads, code, numbers.
- **Display voice — `font-sans`**: the hero h1, card titles, big stat numerals.
- **Reading voice — `font-sans` (weight 300 body default)**: paragraphs.

Recipes (copy these class strings):
- Page title: `font-mono text-3xl md:text-4xl font-extrabold tracking-[-0.03em]`
  (sentence case, NOT uppercase).
- Section heading: `font-mono text-xl font-extrabold tracking-[-0.02em]`.
- **Eyebrow / micro-label**: `font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground` — the signature move. Tracking grows as size shrinks (10px → 0.16em; 13px → 0.1em).
- Stat numeral: `font-sans text-4xl font-bold tracking-[-0.02em] tabular-nums`.
- Body: `text-[15px] leading-relaxed text-ink-soft` (max measure ~65ch: `max-w-[68ch]`).
- Meta line (dates, counts): `font-mono text-xs text-muted-foreground tabular-nums`.
- Use `tabular-nums` wherever digits align (tables, stats, dates, points).

## 4. The rulebook

1. **Two colors plus one accent.** Paper, ink, derived greys, `#ee5a24`. Never invent a color.
2. **Color must be evidence.** Orange = interaction, emphasis, the active thing. Semantic states are expressed with ink/outline/strike + mono labels, not a rainbow of badge colors.
3. **The hairline is the only line.** `border border-border` (1px) for structure; `border-hairline-faint` for sub-structure; `border-2` reserved for emphasis (primary CTAs, active states). Collapse shared borders in grids with `-ml-px -mt-px` on cells (or `divide-x divide-y divide-border` with `gap-0`) so double borders never thicken.
4. **No radius, no shadows, no glass, no gradients, no blur.** Delete every `rounded-*` (config nukes them anyway; don't write new ones). Exceptions: `rounded-full` ONLY for spinner circles and ≤8px status dots. Soft `shadow-*` is banned; the ONLY permitted shadow is a **hard extrusion**: `shadow-[8px_8px_0_0_hsl(var(--foreground))]` (0 blur) on floating surfaces (modals, popovers, toasts).
5. **Hover floods.** Interactive surfaces answer hover with a full fill flip + `transition-colors duration-200`: chrome/CTAs flood **orange** (`hover:bg-primary hover:text-primary-foreground hover:border-primary`); content tiles/cards flood **ink** (`hover:bg-foreground hover:text-page`). Rows get the quiet wash `hover:bg-tint`. Links: `hover:text-primary` + arrow glyph `→` that shifts (`group-hover:translate-x-0.5 transition-transform`). Gate hover-only reveals: content must be visible by default below `md:`.
6. **Square avatars.** All avatars/images sharp-cornered.
7. **Texture is hatched, never imaged.** `.hatch` on chrome zones only.
8. **Motion decelerates.** `transition-colors duration-200`, `duration-300` max for layout. Anything that animates must respect `motion-reduce:` (e.g. `motion-reduce:transition-none motion-reduce:animate-none`). No autonomous motion except existing typewriter/pulse components.
9. **Structure is information.** Numbered markers only for real sequences (weeks, steps). Eyebrows label real categories. No emoji as UI furniture.
10. **Copy states receipts.** Prefer counts and facts over adjectives; labels say exactly what happens ("Save changes" → toast "Saved").

## 5. Component recipes

- **Card / panel**: `border border-border bg-page` + padding. Optional mono eyebrow top row separated by `border-b border-border` with `.hatch` if it's chrome. Interactive card: wrap in `group`, ink flood per rule 5, meta text flips with `group-hover:text-page/60`.
- **Primary CTA (button `default`)**: `border-2 border-border bg-page text-foreground font-mono text-sm font-semibold uppercase tracking-[0.1em] px-5 py-2.5 hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors`.
- **Quiet button (`outline`/`ghost`)**: 1px border / borderless, `hover:bg-tint`.
- **Danger**: `bg-destructive text-destructive-foreground border-2 border-destructive hover:bg-foreground hover:border-foreground hover:text-page`.
- **Status chips** (mono, uppercase, `text-[10px] tracking-[0.08em] font-semibold px-2 py-0.5 border`):
  - active/accepted/checked-in → `bg-foreground text-page border-foreground`
  - featured/today/e-board → `bg-primary text-primary-foreground border-primary`
  - pending/upcoming/open → `border-border text-foreground` (outline)
  - rejected/cancelled → `border-border text-muted-foreground line-through decoration-primary decoration-2` (the orange strike — an editorial mark)
  - past/inactive/prospect → `border-grey-3 text-grey-2`
- **Table**: heads `font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground font-semibold border-b border-border`; rows `border-b border-hairline-faint hover:bg-tint`; numeric cells `font-mono tabular-nums`.
- **Forms**: labels are auto-styled mono uppercase via `ui/label.tsx`; inputs `border border-input bg-page rounded-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary`. Group fields into hairline-ruled sections with mono eyebrows.
- **Modals/popovers/toasts**: `bg-page border border-border rounded-none shadow-[8px_8px_0_0_hsl(var(--foreground))]`; overlay `bg-foreground/40` (no blur); title = mono extrabold; a `.hatch` strip in the header is encouraged.
- **Stat tile (bento)**: hairline-collapsed grid cells: eyebrow label + sans bold numeral (`tabular-nums`) + optional mono footnote. Emphasized stat gets `text-primary` on the numeral — ONE per grid.
- **Terminal/code chrome**: 38px titlebar with `.hatch` + mono 10.5px uppercase title + three 9px `rounded-full` traffic dots (`bg-grey-3`); body mono 12px/1.6; gutter `border-r border-hairline-faint text-grey-3 tabular-nums`. Syntax: keywords `text-primary font-medium`, strings `text-muted-foreground`, comments `text-grey-2`, everything else ink. **Weight, not hue**, distinguishes emphasis.
- **Charts (recharts)**: axes/ticks mono 10px `hsl(var(--muted-foreground))`; grid `var(--hairline-faint)` dashed; series in ink/greys with exactly ONE series in `hsl(var(--primary))` (the emphasized one); flat fills (`fillOpacity` ≤ 0.08 if area), no gradients, square dots, sharp tooltip per modal recipe.
- **Empty states**: mono eyebrow + one sentence + a primary CTA, inside a `border border-dashed border-grey-3` box.
- **Loading**: existing spinners OK (circles allowed); skeletons `bg-grey-4/40 rounded-none`.

## 6. Layout

- App pages: content container `p-6 md:p-10`, page header block = eyebrow (section name) + page title + optional meta line, separated from body by `border-b border-border pb-6`.
- Marketing/public pages: sections `py-20 px-6 md:px-12 max-w-[1200px] mx-auto`; the hero may go wider. Footer = full-bleed **orange flood** (white text, mono legal line) — the page closes with chrome that IS orange.
- Breakpoints: `md:` = 900px (mobile ends), `lg:` = 1200px, `xl:` = 1600px. Mobile-first; test every layout mentally at 375px.
- Anything that expands/animates should own a fixed reservation (min-heights) so the page never reflows around it.

## 7. Hard engineering constraints

- **Preserve 100% of behavior**: every import, hook, query, mutation, handler, navigation, toast, aria attribute, and conditional render must keep working. You are restyling and may restructure JSX layout, but capability loss = failure.
- Token classes only (see §2). No new dependencies. No `dark:` variants (tokens handle it). No `style={{}}` color literals.
- Keep accessibility: labels wired to inputs, `aria-*` preserved, focus visible (global focus ring exists), touch targets ≥ 40px.
- Tests exist under `src/tests/` — if a file you own has a test, read it first and keep every text/label/role it asserts.
- Do not run builds, dev servers, or tests; other agents are editing sibling files concurrently. Edit only the files you own.
