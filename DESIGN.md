# Clear Care Medical — "Warm Practice" design contract

A boutique private practice in afternoon light. Calm, human, unhurried — never
sterile, never "health-tech". Everything is sampled from the clinic photography:
cream plaster, honey oak, dusty steel-blue walls and scrubs, brass fixtures, sage
fiddle-leaf figs. The patient's story runs **from worry to calm**: the site opens
with a gentle pulse and ends with a flat, settled line — "Booked. Breathe."

## 1. Palette (`app/globals.css` `@theme`, semantic Tailwind names)

| Token | Hex | Use |
|---|---|---|
| `paper` | #FBF8F2 | page background |
| `card` | #FFFDF9 | cards, fields, stationery |
| `cream` / `cream-deep` | #F3EBDD / #E9DCC6 | alternating sections, placeholders |
| `ink` / `ink-muted` / `ink-dim` | #21303A / #5D6870 / #96A0A6 | text (navy-ink, never pure black) |
| `steel` (+`-bright`, `-deep`, `-night`, `-tint`) | #3F6E8C | **the only action colour**: buttons, links, selected states, focus. `steel-deep`/`steel-night` for dark spreads |
| `oak` / `honey` / `honey-soft` | #B9844F / #E2B97F / #F6E9D3 | warm tone: eyebrows, highlights. Never on buttons |
| `brass` / `brass-soft` | #B08D57 / #EFE4D0 | hairlines, the seal, stamps. Never a fill |
| `sage` / `sage-deep` / `sage-soft` | #8A9E7E | "available", "done", open-now, calm states |
| `clay` / `clay-soft` | #B4583F | errors, destructive, emergency notice. Warm, not alarm red |
| `line` / `line-strong` | ink 10% / 20% | hairlines and borders |

## 2. Type (`next/font` in `app/layout.tsx`)

- **Display — Fraunces** (variable; `opsz`, `SOFT` 100, `WONK` on italics). Classes
  `.display-xl|lg|md|sm|xs`. Weight ~360, tight tracking, balanced wrap.
  **Put the emotional word in `<em>`** — it turns italic, soft and steel:
  `Care that has <em>time for you.</em>` One `<em>` per heading.
- **Body — Figtree.** 16–17px, relaxed leading. `.prose-calm` for long copy.
- **Numbers — Geist Mono** via `.tabular`: prices, times, dates, countdowns,
  durations, room numbers.
- **Eyebrow** — `.eyebrow` (uppercase, 0.16em tracking), usually `text-oak`,
  often numbered: `01 · Find care`.
- Use `<SectionHeader eyebrow title lead align tone size action>` to open sections.

## 3. Motifs (`components/motifs/*`)

1. **The care line** — `<CareLine settled trigger tone>`. A hairline with one
   gentle ECG pulse that draws itself in view. It **settles flat** at moments of
   calm: Reserve ("Held for you"), the visit pass, the closing CTA. Use it as a
   section divider sparingly (hero, journey, closing) — not on every section.
2. **The window** — every photograph sits in a `.window` (soft 28px radius + inset
   brass hairline), usually via `<WindowFrame src alt aspect daylight>`, which
   reveals like a blind rising. `.daylight` adds a slow sunlight sweep (hero and
   one feature image per page, max). `.window-sm` for small thumbnails.
3. **Clinic stationery** — the patient's paperwork, made beautiful:
   - the **appointment card** (`.paper`, `.perforation` tear line, `.leader-line`
     dotted price rows, fields that "write in" with `animate-ink`);
   - **pre-visit notes** on lined paper (`.ruled`);
   - the **visit pass** (thank-you) with a perforated stub;
   - the brass **CC seal** — `<Seal motion="stamp">` pressed on "Held for you" and
     "Confirmed". Brass only.

## 4. Shape

- Buttons are **pills** (`components/ui/button.tsx`, `buttonClasses()` for links).
  Variants `primary` (steel), `outline`, `ghost`, `quiet` (on dark).
- Radii come from tokens: `rounded-window` (images, big panels), `rounded-card`
  (cards, sheets), `rounded-field` (inputs, chips that aren't pills). No ad-hoc
  `rounded-[17px]`.
- Elevation is warm and low: `shadow-card`, `shadow-paper`, `shadow-float`
  (overlays only). Glass is retired except `.glass-nav` on the scrolled header.
- `.grain` on cream and steel-deep spreads; `.hairline` between list rows.

## 5. Motion (`components/motion/*` — never hand-roll framer variants for these)

- Calm, decelerating, no bounce: `EASE_OUT`, `EASE_EXPO`, `DURATION` from
  `easing.ts`. Springs only for the seal stamp and sliding selection highlights
  (`SPRING_SOFT`).
- Use `Reveal` / `RevealText`, `WindowFrame`, `ParallaxImage`, `CountUp`,
  `AnimatedNumber`, `Marquee`, `MagneticButton` (one per page, the primary CTA).
- Lenis smooth scroll (`SmoothScroll` in providers). Overlays use
  `components/ui/sheet.tsx` / `dialog.tsx` (portalled, scroll-locked, focus-trapped,
  `data-lenis-prevent`).
- Every motion piece calls the local `useReducedMotion()` and leaves content
  visible and static when motion is off. No pinning or scroll-jacking with reduced
  motion.
- Overlay layers: header z-40, cart drawer z-60, sheet/dialog scrim z-65 / panel z-66.

## 6. Voice

Warm, plain, reassuring. Second person, short sentences, no medical jargon, no
exclamation marks, no "Submit". Things a good receptionist would say:
"Who is this visit for?", "Tell us beforehand", "Held for you", "What to bring",
"Your link opens 10 minutes before". Never diagnose; the Care Finder suggests the
right *visit*. The emergency line (`siteConfig.emergency`) appears on every
booking surface.

## 7. The clinic model (what makes this not a generic template)

- Patients start from **a need**, not a department (`siteConfig.careFinder`).
  Departments are "rooms of care" for browsing.
- Every visit is **for someone** (Myself / My child / Someone else) and has
  **pre-visit notes** — seeded checkout questions mapped by `internalName` in
  `lib/intake.ts`. Answers are sent per visit with `AppointmentService.create`.
- Visits are **in clinic or by video** (the online location, filtered out of the
  global clinic selector, chosen per visit in the composer).
- After booking, the patient has a **care record** ("My Care"): next visit, prep
  checklist, join-video window, due-for recalls, family filter, visit notes and
  invoices — not an order list.

## 8. Ownership (redesign phase)

`components/home|care|departments|clinicians|video|about|contact|layout` → discovery ·
`components/booking` → composer · `components/checkout|cart`, `app/checkout`,
`app/thank-you` → checkout · `components/account|auth`, `app/account|auth` → My Care ·
shared `components/ui|motion|motifs`, `lib`, `hooks`, `globals.css` → foundation
(additive changes only).
