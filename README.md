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
| `/` | Hero with a real-time 3D Starbucks cup you can drag · menu tabs · the cup up close (lift the lid, add the Insulated Sleeve) · take-it-home rail · farm-to-cup steps · baristas + store locator · bring your own cup · questions · stories |
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
- `posters.mjs`: renders the transparent poster images the 3D stages fall back to.
- `interact.mjs`: 56 interaction, layout and fallback checks against a running server.
- `shot.mjs`, `sections.mjs`, `states.mjs`: screenshots for review.

`research/` (scraped reference pages and source images) is git-ignored and kept locally.

## Stack
Next.js 16 (App Router, static) · React 19.2 · Three.js + React Three Fiber + drei · GSAP (ScrollTrigger) · plain CSS with two-ground tokens (`data-ground="green|cream"`) · Young Serif + Figtree (OFL).
