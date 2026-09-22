# Reference → Starbucks section map

Inspected live on 22 Sep 2026 at 1440×900 and 390×844 (`research/*-desk.jpg`, `*-mob.jpg`).

## What I observed

**Groovy Coffee** (Shopify, about 13,350 px on desktop). Each section is one flat colour field joined by animated wave edges. It uses a soft serif for headlines against mono all-caps UI text. Order:
1. Hero: product still life, 2 buttons
2. Shop Our Coffee: 3 tinted cards on cream, "ADD — $" buttons
3. Brand intro, with a tin rising from the bottom
4. Sunset scene: a tin you can rotate (model-viewer, "click & drag to rotate" sticker)
5. Groovy Goods: merchandise grid
6. Our Coffee
7. Values: 4 icons
8. Lifestyle duo
9. Meet the Sisters (founders)
10. Our Packaging: labelled callouts and a rotating badge
11. FAQ accordion
12. How We Reuse: carousel
13. Buy band
14. Instagram / UGC
15. Footer with a wave top

A 15%-off popup covers the page on every mobile screen. Not copied.

**Jazean Coffee** (WordPress + THREE.js + GSAP, dark). A slow, atmospheric hero (marbled liquid, a logo drawn in line). Then:
- an individual vs business split, drawn as line arcs
- a product carousel you can drag, with a spotlit bag in the centre
- a café & experience centre with opening hours / location / menu
- a news strip
- a quiet footer

It has editorial pacing, a practical café block, and a real news strip.

**starbucks.com** (2,532 px). Hero promo, three campaign rows, then a large link footer. Font: SoDo Sans. Nav: Menu, Rewards, Gift Cards, Find a café.

## The Starbucks page

| # | Module | From | Starbucks content (all verified) |
|---|---|---|---|
| A | Header + hero, green field | Groovy hero clarity + Jazean atmosphere | Official Siren (from starbucks.com, recoloured to #00754A). A real-time 3D hot cup with that Siren, which you can drag. A rotating ring badge replaces Groovy's "drag to rotate" sun. |
| B | Menu, cream field, drink tiles | Groovy "Shop Our Coffee" placed early | 16 real drinks from the starbucks.com ordering API: official descriptions, Grande calories + caffeine. Tabs: Fall / Hot / Iced / Tea. Detail drawer. Full `/menu` route with search. |
| C | Brand intro + the cup up close, green field | Groovy's rising tin + rotating tin | The same cup with controls: rotate, reset, lift the lid, slide on the Insulated Sleeve. Short copy on 1971, Seattle. |
| D | Take it home: whole bean, drinkware, brewing, cream field | Groovy Goods + Jazean's bag carousel | 22 real products from shop.starbucks.com (USD prices as of 22 Sep 2026). Tabs + a rail you can drag with visible arrows. Bag prices / "Add to bag" are a concept; checkout hands off to the official shop. |
| E | Bean to cup, green field | Groovy "Our Coffee" + values; Jazean's origin progression | 4 steps: Grow → Source → Roast → Brew. Facts from about.starbucks.com (450,000 farmers, 30 markets, C.A.F.E. Practices, Hacienda Alsacia, Roast Spectrum, Clover Vertica). The roast step shows the matching bags. |
| F | Baristas + find a store, cream field | Groovy "Meet the Sisters" + Jazean's café centre | Green Apron / Black Apron Coffee Master (verified). Real Starbucks photography in duotone. Store locator handoff; location is used only after a click. |
| G | Reuse | Groovy "Our Packaging" callouts | Personal cups accepted at the drive-thru, in the app and in the café (U.S. & Canada, Jan 2024). Insulated Sleeve (90% recycled stainless steel). FlavorLock bag valve. |
| H | Questions, accordion | Groovy FAQ | Answers taken from Starbucks' own Coffee Science articles. |
| I | Journal strip | Jazean news + Groovy social | 4 real stories with real dates, linked to about.starbucks.com. |
| J | Footer, green field with a wave top | both | Real destinations; "Independent concept redesign. Not affiliated with Starbucks." |

Merged: Groovy's buy band and lifestyle duo add nothing for Starbucks and were dropped. The UGC wall was dropped because we have no real posts to show.
