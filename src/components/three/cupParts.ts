// Procedural Starbucks hot cup (grande, 16 fl oz), sip lid, the Insulated
// Sleeve from the shop, and coffee beans. Units: 1 = 50 mm.
//
// Real proportions of a 16 oz hot cup: ~90 mm rim, ~62 mm base, ~137 mm tall.
import * as THREE from 'three';
import { SIREN_PATHS } from '@/components/brand/siren-paths';

export const CUP = { h: 2.74, rTop: 0.9, rBot: 0.62 };
export const SLEEVE = { h: 2.5, rTop: 0.93, rBot: 0.66, lift: -0.06 };

export const COLOR = {
  green: '#00754A',
  cream: '#F7F5EE',
  // light and shadow versions of the same two colours (mixes, not new hues)
  deep: '#003B25', // green at 50% light
  bean: '#005C3A', // green at 79% light
  steel: '#C6DBCD', // cream 80% + green 20%
  steelInk: '#A1C8B5', // cream 65% + green 35%
};

const radiusAt = (v: number, rBot: number, rTop: number) => rBot + (rTop - rBot) * v;

/** Conical wall with UVs: u around (front at u = 0.5), v bottom→top. */
export function wallGeometry(rBot: number, rTop: number, h: number, segments = 160) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const v = i / 24;
    pts.push(new THREE.Vector2(radiusAt(v, rBot, rTop), v * h));
  }
  // phiStart = π puts u = 0.5 on +Z, which faces the camera
  return new THREE.LatheGeometry(pts, segments, Math.PI, Math.PI * 2);
}

/** Inside of the cup plus the base. */
export function innerGeometry() {
  const { h, rTop, rBot } = CUP;
  const t = 0.014; // paper thickness
  const pts = [
    new THREE.Vector2(rTop - t, h),
    new THREE.Vector2(rBot - t, 0.1),
    new THREE.Vector2(0, 0.1),
  ];
  return new THREE.LatheGeometry(pts, 120);
}

export function baseGeometry() {
  const { rBot } = CUP;
  const pts = [
    new THREE.Vector2(0, 0.035),
    new THREE.Vector2(rBot - 0.05, 0.035),
    new THREE.Vector2(rBot - 0.03, 0.0),
    new THREE.Vector2(rBot + 0.002, 0.0),
  ];
  return new THREE.LatheGeometry(pts, 120);
}

/** The rolled paper rim the lid snaps onto. */
export function rimGeometry() {
  return new THREE.TorusGeometry(CUP.rTop + 0.012, 0.03, 16, 160);
}

/**
 * Hot-cup sip lid: a skirt that grips the rim, a raised drinking ridge,
 * and a recessed centre. Profile measured off the familiar white lid.
 */
export function lidGeometry() {
  const r = CUP.rTop;
  const p = (x: number, y: number) => new THREE.Vector2(x, y);
  const pts = [
    p(r - 0.02, -0.1),
    p(r + 0.035, -0.095),
    p(r + 0.05, -0.03),
    p(r + 0.05, 0.03),
    p(r + 0.035, 0.06),
    p(r - 0.03, 0.065),
    p(r - 0.06, 0.08),
    p(r - 0.075, 0.2),
    p(r - 0.1, 0.245),
    p(r - 0.16, 0.255),
    p(r - 0.22, 0.245),
    p(r - 0.245, 0.2),
    p(r - 0.26, 0.13),
    p(r - 0.3, 0.115),
    p(0.3, 0.115),
    p(0.12, 0.125),
    p(0.0, 0.127),
  ];
  const g = new THREE.LatheGeometry(pts, 160);
  g.computeVertexNormals();
  return g;
}

/** Coffee bean: a squashed ellipsoid with the centre crease pressed in. */
export function beanGeometry() {
  const g = new THREE.SphereGeometry(0.16, 40, 28);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.x *= 1;
    v.y *= 0.74;
    v.z *= 0.58;
    if (v.z > 0) {
      const wave = 0.018 * Math.sin(v.y * 16);
      const d = Math.exp(-Math.pow((v.x - wave) / 0.026, 2));
      v.z -= d * 0.055 * (v.z / 0.093);
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function sirenImage(ink: string, ground: string, size: number): Promise<HTMLCanvasElement> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 62" width="${size}" height="${size}"><circle cx="31" cy="31" r="30.002" fill="${ground}"/><path d="${SIREN_PATHS[0]}" fill="${ink}"/></svg>`;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      c.getContext('2d')!.drawImage(img, 0, 0, size, size);
      resolve(c);
    };
    img.onerror = reject;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

/**
 * Paints the wall texture. The logo is laid down one scanline at a time,
 * widened by the local circumference, so it stays a true circle once the
 * flat print wraps around the cone, just like a printed paper blank.
 */
export async function paintWall(opts: {
  rBot: number;
  rTop: number;
  h: number;
  base: string;
  ink: string;
  ground: string;
  logoD: number;
  logoV: number;
  grain?: number;
  seam?: boolean;
}) {
  const W = 2048;
  const H = 1024;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = opts.base;
  g.fillRect(0, 0, W, H);

  // paper / brushed grain: very fine, same two colours
  const grain = opts.grain ?? 0.035;
  if (grain > 0) {
    const img = g.getImageData(0, 0, W, H);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 255 * grain;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
  }

  // side seam at the back of the cup
  if (opts.seam) {
    g.fillStyle = 'rgba(0,59,37,0.06)';
    g.fillRect(0, 0, 10, H);
    g.fillRect(W - 4, 0, 4, H);
  }

  const slant = Math.hypot(opts.h, opts.rTop - opts.rBot);
  const S = 700;
  const siren = await sirenImage(opts.ink, opts.ground, S);
  const half = opts.logoD / 2;
  for (let y = 0; y < H; y++) {
    const v = 1 - y / H;
    const dy = (v - opts.logoV) * slant;
    if (Math.abs(dy) > half) continue;
    const r = radiusAt(v, opts.rBot, opts.rTop);
    const w = (opts.logoD * W) / (2 * Math.PI * r);
    const sy = (0.5 - dy / opts.logoD) * S;
    g.drawImage(siren, 0, Math.max(0, Math.min(S - 1, sy)), S, 1, W / 2 - w / 2, y, w, 1.2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
