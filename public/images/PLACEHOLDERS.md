# Site images

Every photograph sits in a "window" frame (see `DESIGN.md` §3). Paths are relative to
`public/images/` and referenced from `lib/site-config.ts`. Keep the names, or update
`site-config.ts` to match your files. A missing file shows a cream placeholder.

| Path | Where it shows | Set in `site-config.ts` |
|------|----------------|-------------------------|
| `hero/hero-portrait.jpg` | Home hero, share image (`app/opengraph-image.tsx`) | `hero.image` |
| `departments/<slug>.jpg` (9) | "Rooms of care" index, department pages, Care Finder results | `departments[slug].heroImage` |
| `locations/location-1.jpg` … `-3.jpg` | Clinic cards, booking "How you'll be seen" | `clinics[slug].image` |
| `telehealth/telehealth-hero.jpg` | Home video band, Video visits page | `videoVisit.image` |
| `gallery/look-1.jpg` … `-6.jpg` | "Inside our clinics" gallery | `about.gallery` |
| `about/about-shop.jpg`, `about/about-detail.jpg` | About page, sign-in shell | `about.images` |
| `trust/trust-care.jpg` | Trust section, sign-in shell | `about.trustImage` |

Warm, daylight interiors in cream, honey oak, dusty steel-blue, brass and sage keep the
palette coherent. Landscape images work best at about 1600 px wide; portraits at 3:4.

> Clinician portraits and service photos come from your Opencals store (seeded by the
> **Medical / Clear Care Medical** preset), not from this folder. `team/*.jpg` are spare
> copies of the seeded portraits and are not referenced by the code.
