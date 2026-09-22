// Duotones editorial photos (research/photos → public/photos).
// Levels are stretched per image (1st–99th percentile) so every photo uses
// the full ramp:  deep green (shadow) → #00754A → #F7F5EE (highlight).
import sharp from 'sharp';
import fs from 'node:fs';

const DEEP = [0, 46, 29];
const GREEN = [0, 117, 74];
const CREAM = [247, 245, 238];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const smooth = (t) => t * t * (3 - 2 * t);
const MID = 0.3;

const src = 'research/photos';
const out = 'public/photos';
fs.mkdirSync(out, { recursive: true });

for (const f of fs.readdirSync(src).filter((f) => f.endsWith('.jpg'))) {
  const base = f.replace('.jpg', '');
  const { data, info } = await sharp(`${src}/${f}`).rotate().greyscale().raw().toBuffer({ resolveWithObject: true });
  const hist = new Array(256).fill(0);
  for (const v of data) hist[v]++;
  const pct = (p) => {
    let acc = 0;
    const target = data.length * p;
    for (let i = 0; i < 256; i++) if ((acc += hist[i]) >= target) return i;
    return 255;
  };
  const lo = pct(0.01), hi = pct(0.99);
  const lut = [];
  for (let L = 0; L < 256; L++) {
    const t = Math.pow(Math.min(1, Math.max(0, (L - lo) / Math.max(1, hi - lo))), 0.8);
    lut[L] = (t < MID ? mix(DEEP, GREEN, smooth(t / MID)) : mix(GREEN, CREAM, smooth((t - MID) / (1 - MID)))).map(Math.round);
  }
  const rgb = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < data.length; i++) {
    const c = lut[data[i]];
    rgb[i * 3] = c[0]; rgb[i * 3 + 1] = c[1]; rgb[i * 3 + 2] = c[2];
  }
  for (const w of [800, 1400]) {
    if (w > info.width * 1.05 && w !== 800) continue;
    await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
      .resize({ width: Math.min(w, info.width) })
      .webp({ quality: 80 })
      .toFile(`${out}/${base}-${w}.webp`);
  }
  console.log(base, info.width, info.height, lo, hi);
}
