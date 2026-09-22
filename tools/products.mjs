// Builds src/data/shop.json from the public shop.starbucks.com product feed
// (research/shop.json, fetched 22 Sep 2026) and downloads each product's
// first photo into research/products/.
import fs from 'node:fs';

const feed = JSON.parse(fs.readFileSync('research/shop.json', 'utf8')).products;
const byHandle = Object.fromEntries(feed.map((p) => [p.handle, p]));

// roast levels follow Starbucks' own Roast Spectrum (Blonde / Medium / Dark)
const COFFEE = [
  // notes are read off each bag's own label (research/labels-sheet.jpg)
  ['starbucks-veranda-blend', 'blonde', 'Toasted malt & milk chocolate'],
  ['starbucks-blonde-espresso-roast', 'blonde', 'Candied apple & bittersweet chocolate'],
  ['starbucks-sunsera-blend', 'blonde', 'Bright citrus & toasted almond'],
  ['starbucks-green-apron-blend', 'blonde', 'Honeybell orange & graham cracker'],
  ['starbucks-pike-place-roast', 'medium', 'Cocoa & rich praline'],
  ['starbucks-single-origin-guatemala-antigua', 'medium', 'Cocoa & baking spice'],
  ['starbucks-espresso-roast', 'dark', 'Rich molasses & caramel'],
  ['starbucks-caffe-verona', 'dark', 'Dark cocoa & caramelized sugar'],
  ['starbucks-single-origin-sumatra', 'dark', 'Rich herbs & rustic spice'],
  ['starbucks-1971-roast', 'dark', 'Toasted sugar & rich walnut'],
  ['starbucks-reserve-costa-rica-hacienda-alsacia', 'reserve', null],
];
const GOODS = [
  ['signature-siren-mug', 'mugs'],
  ['starbucks-stainless-steel-soft-touch-tumbler', 'tumblers'],
  ['starbucks-classic-cold-cup', 'cold-cups'],
  ['starbucks-stainless-steel-insulated-sleeve', 'tumblers'],
  ['cheers-mug', 'mugs'],
  ['tumbler-ss-grn-16oz', 'tumblers'],
  ['starbucks-clear-glass-mug', 'mugs'],
  ['starbucks-ceramic-desktop-mug', 'mugs'],
  ['starbucks-pour-over-brewer', 'brewing'],
  ['starbucks-cold-brew-coffee-maker', 'brewing'],
  ['starbucks-coffee-press', 'brewing'],
];

const strip = (h) => (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
fs.mkdirSync('research/products', { recursive: true });

async function build(list, kind) {
  const out = [];
  for (const [handle, group, notes] of list) {
    const p = byHandle[handle];
    if (!p) throw new Error('missing ' + handle);
    const v = p.variants[0];
    const img = p.images[0].src;
    const file = `research/products/${handle}.webp`;
    if (!fs.existsSync(file)) {
      const r = await fetch(img);
      fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    }
    out.push({
      id: handle,
      kind,
      group,
      name: p.title.replace(/\s+/g, ' ').trim(),
      description: strip(p.body_html),
      price: v.price,
      size: v.title.split(' / ').filter((s) => !/purchase|Subscription/i.test(s)).join(' · '),
      notes: notes || null,
      url: `https://www.shop.starbucks.com/products/${handle}`,
      image: `/products/${handle}`,
      source: img,
    });
  }
  return out;
}

const data = {
  market: 'US',
  currency: 'USD',
  source: 'https://www.shop.starbucks.com/products.json',
  fetched: '2026-09-22',
  coffee: await build(COFFEE, 'coffee'),
  goods: await build(GOODS, 'goods'),
};
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/shop.json', JSON.stringify(data, null, 2));
console.log('coffee', data.coffee.length, 'goods', data.goods.length);
