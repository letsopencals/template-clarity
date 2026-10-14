# Template conventions

This is a Next.js 15 (App Router) / React 19 storefront template built on
`@opencals/storefront-sdk`. These conventions keep the template fast and
maintainable. They apply to every template in `templates/` — this file is meant
to be copied across them (only the template name / branding differs).

## Data fetching

**RSC-first.** Read data on the server and pass it down. Do NOT fetch cacheable
data in a `useEffect` on the client.

- Server reads go through `lib/server-data.ts` — `React.cache()`-wrapped helpers
  (`getStoreSettings`, `getProducts`, `getProduct`) that call the SDK directly.
  `React.cache` dedupes calls within a request. Never import `lib/server-data.ts`
  from a `'use client'` file.
- `app/layout.tsx` is an async Server Component: it fetches store settings once
  and seeds `<Providers initialSettings={...}>`. `SettingsProvider` takes the
  value as a prop — it does not fetch.
- Read-only pages (e.g. `app/services/page.tsx`) are async Server Components that
  fetch with `lib/server-data.ts` and hand the result to a small `'use client'`
  child as `initialProducts` / `initialProduct`.

**Client reads use SWR, seeded with server data.** For data that genuinely needs
to live on the client (filtering, availability, add-ons, cart), use `useSWR`
against the template's own `/api/*` routes, with `fallbackData` set to the
server-rendered value so there's no loading flash on first paint.

- Shared fetcher: `lib/fetcher.ts`.
- Build the SWR key from its inputs and pass `null` when not ready (e.g. no date
  picked yet) so nothing fetches prematurely. Multiple SWR hooks run in parallel
  — never chain fetches through sequential `useEffect`s.
- `revalidateOnFocus: false` unless you specifically want refocus revalidation.

The `/api/*` routes stay: they are the client/SWR data source and call the SDK
server-side via the `@/lib/opencals` side-effect import.

## Components & files

**Pages compose; components implement.** A `page.tsx` should be: data fetching
(RSC) + layout/composition + wiring. Presentational blocks and interactive
widgets live in `components/`.

- Guideline: any `page.tsx` over ~150 lines, or one that defines a section /
  widget component, gets decomposed into `components/`.
- Group `components/` by route/domain: `components/booking/`, `components/account/`,
  `components/services/`, `components/home/`; shared primitives in `components/ui/`.
  Co-locate a route's private components under a matching subfolder
  (e.g. `components/account/appointment-detail/`).

**Never define a component inside another component** — it remounts on every
parent render. Define at module scope (or a separate file). Module-scope sibling
helpers below a page are fine.

**Use the shared UI primitives — don't hand-style buttons/inputs inline.**
- `components/ui/button.tsx` — `<Button variant size fullWidth>` and
  `buttonClasses({ variant, size, fullWidth, className })` for `<Link>` CTAs.
  Variants: `primary` (steel CTA), `outline`, `ghost`, `quiet` (light-on-dark).
  Sizes `sm|md|lg`. All buttons are pills (`rounded-full`) — this is the canonical
  shape; don't reintroduce square or ad-hoc-radius buttons. Steel is the single
  action colour (see `DESIGN.md`). Pass only layout classes (`mt-*`, `flex-1`,
  `gap-*`) via `className`; color/padding/rounding/tracking come from the
  variant/size.
- `components/ui/input.tsx` — `<Input>` / `<Textarea>` for text fields.
- Leave genuinely-different controls inline: selection/toggle chips with an
  active/selected state (staff/time/day/variant/location/department pickers, step
  indicator/progress, pagination), destructive buttons (no destructive variant),
  `<select>`, checkboxes/radios, icon-only controls, and navigation rendered as
  `next/link` `<Link>` (style those with `buttonClasses()`).
- Overlays: `components/ui/sheet.tsx` (mobile bottom sheet) and
  `components/ui/dialog.tsx` (centred modal). Both portal to `document.body`,
  lock page + Lenis scroll, trap focus and close on Escape. Don't hand-roll modals.

**Hooks are single-concern.** Split multi-purpose hooks so each has one
responsibility and independent dependencies (see `hooks/use-checkout-questions.ts`,
`hooks/use-payment-providers.ts`, `hooks/use-cart-expiry.ts`, split out of the
booking flow / cart context). A large hook may remain as a thin orchestrator that
composes the smaller ones (`hooks/use-booking-flow.ts`).

## Design & motion

- **`DESIGN.md` is the design contract** (palette, type, motifs, motion, voice).
  Read it before touching UI.
- **Motion:** use `components/motion/*` (`Reveal`, `RevealText`, `ParallaxImage`,
  `CountUp`, `Marquee`, `MagneticButton`, …) and `components/motifs/*`
  (`CareLine`, `WindowFrame`, `Seal`) with the `DURATION`/`EASE_*` tokens from
  `easing.ts`. Don't hand-roll framer variants. Each piece checks the local
  `useReducedMotion()` (hydration-safe; not framer's) and must leave content
  visible when motion is off.
- **Lenis** smooth scroll runs from `components/motion/smooth-scroll.tsx`.
  Scrollable drawers, sheets and modals need `data-lenis-prevent`. Programmatic
  scrolling goes through `useSmoothScroll()` (fallback: `scrollIntoView`).
  Fixed elements inside a page must be portalled out of `PageTransition`
  (its transform breaks `position: fixed`).
- **Custom CSS classes go in `@layer components`** in `app/globals.css`.
  Unlayered CSS beats every Tailwind utility.
- **Grids that hold wide content:** `grid-cols-1` below the breakpoint and
  `min-w-0` on children, or a horizontal ribbon will widen the page.
- **Hydration:** anything that depends on the visitor's clock, timezone or locale
  (open-now chips, countdowns, join-video windows, greetings) renders a neutral
  value on the server and the live value after `useHydrated()` / `useNow()`.

## Clinic intake (checkout questions)

- Pre-visit questions are the store's checkout questions. `lib/intake.ts` maps
  their stable `internalName` (e.g. `Visit for`, `Patient name`, `Patient DOB`,
  `Dermatology photo`, `Telehealth consent`) to clinic meaning. Match on
  `intakeKey(q)`, never on the visible title.
- Unknown questions render generically by `type`; a store without the clinic
  questions books every visit for "Myself". Nothing may hard-require them.
- Answers travel **per visit** in `AppointmentService.create`
  (`checkoutQuestionAnswers`, with `fileIds` for uploads via `/api/uploads/presign`),
  not at checkout — each visit in a family cart keeps its own patient and notes.
- Appointment detail answers carry only `questionId` + question text; use
  `patientOf(answers, keyMapOf(questions))` to recover who a visit was for.

## Data exposure

- Everything sent to the browser (RSC props and `/api/*` JSON) goes through
  `lib/public-payload.ts` (`publicPayload`, `publicProduct`) or a public-safe
  mapper (`lib/clinicians.ts`, `PublicClinic` in `lib/server-data.ts`). Never pass
  raw SDK staff, customer or appointment objects through; `internalNote` must
  never reach the client.

## Re-render hygiene

- **Memoize context provider values** with `useMemo` — an inline `value={{...}}`
  object makes every consumer re-render on each provider render. All contexts here
  (`settings`, `location`, `timezone`, `cart`, `checkout`) follow this.
- Hoist static objects (framer-motion `initial`/`animate`/`transition`, default
  non-primitive props) to module-level `const`s instead of recreating them inline.
- `React.memo` leaf components that take stable props and render often
  (e.g. `components/booking/step-indicator.tsx`).
- Prefer a ternary (`cond ? <x/> : null`) over `cond && <x/>` for conditional
  rendering, to avoid accidentally rendering `0`/`''`.

## Bundle

- Load heavy / below-the-fold components with `next/dynamic`. Stripe is loaded
  this way in the checkout payment step (`ssr: false`) so it isn't in the initial
  bundle.
- Import directly from module paths; avoid barrel/index re-export files that pull
  in more than you use.

## Verifying changes

- `npm run build` must pass. In the route summary, read-only pages should be `○`
  (static) or `ƒ` (dynamic) Server Components — not shipped as pure client pages.
- Smoke test: home and departments paint with no spinner on first load; the Care
  Finder recommends a visit; the composer (who for → how seen → clinician → time
  → add-ons → pre-visit notes → Reserve) adds to the cart; checkout (contact →
  payment) completes to the visit pass; My Care shows the visit with its notes.
