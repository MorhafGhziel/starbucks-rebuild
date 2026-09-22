// Real-colour versions of every image (same filenames/crops as the duotone set).
// Products keep their true colours; only the flat studio background is moved
// onto the site colour, so each tile still sits seamlessly on its field.
//
// Background match: a pixel p that is (almost) a scaled copy of the backdrop b
// — backdrop in light or shadow — becomes the same scale of the target colour.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const GREEN = [0, 117, 74];
const CREAM = [247, 245, 238];

async function crop(file, ratio, zoom) {
  let img = sharp(file).rotate();
  const m = await img.metadata();
  if (ratio) {
    const [cw, ch] = ratio;
    let w = Math.round(m.width / zoom), h = Math.round((w * ch) / cw);
    if (h > m.height) { h = m.height; w = Math.round((m.height * cw) / ch); }
    img = img.extract({ left: Math.round((m.width - w) / 2), top: Math.round((m.height - h) / 2), width: w, height: h });
  }
  return img.removeAlpha().raw().toBuffer({ resolveWithObject: true });
}

function backdrop(data, info) {
  const W = info.width, H = info.height, acc = [0, 0, 0];
  let n = 0;
  for (const [x0, y0] of [[2, 2], [W - 14, 2], [2, H - 14], [W - 14, H - 14]])
    for (let y = y0; y < y0 + 12; y++) for (let x = x0; x < x0 + 12; x++) {
      const i = (y * W + x) * 3;
      acc[0] += data[i]; acc[1] += data[i + 1]; acc[2] += data[i + 2]; n++;
    }
  return acc.map((v) => v / n);
}

function rebase(data, b, target, { minK = 0, tol = 0.06, soft = 0.1 } = {}) {
  const bb = b[0] * b[0] + b[1] * b[1] + b[2] * b[2];
  const bl = Math.sqrt(bb);
  for (let i = 0; i < data.length; i += 3) {
    const p = [data[i], data[i + 1], data[i + 2]];
    const k = (p[0] * b[0] + p[1] * b[1] + p[2] * b[2]) / bb;
    if (k < minK || k > 1.35) continue;
    const r = Math.hypot(p[0] - k * b[0], p[1] - k * b[1], p[2] - k * b[2]) / (bl * Math.max(k, 0.05));
    const w = r <= tol ? 1 : r >= tol + soft ? 0 : 1 - (r - tol) / soft;
    if (!w) continue;
    for (let c = 0; c < 3; c++) data[i + c] = Math.round(Math.min(255, p[c] + w * (k * target[c] - p[c])));
  }
}

async function run(srcDir, outDir, widths, ratio, zoom, opts = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of fs.readdirSync(srcDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
    const { data, info } = await crop(path.join(srcDir, f), ratio, zoom);
    if (opts.rebase) {
      const b = backdrop(data, info);
      const light = (b[0] + b[1] + b[2]) / 3 > 140;
      rebase(data, b, light ? CREAM : GREEN, light ? { minK: 0.8, tol: 0.03, soft: 0.05 } : {});
    }
    const base = f.replace(/\.[^.]+$/, '');
    for (const w of widths) {
      if (w > info.width * 1.05 && w !== widths[0] && !opts.rebase) continue;
      await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
        .resize({ width: Math.min(w, info.width) }).webp({ quality: 84 }).toFile(path.join(outDir, `${base}-${w}.webp`));
    }
    console.log(outDir, base);
  }
}

await run('research/bags', 'public/products', [560, 1000], [4, 5], 1.7, { rebase: true });
await run('research/goods', 'public/products', [560, 1000], [4, 5], 1.3, { rebase: true });
await run('research/drinks', 'public/drinks', [480, 900], [4, 5], 1.75, { rebase: true });
await run('research/photos', 'public/photos', [800, 1400], null, 1);
