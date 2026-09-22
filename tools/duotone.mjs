// Duotones every source photo into the two-colour system.
//
// Luminance is mapped along one ramp:  deep green → #00754A → #F7F5EE.
// "deep green" is #00754A in shadow (a lighting variation, not a new hue).
// The ramp is anchored per image so its flat studio background lands
// exactly on a site colour: green-backed bags become #00754A, white-backed
// goods become #F7F5EE. Cards then sit seamlessly on their section field.
//
//   node tools/duotone.mjs <srcDir> <outDir> [widths=640,1100] [crop=4:5] [zoom=1]
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [srcDir, outDir, widthsArg = '640,1100', cropArg = '', zoomArg = '1'] = process.argv.slice(2);
const zoom = Number(zoomArg);
const GAMMA = Number(process.env.GAMMA || 1);
const widths = widthsArg.split(',').map(Number);

const DEEP = [0, 50, 32];
const GREEN = [0, 117, 74];
const CREAM = [247, 245, 238];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const smooth = (t) => t * t * (3 - 2 * t);

fs.mkdirSync(outDir, { recursive: true });

for (const f of fs.readdirSync(srcDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
  let img = sharp(path.join(srcDir, f)).rotate();
  const meta = await img.metadata();
  if (cropArg) {
    const [cw, ch] = cropArg.split(':').map(Number);
    const W = meta.width, H = meta.height;
    let w = Math.round(W / zoom), h = Math.round((w * ch) / cw);
    if (h > H) { h = H; w = Math.round((H * cw) / ch); }
    img = img.extract({ left: Math.round((W - w) / 2), top: Math.round((H - h) / 2), width: w, height: h });
  }
  const { data, info } = await img.removeAlpha().raw().toBuffer({ resolveWithObject: true });

  // background = mean of the four corner patches
  const patch = (x0, y0) => {
    let s = 0, n = 0;
    for (let y = y0; y < y0 + 12; y++) for (let x = x0; x < x0 + 12; x++) {
      const i = (y * info.width + x) * 3;
      s += lum(data[i], data[i + 1], data[i + 2]); n++;
    }
    return s / n;
  };
  const W = info.width - 14, H = info.height - 14;
  const bg = (patch(2, 2) + patch(W, 2) + patch(2, H) + patch(W, H)) / 4;
  const greenBacked = bg < 140;

  // build a 256-entry LUT
  const lut = new Array(256);
  for (let L = 0; L < 256; L++) {
    let c;
    if (greenBacked) {
      // bg → GREEN; darker → DEEP; lighter → CREAM
      if (L <= bg) c = mix(DEEP, GREEN, smooth(L / bg));
      else c = mix(GREEN, CREAM, Math.min(1, smooth(Math.pow((L - bg) / (240 - bg), GAMMA))));
    } else {
      // bg (and brighter) → CREAM; mid → GREEN; shadows → DEEP
      const white = Math.max(160, bg - 6);
      const t = Math.min(1, L / white);
      c = t < 0.42 ? mix(DEEP, GREEN, smooth(t / 0.42)) : mix(GREEN, CREAM, smooth((t - 0.42) / 0.58));
    }
    lut[L] = c.map((v) => Math.round(v));
  }

  const out = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < data.length; i += 3) {
    const L = Math.round(lum(data[i], data[i + 1], data[i + 2]));
    const c = lut[L];
    out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2];
  }
  const base = f.replace(/\.[^.]+$/, '');
  for (const w of widths) {
    await sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } })
      .resize(w).webp({ quality: 82 }).toFile(path.join(outDir, `${base}-${w}.webp`));
  }
  console.log(base, greenBacked ? 'green' : 'cream', Math.round(bg));
}
