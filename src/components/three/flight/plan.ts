// The cup's flight, planned from the real layout.
//
// Everything here is a pure function of (layout, progress, scroll): no DOM
// reads, no time. The render loop evaluates it every frame; the test harness
// samples it densely to prove the cup never covers protected content.
import * as THREE from 'three';
import { CUP } from '../cupParts';

// ------------------------------------------------------------------ camera
export const FOV = 25;
/** the scrubbed cup may trail the scrolled page by at most this many px */
export const LAG_PX = 110;
/** the lag allowance scales with the screen so small phones keep their free space */
export const lagFor = (vh: number) => Math.min(LAG_PX, Math.round(vh * 0.08));
export const CAM_POS = new THREE.Vector3(0, 2.4, 12);
export const D0 = CAM_POS.length(); // view depth of the hero cup
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));

// ----------------------------------------------------------------- the cup
/** local bounds of cup + lid, origin at the centre of the base */
export const CUP_TOP = CUP.h + 0.26;
export const CUP_R = CUP.rTop + 0.06;
/** tumble pivot: close to the centre of mass */
export const PIVOT = CUP_TOP * 0.47;

// ------------------------------------------------------------------ layout
export type Box = { x: number; y: number; w: number; h: number }; // document px
export type Layout = {
  vw: number;
  vh: number;
  mobile: boolean;
  s1: number; // scroll at which the cup lands
  topSafe: number; // below the floating header
  edge: number; // viewport edge margin
  clear: number; // clearance around protected content
  heroFoot: { x: number; y: number }; // doc point: top of the pedestal, under the cup
  heroPx: number; // cup height on the pedestal
  landFoot: { x: number; y: number }; // doc point: top of the landing disc
  landPx: number;
  gridTop: number; // doc y of the drink grid
  menuHeadTop: number; // doc y of the menu heading / tabs
  menuHeadRight: number; // right edge of the menu heading / tabs
  heroCopyRight: number; // right edge of the hero headline + buttons
  footBottom: number; // doc y of the bottom of the menu CTA row
  corridor: { x0: number; x1: number }; // free vertical band beside the menu
  protect: { name: string; box: Box; fixed?: boolean }[];
};

// ------------------------------------------------------------------ tracks
type Key = { p: number; v: number };
/** Monotone cubic (Fritsch–Carlson): smooth, no overshoot between keys. */
export function track(keys: Key[]) {
  const k = [...keys].sort((a, b) => a.p - b.p);
  const n = k.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((k[i + 1].v - k[i].v) / Math.max(1e-6, k[i + 1].p - k[i].p));
  const m: number[] = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return (p: number) => {
    if (p <= k[0].p) return k[0].v;
    if (p >= k[n - 1].p) return k[n - 1].v;
    let i = 0;
    while (i < n - 2 && p > k[i + 1].p) i++;
    const h = k[i + 1].p - k[i].p;
    const t = (p - k[i].p) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * k[i].v + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * k[i + 1].v + (t3 - t2) * h * m[i + 1]
    );
  };
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// ------------------------------------------------------- screen <-> world
export function makeCamera(vw: number, vh: number) {
  const cam = new THREE.PerspectiveCamera(FOV, vw / vh, 0.1, 120);
  cam.position.copy(CAM_POS);
  cam.lookAt(0, 0, 0);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  return cam;
}
const _v = new THREE.Vector3();
const _f = new THREE.Vector3();
/** the world point seen at screen (px, py) at view depth d */
export function screenToWorld(cam: THREE.Camera, vw: number, vh: number, px: number, py: number, d: number, out = new THREE.Vector3()) {
  _v.set((px / vw) * 2 - 1, -(py / vh) * 2 + 1, 0.5).unproject(cam).sub(cam.position).normalize();
  cam.getWorldDirection(_f);
  return out.copy(cam.position).addScaledVector(_v, d / _v.dot(_f));
}
export function worldToScreen(cam: THREE.Camera, vw: number, vh: number, w: THREE.Vector3) {
  _v.copy(w).project(cam);
  return { x: ((_v.x + 1) / 2) * vw, y: ((1 - _v.y) / 2) * vh };
}
/** world scale that makes the cup `px` tall at view depth d */
export const scaleFor = (px: number, d: number, vh: number) => (px * 2 * d * TAN) / vh / CUP_TOP;

// -------------------------------------------------------------- orientation
const _qx = new THREE.Quaternion();
const _qy = new THREE.Quaternion();
const _qz = new THREE.Quaternion();
const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
/**
 * yaw spins the cup about its own axis (reveals its sides), pitch tumbles it
 * end over end about the screen's horizontal axis, bank leans it into turns.
 * Built from continuous angles every frame, so a 2π pitch is a full turn.
 */
export function orient(pitch: number, yaw: number, bank: number, out = new THREE.Quaternion()) {
  _qy.setFromAxisAngle(Y, yaw);
  _qx.setFromAxisAngle(X, pitch);
  _qz.setFromAxisAngle(Z, bank);
  return out.copy(_qz).multiply(_qx).multiply(_qy);
}

// ------------------------------------------------------------------- plan
export type Pose = {
  center: THREE.Vector3; // world position of the pivot
  quat: THREE.Quaternion;
  rock: number; // settle rock about the base (radians)
  float: number; // 0..1 intensity of the buoyant drift
  dock: 'hero' | 'land' | null;
  heroW: number; // how much the visitor's hero pose still applies
  landW: number;
};

export type Plan = ReturnType<typeof buildPlan>;

const CORNERS = (() => {
  const c: THREE.Vector3[] = [];
  for (const x of [-CUP_R, CUP_R]) for (const y of [0, CUP_TOP]) for (const z of [-CUP_R, CUP_R]) c.push(new THREE.Vector3(x, y - PIVOT, z));
  return c;
})();

export function buildPlan(L: Layout) {
  const cam = makeCamera(L.vw, L.vh);
  const k = scaleFor(L.heroPx, D0, L.vh); // one rigid world size for the whole trip
  const Aland = L.landPx / L.heroPx;
  const dLand = D0 / Aland;
  const lag = lagFor(L.vh); // max px the cup may trail the page

  const pTouch = 0.965; // base meets the disc; the rest is the settle
  const corr = { x0: L.corridor.x0, x1: L.corridor.x1, cx: (L.corridor.x0 + L.corridor.x1) / 2, w: L.corridor.x1 - L.corridor.x0 };

  // --- helpers
  const depthFor = (A: number) => D0 / A;
  const docks = {
    hero: () => {
      const foot = screenToWorld(cam, L.vw, L.vh, L.heroFoot.x, L.heroFoot.y, D0);
      const c = foot.clone().add(new THREE.Vector3(0, PIVOT * k, 0));
      return worldToScreen(cam, L.vw, L.vh, c);
    },
    land: (s: number) => {
      const foot = screenToWorld(cam, L.vw, L.vh, L.landFoot.x, L.landFoot.y - s, dLand);
      const c = foot.clone().add(new THREE.Vector3(0, PIVOT * k, 0));
      return worldToScreen(cam, L.vw, L.vh, c);
    },
  };

  /** screen bbox of the whole transformed cup */
  const q = new THREE.Quaternion();
  const c3 = new THREE.Vector3();
  const w3 = new THREE.Vector3();
  function bbox(cx: number, cy: number, A: number, pitch: number, yaw: number, bank: number) {
    const d = depthFor(A);
    screenToWorld(cam, L.vw, L.vh, cx, cy, d, c3);
    orient(pitch, yaw, bank, q);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const c of CORNERS) {
      w3.copy(c).multiplyScalar(k).applyQuaternion(q).add(c3);
      const s = worldToScreen(cam, L.vw, L.vh, w3);
      x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x); y1 = Math.max(y1, s.y);
    }
    return { x0, y0, x1, y1 };
  }

  /** protected rects on screen at scroll s (fixed ones stay put) */
  const protectAt = (s: number, pad: number) =>
    L.protect.map((r) => ({
      name: r.name,
      x0: r.box.x - pad,
      x1: r.box.x + r.box.w + pad,
      y0: r.box.y - (r.fixed ? 0 : s) - pad,
      y1: r.box.y + r.box.h - (r.fixed ? 0 : s) + pad,
    }));

  type Opts = { pedestal?: boolean; bottom?: boolean };
  const hits = (b: { x0: number; y0: number; x1: number; y1: number }, s: number, pad: number, lagPad = 0, edgePad = 0, o: Opts = {}) => {
    const out: string[] = [];
    for (const r of protectAt(s, pad)) {
      if (r.name === 'pedestal' && !o.pedestal) continue;
      // a cup that trails (or leads) the page by up to `lag` px meets content that far off
      if (b.x1 > r.x0 && b.x0 < r.x1 && b.y1 > r.y0 - lagPad && b.y0 < r.y1 + lagPad) out.push(r.name);
    }
    if (b.x0 < L.edge + edgePad) out.push('viewport-left');
    if (b.x1 > L.vw - L.edge - edgePad) out.push('viewport-right');
    if (b.y0 < L.topSafe + edgePad) out.push('header/top');
    if (o.bottom !== false && b.y1 > L.vh - L.edge - edgePad) out.push('viewport-bottom');
    return out;
  };

  /**
   * Nearest free centre to a preferred one: spirals outward in 10px steps,
   * shrinking the cup a little if nothing fits.
   */
  function solve(p: number, pref: { x: number; y: number }, A: number, rot: [number, number, number], o: Opts = {}) {
    const s = p * L.s1;
    const reach = Math.max(L.vw, L.vh) * 0.7;
    for (let shrink = 0; shrink < 10; shrink++) {
      const a = A * Math.pow(0.92, shrink);
      for (let r = 0; r < reach; r += 8) {
        const steps = r === 0 ? 1 : Math.ceil((2 * Math.PI * r) / 12);
        for (let i = 0; i < steps; i++) {
          const ang = (i / steps) * Math.PI * 2;
          const x = pref.x + Math.cos(ang) * r;
          const y = pref.y + Math.sin(ang) * r * 0.8;
          if (hits(bbox(x, y, a, ...rot), s, L.clear + 10, lag, 10, o).length === 0) return { x, y, A: a };
        }
      }
    }
    return { ...pref, A: A * 0.4 };
  }

  // --- phase boundaries, from where things actually are
  const mob = L.mobile;
  const Abig = L.vw < 700 ? 1 : L.vw < 1100 ? 1.15 : 1.3;
  // is there room for the big tumble beside the menu heading, or must it end before the heading arrives?
  const roomBeside = L.vw - L.edge - L.menuHeadRight - L.clear > L.heroPx * Abig * 0.8;
  const tumbleEnd = roomBeside ? L.gridTop - L.vh * 0.45 : L.menuHeadTop - L.vh * 0.55;
  const pT = Math.min(0.62, Math.max(0.2, tumbleEnd / L.s1)); // tumble done, entering the corridor
  const pC = Math.min(0.9, Math.max(pT + 0.14, (L.footBottom - L.vh * 0.3) / L.s1)); // menu CTA cleared

  // --- choreography (intent; solved densely against the real layout below)
  const H0 = docks.hero();
  // the corridor was made for the cup: fill it
  const Acor = Math.min(1, (corr.w * 0.8) / (L.heroPx * 0.66));
  // phones: the cup rides on its pedestal with the page until there is room
  // above it (the hero text has scrolled away), and only then lifts off
  const pLift = mob ? Math.min(pT * 0.45, Math.max(0, (L.heroFoot.y - L.vh * 0.62) / L.s1)) : 0;
  const f = (x: number) => pLift + x * (pT - pLift);

  type K = { p: number; pref: { x: number; y: number }; A: number; pitch: number; yaw: number; bank: number };
  // desktop: one full end-over-end tumble (pitch). Phones have no room for it,
  // so the cup makes one calm full turn on its own axis instead (yaw).
  const R = mob ? 0 : Math.PI * 2;
  const TY = mob ? Math.PI * 2 : 0;
  // the big moment sits in the middle of the space the hero copy and menu heading leave free
  const freeLeft = Math.max(L.heroCopyRight, roomBeside ? L.menuHeadRight : 0) + L.clear;
  const wantedMid = mob ? L.vw * 0.5 : (freeLeft + L.vw - L.edge) / 2;
  const K: K[] = [
    // 0–10%: lift clear, tilt back, drift aside
    { p: f(0.28), pref: { x: H0.x + (mob ? 10 : 40), y: mob ? H0.y - f(0.28) * L.s1 - L.heroPx * 0.22 : H0.y - L.heroPx * 0.26 }, A: mob ? 1.02 : 1.14, pitch: mob ? -0.1 : -0.2, yaw: mob ? TY * 0.12 : 0.25, bank: mob ? 0.04 : 0.08 },
    // broad arc toward the camera, tumble begins
    { p: f(0.5), pref: { x: wantedMid, y: L.vh * 0.5 }, A: Abig, pitch: mob ? 0.16 : 1.05, yaw: mob ? TY * 0.4 : 0.5, bank: mob ? -0.08 : -0.26 },
    // upside down, receding
    { p: f(0.7), pref: { x: wantedMid + (corr.cx - wantedMid) * 0.3, y: L.vh * 0.5 }, A: (Abig + 1) / 2 + 0.05, pitch: mob ? 0.08 : Math.PI, yaw: mob ? TY * 0.68 : 0.2, bank: mob ? -0.04 : -0.1 },
    // recovering toward upright, steering to the corridor
    { p: f(0.86), pref: { x: wantedMid + (corr.cx - wantedMid) * 0.75, y: L.vh * 0.46 }, A: (1 + Acor) / 2, pitch: mob ? 0.04 : R * 0.82, yaw: mob ? TY * 0.9 : -0.25, bank: mob ? 0.04 : 0.2 },
    // upright, small, beside the grid
    { p: pT, pref: { x: corr.cx, y: L.vh * 0.45 }, A: Acor, pitch: R, yaw: TY - 0.15, bank: 0.04 },
    // gentle S beside the cards
    // straight, calm glide beside the cards (no side-to-side)
    { p: pC, pref: { x: corr.cx, y: L.vh * 0.52 }, A: Acor, pitch: R + 0.04, yaw: TY + 0.15, bank: 0 },
  ];

  // landing approach: arc left and down into the story stage
  const pL1 = pC + (pTouch - pC) * 0.45;
  const pL2 = pC + (pTouch - pC) * 0.8;
  const L1 = docks.land(pL1 * L.s1);
  const L2 = docks.land(pL2 * L.s1);
  K.push(
    { p: pL1, pref: { x: L1.x + (corr.cx - L1.x) * 0.45, y: L1.y - L.landPx * 0.28 }, A: Acor + (Aland - Acor) * 0.7, pitch: R + 0.12, yaw: TY - 0.4, bank: mob ? -0.08 : -0.2 },
    { p: pL2, pref: { x: L2.x, y: L2.y - L.landPx * 0.12 }, A: Aland, pitch: R + 0.04, yaw: TY - 0.08, bank: -0.03 },
  );

  // densify the intent and solve every sample in order, carrying each
  // correction forward so the path bends smoothly around content
  const LT0 = docks.land(pTouch * L.s1);
  // phones: the path starts lift-off from where the pedestal really is at that moment
  const liftStart = pLift > 0 ? [{ p: pLift, pref: { x: H0.x, y: H0.y - pLift * L.s1 }, A: 1, pitch: 0, yaw: 0, bank: 0 }] : [];
  const intentKeys = [{ p: 0, pref: { x: H0.x, y: H0.y }, A: 1, pitch: 0, yaw: 0, bank: 0 }, ...liftStart, ...K, { p: pTouch, pref: { x: LT0.x, y: LT0.y }, A: Aland, pitch: R, yaw: TY, bank: 0 }];
  const I = {
    x: track(intentKeys.map((k) => ({ p: k.p, v: k.pref.x }))),
    y: track(intentKeys.map((k) => ({ p: k.p, v: k.pref.y }))),
    A: track(intentKeys.map((k) => ({ p: k.p, v: k.A }))),
    pitch: track(intentKeys.map((k) => ({ p: k.p, v: k.pitch }))),
    yaw: track(intentKeys.map((k) => ({ p: k.p, v: k.yaw }))),
    bank: track(intentKeys.map((k) => ({ p: k.p, v: k.bank }))),
  };
  const stops = new Set<number>();
  for (let p = K[0].p; p < pL2; p += 0.015) stops.add(+p.toFixed(4));
  for (const k of K) if (k.p < pL2) stops.add(+k.p.toFixed(4));
  const ps = [...stops].sort((a, b) => a - b);
  let carry = { x: 0, y: 0, a: 1 };
  const solved = ps.map((p, i) => {
    const pref = { x: I.x(p) + carry.x, y: I.y(p) + carry.y };
    const rot: [number, number, number] = [I.pitch(p), I.yaw(p), I.bank(p)];
    const A = I.A(p) * carry.a;
    // the pedestal matters on lift-off and whenever the cup is at its depth or deeper (it would be hidden)
    // (in front of it, nearer the camera, it simply slides away behind the cup)
    const r = solve(p, pref, A, rot, { pedestal: A < 1.08 && p < pT, bottom: true });
    carry = { x: (r.x - I.x(p)) * 0.85, y: (r.y - I.y(p)) * 0.85, a: Math.min(1, (r.A / I.A(p)) * 1.15) };
    return { p, x: r.x, y: r.y, A: r.A, pitch: rot[0], yaw: rot[1], bank: rot[2] };
  });
  const pL2k = K[K.length - 1];
  solved.push({ p: pL2, x: pL2k.pref.x, y: pL2k.pref.y, A: pL2k.A, pitch: pL2k.pitch, yaw: pL2k.yaw, bank: pL2k.bank });

  const LT = docks.land(pTouch * L.s1);
  const keys = [
    { p: 0, x: H0.x, y: H0.y, A: 1, pitch: 0, yaw: 0, bank: 0 },
    ...liftStart.map((k) => ({ p: k.p, x: k.pref.x, y: k.pref.y, A: 1, pitch: 0, yaw: 0, bank: 0 })),
    ...solved,
    { p: pTouch, x: LT.x, y: LT.y, A: Aland, pitch: R, yaw: TY, bank: 0 },
    { p: 1, x: LT.x, y: docks.land(L.s1).y, A: Aland, pitch: R, yaw: TY, bank: 0 },
  ];

  // screen y keys are "as seen at that key's own scroll"; near the docks the
  // cup is glued to the real surface instead (see evaluate)
  const L1i = liftStart.length + 1; // index of the first mid-air key
  const build = () => ({
    x: track(keys.map((k) => ({ p: k.p, v: k.x }))),
    y: track(keys.map((k) => ({ p: k.p, v: k.y }))),
    A: track(keys.map((k) => ({ p: k.p, v: k.A }))),
    pitch: track(keys.map((k) => ({ p: k.p, v: k.pitch }))),
    yaw: track(keys.map((k) => ({ p: k.p, v: k.yaw }))),
    bank: track(keys.map((k) => ({ p: k.p, v: k.bank }))),
  });
  let T = build();

  // refine: sample the finished path densely; wherever the cup still touches
  // something between keys, pin a solved key there and rebuild
  for (let round = 0; round < 12; round++) {
    const add: typeof keys = [];
    let last = -1;
    for (let i = 1; i < 1000; i++) {
      const p = i / 1000;
      if (p <= keys[1].p || p >= pL2) continue;
      if (p - last < 0.003) continue;
      const rot: [number, number, number] = [T.pitch(p), T.yaw(p), T.bank(p)];
      const A = T.A(p);
      const o = { pedestal: A < 1.08 && p < pT, bottom: true };
      if (hits(bbox(T.x(p), T.y(p), A, ...rot), p * L.s1, L.clear, lag * 0.5, 8, o).length === 0) continue;
      const r = solve(p, { x: T.x(p), y: T.y(p) }, A, rot, o);
      add.push({ p, x: r.x, y: r.y, A: r.A, pitch: rot[0], yaw: rot[1], bank: rot[2] });
      last = p;
    }
    if (!add.length) break;
    keys.push(...add);
    keys.sort((a, b) => a.p - b.p);
    T = build();
  }

  const heroGlue = (p: number) => 1 - smooth(pLift, pLift + (keys[L1i].p - pLift) * 0.7, p);
  const landGlue = (p: number) => smooth(pL2, pTouch, p);

  /** where the cup's centre is on screen at progress p when the page is at `scroll` */
  function screenPos(p: number, scroll: number) {
    // near a dock the cup blends onto that surface's REAL position on the page
    // (pedestal / disc move with the actual scroll, not the smoothed progress)
    const hg = heroGlue(p);
    const lg = landGlue(p);
    let sx = T.x(p);
    let sy = T.y(p);
    if (hg > 0) {
      sx += (H0.x - sx) * hg;
      sy += (H0.y - scroll - sy) * hg;
    }
    // on the approach, fly relative to where the disc REALLY is (fast scrolling
    // moves it ahead of the smoothed progress), so the cup can't sink into it
    const aw = smooth(pC, pL1, p);
    if (aw > 0 && p < pTouch) {
      const shift = docks.land(scroll).y - docks.land(p * L.s1).y;
      sy += shift * aw;
    }
    if (p >= pTouch) {
      const d = docks.land(scroll);
      sx = d.x;
      sy = d.y;
    } else if (lg > 0) {
      const d = docks.land(scroll);
      sx += (d.x - sx) * lg;
      sy += (d.y - sy) * lg;
    }
    return { sx, sy };
  }

  /** the pose at progress p when the page is actually scrolled to `scroll` */
  function evaluate(p: number, scroll: number, out: Pose): Pose {
    const { sx, sy } = screenPos(p, scroll);
    const A = T.A(p);
    screenToWorld(cam, L.vw, L.vh, sx, sy, depthFor(A), out.center);
    orient(T.pitch(p), T.yaw(p), T.bank(p), out.quat);
    // one tiny damped rock after touchdown, about the base
    const u = clamp01((p - pTouch) / (1 - pTouch));
    out.rock = p > pTouch ? 0.045 * Math.sin(u * Math.PI * 2) * Math.pow(1 - u, 1.4) : 0;
    out.float = smooth(keys[L1i].p * 0.6, keys[L1i + 1].p, p) * (1 - smooth(pL1, pL2, p));
    out.heroW = 1 - smooth(0, 0.03, p);
    out.float *= 1 - heroGlue(p);
    out.landW = smooth(0.985, 1, p);
    out.dock = p < 0.002 ? 'hero' : p > 0.998 ? 'land' : null;
    return out;
  }

  /** test/debug: projected bounds and collisions at p (page at the planned scroll) */
  function sample(p: number, pad = L.clear * 0.6) {
    const s = p * L.s1;
    const { sx: x, sy: y } = screenPos(p, s);
    const b = bbox(x, y, T.A(p), T.pitch(p), T.yaw(p), T.bank(p));
    const floatPad = 6 * (smooth(keys[L1i].p * 0.6, keys[L1i + 1].p, p) * (1 - smooth(pL1, pL2, p)));
    const bb = { x0: b.x0 - floatPad, y0: b.y0 - floatPad, x1: b.x1 + floatPad, y1: b.y1 + floatPad };
    // resting on / rising off the pedestal: glued to the page, may sit below the fold
    const lifting = p < keys[L1i].p;
    // after lift-off the pedestal only matters if the cup is at its depth or behind it
    const h = hits(bb, s, pad, 0, 0, { pedestal: !lifting && T.A(p) < 1 && p < pT, bottom: !lifting });
    return { p, s, bbox: bb, hits: h, center: { x, y }, A: T.A(p) };
  }

  return {
    L,
    k,
    dLand,
    cam,
    pT,
    pC,
    pL1,
    pL2,
    pTouch,
    keys,
    evaluate,
    sample,
    protectAt,
    heroFootWorld: (scroll: number, out: THREE.Vector3) => screenToWorld(cam, L.vw, L.vh, L.heroFoot.x, L.heroFoot.y - scroll, D0, out),
    landFootWorld: (scroll: number, out: THREE.Vector3) => screenToWorld(cam, L.vw, L.vh, L.landFoot.x, L.landFoot.y - scroll, dLand, out),
  };
}
