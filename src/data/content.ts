// Every fact on the page lives here, next to where it came from.
// Sources were read on 22 Sep 2026.
import drinksData from './drinks.json';
import shopData from './shop.json';

export type Drink = (typeof drinksData.drinks)[number];
export type Product = (typeof shopData.coffee)[number];

export const drinks = drinksData.drinks;
export const coffee = shopData.coffee;
export const goods = shopData.goods;

export const LINKS = {
  menu: 'https://www.starbucks.com/menu',
  order: 'https://www.starbucks.com/menu',
  stores: 'https://www.starbucks.com/store-locator',
  rewards: 'https://www.starbucks.com/rewards',
  shop: 'https://www.shop.starbucks.com/',
  giftCards: 'https://www.starbucks.com/gift',
  about: 'https://about.starbucks.com/',
  coffeeStories: 'https://about.starbucks.com/stories/category/coffee-products/coffee/',
  customerService: 'https://customerservice.starbucks.com/',
  careers: 'https://careers.starbucks.com/',
  impact: 'https://about.starbucks.com/sustainability/',
  privacy: 'https://www.starbucks.com/terms/privacy-notice/',
  terms: 'https://www.starbucks.com/terms/starbucks-terms-of-use/',
  accessibility: 'https://www.starbucks.com/accessibility',
  beanToCup: 'https://about.starbucks.com/stories/2024/starbucks-coffee-bean-to-cup/',
  roastSpectrum: 'https://about.starbucks.com/stories/2025/starbucks-coffee-roast-spectrum-explained/',
  clover:
    'https://about.starbucks.com/stories/2026/freshly-brewed-coffee-on-demand-how-the-innovative-clover-vertica-is-changing-starbucks-coffeehouses/',
  storeBeans: 'https://about.starbucks.com/stories/2026/coffee-science-how-to-store-coffee-beans-for-freshest-flavor-at-home/',
  smell: 'https://about.starbucks.com/stories/2026/coffee-science-why-starbucks-baristas-smell-coffee-before-they-taste-it/',
  icedVsCold:
    'https://about.starbucks.com/stories/2026/coffee-science-iced-americano-cold-brew-or-iced-coffee-whats-the-difference/',
  futureOfCoffee:
    'https://about.starbucks.com/stories/2025/keeping-your-cup-full-how-starbucks-is-working-to-save-the-future-of-coffee/',
  reuseSearch: 'https://about.starbucks.com/?s=reusable+cup',
  sleeve: 'https://www.shop.starbucks.com/products/starbucks-stainless-steel-insulated-sleeve',
};

// the set linked from the starbucks.com footer (22 Sep 2026)
export const SOCIAL = [
  { name: 'Instagram', href: 'https://instagram.com/starbucks' },
  { name: 'Facebook', href: 'https://facebook.com/starbucks' },
  { name: 'YouTube', href: 'https://www.youtube.com/starbucks' },
  { name: 'Pinterest', href: 'https://www.pinterest.com/starbucks/' },
  { name: 'X', href: 'https://x.com/starbucks/' },
  { name: 'Spotify', href: 'https://open.spotify.com/user/starbucks' },
];

export const MENU_GROUPS = [
  { id: 'fall', label: 'Fall favorites' },
  { id: 'hot', label: 'Hot coffee' },
  { id: 'iced', label: 'Iced coffee' },
  { id: 'tea', label: 'Chai & matcha' },
] as const;

export const ROASTS = [
  {
    id: 'blonde',
    label: 'Blonde',
    // about.starbucks.com, "Starbucks Coffee roast spectrum explained", Feb 27 2025
    text: 'A shorter roast. Lighter-bodied and mellow, with slight hints of roast.',
  },
  { id: 'medium', label: 'Medium', text: 'The middle of the spectrum. Smooth and balanced, with rich, approachable flavors.' },
  { id: 'dark', label: 'Dark', text: 'A fuller body with a robust, bold taste and the essence of an intense roast.' },
] as const;

export const JOURNEY = [
  {
    id: 'grow',
    title: 'Grow',
    image: 'cherries',
    alt: 'Branches of a coffee tree heavy with ripe coffee cherries.',
    text: 'Starbucks buys 100% arabica coffee from more than 450,000 farmers across 30 markets along the Coffee Belt: Latin America, Africa and Asia Pacific.',
    detail: 'At Hacienda Alsacia, its research farm on the slopes of the Poás Volcano in Costa Rica, agronomists keep more than 600 coffee varieties and give the most climate-resistant seedlings to farmers for free.',
    source: LINKS.beanToCup,
  },
  {
    id: 'source',
    title: 'Source',
    image: 'farm',
    alt: 'Coffee beans drying on raised beds at a coffee farm, with mountains behind.',
    text: 'In 2004 Starbucks and Conservation International created C.A.F.E. Practices: more than 200 checkpoints for economic transparency, social responsibility, environmental leadership and quality, each verified by an independent third party.',
    detail: '10 Farmer Support Centers share agronomy with farmers at no cost, whether or not they sell to Starbucks. More than 95% of the farms Starbucks buys from are small, most under 2 hectares.',
    source: LINKS.futureOfCoffee,
  },
  {
    id: 'roast',
    title: 'Roast',
    image: 'roast',
    alt: 'Starbucks whole bean coffee bags across the roast spectrum.',
    text: 'Each coffee gets its own roast profile. Together they make the Starbucks Roast Spectrum, from mellow Blonde to smooth Medium to bold Dark.',
    detail: '',
    source: LINKS.roastSpectrum,
  },
  {
    id: 'brew',
    title: 'Brew',
    image: 'machines',
    alt: 'The bean hoppers of a Clover Vertica brewer in a Starbucks coffeehouse.',
    text: 'Clover Vertica, the first brewer Starbucks designed entirely in-house, makes a French press-quality cup to order in 30 seconds or less, with six coffees to choose from.',
    detail: 'It’s rolling out across company-owned U.S. coffeehouses, and it was designed to cut waste, filters included.',
    source: LINKS.clover,
  },
] as const;

export const FAQ = [
  {
    q: 'Can I bring my own cup?',
    a: 'Yes. In the U.S. and Canada you can use your own clean, personal cup in the café, at the drive-thru and when you order in the Starbucks app.',
    source: LINKS.reuseSearch,
  },
  {
    q: 'What’s the difference between Blonde, Medium and Dark?',
    a: 'Roast time. Blonde roasts are shorter, lighter-bodied and mellow. Medium roasts are smooth and balanced. Dark roasts have a fuller body and a bold, robust taste.',
    source: LINKS.roastSpectrum,
  },
  {
    q: 'Cold brew, iced coffee or iced Americano?',
    a: 'Cold brew steeps in cold water for about 12 to 20 hours, so it’s smooth and chocolatey. Iced coffee is brewed hot at double strength and poured over ice, so it’s bright. An iced Americano is espresso, water and ice: bold and a little tangy.',
    source: LINKS.icedVsCold,
  },
  {
    q: 'How should I store coffee beans at home?',
    a: 'Airtight and away from light, in a cool place. An opened bag stays at its best for about a week. Grinding right before you brew keeps more of the aroma.',
    source: LINKS.storeBeans,
  },
  {
    q: 'Can I order or pay on this page?',
    a: 'No. This is a concept. Drink orders open on starbucks.com, and products open on the official Starbucks shop, where the prices shown here come from (US prices checked 22 Sep 2026, shown in SAR at the fixed 3.75 rate).',
    source: LINKS.order,
  },
] as const;

export const JOURNAL = [
  {
    title: 'Freshly brewed coffee on demand: how Clover Vertica is changing Starbucks coffeehouses',
    date: '2026-09-22',
    kind: 'Coffee & craft',
    summary: 'A regular since the 1990s on why a cup brewed right before he drinks it keeps him coming back.',
    image: 'machines',
    href: LINKS.clover,
  },
  {
    title: 'Iced Americano, cold brew or iced coffee: what’s the difference?',
    date: '2026-06-10',
    kind: 'Coffee science',
    summary: 'One ingredient, three methods, three very different cups.',
    image: 'b2c3',
    href: LINKS.icedVsCold,
  },
  {
    title: 'How to store coffee beans for the freshest flavor at home',
    date: '2026-05-12',
    kind: 'Coffee science',
    summary: 'Why “airtight and away from light” matters, and when to grind.',
    image: 'bag',
    href: LINKS.storeBeans,
  },
  {
    title: 'Keeping your cup full: how Starbucks is working to save the future of coffee',
    date: '2025-09-24',
    kind: 'Origins',
    summary: 'Inside Hacienda Alsacia, the cupping room and the race to grow more resilient coffee.',
    image: 'cupping',
    href: LINKS.futureOfCoffee,
  },
] as const;

export const SOURCES = [
  ['Drinks, descriptions, calories, caffeine', 'starbucks.com ordering API (the menu page’s own data)', LINKS.menu],
  ['Product names, sizes, prices (USD, shown in SAR at 3.75), product photos', 'shop.starbucks.com product feed', LINKS.shop],
  ['Tasting notes and roast levels', 'Printed on each bag, read from the official product photos', LINKS.shop],
  ['Siren logo', 'SVG served on starbucks.com, geometry unchanged, recolored', 'https://www.starbucks.com/'],
  ['Coffee journey facts', 'about.starbucks.com stories', LINKS.beanToCup],
  ['Editorial photography', 'about.starbucks.com story images, in their real colors', LINKS.about],
] as const;

/** SAR at the fixed peg (1 USD = 3.75 SAR), converted from the official US shop price */
export const SAR_PER_USD = 3.75;
export const fmtPrice = (p: string) => `SAR ${(Number(p) * SAR_PER_USD).toFixed(2)}`;
export const fmtDate = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** duotoned photo files in /public/photos (largest width available) */
export const PHOTOS: Record<string, { src: string; w: number; h: number }> = {
  cherries: { src: '/photos/cherries-1400.webp', w: 1400, h: 933 },
  farm: { src: '/photos/farm-1400.webp', w: 1400, h: 933 },
  carlos: { src: '/photos/carlos-1400.webp', w: 1400, h: 933 },
  machines: { src: '/photos/machines-1400.webp', w: 1400, h: 1867 },
  barista: { src: '/photos/barista-1400.webp', w: 1400, h: 933 },
  cupping: { src: '/photos/cupping-800.webp', w: 800, h: 534 },
  b2c1: { src: '/photos/b2c1-800.webp', w: 800, h: 534 },
  b2c2: { src: '/photos/b2c2-800.webp', w: 800, h: 534 },
  b2c3: { src: '/photos/b2c3-800.webp', w: 800, h: 534 },
  bag: { src: '/products/starbucks-pike-place-roast-1000.webp', w: 1000, h: 1250 },
};
