// Pulls chosen drinks from starbucks.com's own ordering API (the one the
// menu page calls), keeps name / official description / sizes / calories,
// and downloads each cut-out photo into research/drinks/.
import fs from 'node:fs';

const PICK = [
  // [productNumber, form, group]
  [418, 'hot', 'fall'],
  [2123113, 'iced', 'fall'],
  [40876, 'hot', 'fall'],
  [2123774, 'iced', 'fall'],
  [407, 'hot', 'hot'],
  [409, 'hot', 'hot'],
  [413, 'hot', 'hot'],
  [565, 'hot', 'hot'],
  [2121255, 'iced', 'iced'],
  [2123431, 'iced', 'iced'],
  [2121859, 'iced', 'iced'],
  [413, 'iced', 'iced'],
  [468, 'hot', 'tea'],
  [468, 'iced', 'tea'],
  [466, 'hot', 'tea'],
  [466, 'iced', 'tea'],
];

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36' };
fs.mkdirSync('research/drinks', { recursive: true });
fs.mkdirSync('research/drinks-json', { recursive: true });

const out = [];
for (const [num, form, group] of PICK) {
  const cache = `research/drinks-json/${num}-${form}.json`;
  if (!fs.existsSync(cache)) {
    const r = await fetch(`https://www.starbucks.com/apiproxy/v1/ordering/${num}/${form}`, { headers: UA });
    fs.writeFileSync(cache, await r.text());
  }
  const p = JSON.parse(fs.readFileSync(cache, 'utf8')).products[0];
  const grande = p.sizes.find((s) => s.name === 'Grande') || p.sizes[0];
  const cal = grande?.nutrition?.calories?.displayValue ?? null;
  const fact = (id) => grande?.nutrition?.additionalFacts?.find((f) => f.id === id)?.displayValue?.trim() ?? null;
  const slug = p.imageURL.split('/').pop();
  const file = `research/drinks/${slug}.png`;
  if (!fs.existsSync(file)) {
    const r = await fetch(p.imageURL + '?wid=1200&fmt=png-alpha');
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  }
  out.push({
    id: `${num}-${form}`,
    group,
    name: p.name,
    form: p.formCode,
    description: p.description,
    sizes: p.sizes.map((s) => s.name),
    calories: cal,
    caloriesSize: grande?.name ?? null,
    servingSize: grande?.nutrition?.servingSize?.displayValue?.trim() ?? null,
    caffeine: fact('caffeine'),
    protein: fact('protein'),
    url: `https://www.starbucks.com/menu/product/${num}/${form}`,
    image: `/drinks/${slug}`,
  });
  console.log(group, p.name, cal);
}
fs.writeFileSync('src/data/drinks.json', JSON.stringify({ source: 'https://www.starbucks.com/menu', fetched: '2026-09-22', drinks: out }, null, 2));
