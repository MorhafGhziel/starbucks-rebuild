# Starbucks: concept redesign

An independent concept redesign of starbucks.com in two colours: Starbucks green `#00754A` and creamy white `#F7F5EE`. **Not affiliated with Starbucks.**

## Run it

```bash
npm install
npm run dev        # http://localhost:3970
npm run build && npm start   # production build on the same port
```

## What's inside

| Route | What |
|---|---|
| `/` | One real-time 3D Starbucks cup that lifts off the hero plinth as you scroll, rides the right edge over the menu and lands in “One store” (drag it at either end; lift the lid, add the Insulated Sleeve) · menu tabs · take-it-home rail · farm-to-cup steps · baristas + store locator · bring your own cup · questions · stories |
| `/menu` | 16 drinks with search, filters, empty and reset states, and a details drawer |
| `/shop` | 22 products (whole bean, drinkware, brewing) with search and filters |
| `/credits` | Every source |

**Content is real**, read from Starbucks' own sites on 22 Sep 2026:
- **Drinks** (descriptions, Grande calories and caffeine): the starbucks.com ordering API.
- **Products** (names, sizes, USD prices, photos): the shop.starbucks.com feed.
- **Tasting notes and roast levels**: printed on the bags.
- **Journey, reuse and FAQ facts**: about.starbucks.com stories.
- **Siren**: the SVG served on starbucks.com, geometry unchanged, recoloured.

**Concept boundaries:**
- The bag is a list kept in your browser. Checkout links each item to shop.starbucks.com; nothing is charged.
- Drink orders open starbucks.com.
- The page never asks for your location. Store search hands off to the official locator, which ignores location in its URL (tested).

## Pipelines (`tools/`)
- `products.mjs`, `drinks.mjs`: rebuild `src/data/*.json` from the official feeds.
- `realcolor.mjs`: real-colour images; only flat studio backgrounds are shifted onto the site green/cream so tiles stay seamless. (`duotone.mjs` / `photos.mjs` make the earlier green-and-cream versions.)
- `posters.mjs`: rendered the transparent poster images the cup anchors show before WebGL is ready or when it isn't available (written for the earlier per-section canvases; the posters still match the resting states).
- `flight.mjs`: captures the cup's trip from hero to “One store” as a scroll sequence.
- `flight-check.mjs`: samples the planned flight 500× at 7 viewports and reports any moment the cup's projected bounds touch protected content, the header band or a screen edge (needs the dev server; uses `?flight-debug`).
- `flight-debug.mjs`: stills with the development guides (path, projected bounds, protected regions, corridor, landing anchor). Open `/?flight-debug` in a browser to see them live.
- `record.mjs`: records real scrolling (slow, pause, reverse, fast, landing, ride-away) to `shots/rec-<width>.webm`.
- `edge.mjs`: reload mid-flight, deep-link to a later section, resize mid-flight.

### How the flight works
`src/components/three/flight/` holds it. `measure.ts` reads the page once per layout change (anchors, pedestal, landing disc, protected blocks, the free corridor beside the menu). `plan.ts` turns that into a flight. It works in screen space plus real view depth, and derives phase timing from where the menu actually is. Intent keys (lift → close-up tumble → upside down → corridor S-drift → approach → touchdown) are solved densely against the protected regions, then refined until no sample collides. Rotation is built every frame from continuous angles (a 2π pitch is a real end-over-end turn), so no quaternion endpoints are interpolated. `FlightScene.tsx` binds GSAP ScrollTrigger (scrub 0.6) to progress. It caps the lag at 48px so fast scrolling can't slide content under a trailing cup, and applies the pose through nested groups: path, orientation, float, pivot, settle.
- `interact.mjs`: 56 interaction, layout and fallback checks against a running server.
- `shot.mjs`, `sections.mjs`, `states.mjs`: screenshots for review.

`research/` (scraped reference pages and source images) is git-ignored and kept locally.

## Stack
Next.js 16 (App Router, static) · React 19.2 · Three.js + React Three Fiber + drei · GSAP (ScrollTrigger) · plain CSS with two-ground tokens (`data-ground="green|cream"`) · Young Serif + Figtree (OFL).
