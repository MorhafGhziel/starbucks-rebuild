'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { COLOR, CUP } from './cupParts';
import { Beans, Cup, Plinth, Sleeve, Studio } from './CupModels';
import { cupStore } from './cupStore';

/*
  One cup, one canvas. The canvas is fixed over the whole viewport and never
  takes pointer input; every frame it reads where the two DOM anchors are and
  places the cup in screen space:

    scroll 0 ............ the cup sits on its plinth in the hero
    lift-off ............ it rises, turns once, shrinks to the right edge
    over the menu ....... it rides along with you, gently bobbing
    landing ............. it grows and settles into "One store", front on

  After landing it simply moves with that section.
*/

const FOV = 25;
const DIST = 12;
const TILT = 0.16; // top of the cup toward the viewer, like a camera slightly above
const CUP_H = CUP.h + 0.26; // with the lid

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;
const damp = THREE.MathUtils.damp;

type Frame = { cx: number; bottom: number; h: number };

function Rig({ reduced }: { reduced: boolean }) {
  const { size } = useThree();
  const narrow = size.width < 900;
  const cup = useRef<THREE.Group>(null);
  const turn = useRef<THREE.Group>(null);
  const base = useRef<THREE.Group>(null);
  const land = useRef<THREE.Group>(null);
  const anchors = useRef<{ hero: HTMLElement | null; brand: HTMLElement | null }>({ hero: null, brand: null });
  const born = useRef<number | null>(null);

  useFrame(({ clock }, dt) => {
    const a = anchors.current;
    if (!a.hero?.isConnected) a.hero = document.querySelector('[data-cup-anchor="hero"]');
    if (!a.brand?.isConnected) a.brand = document.querySelector('[data-cup-anchor="brand"]');
    if (!a.hero || !a.brand || !cup.current || !turn.current || !base.current || !land.current) return;

    const vw = size.width;
    const vh = size.height;
    const ppw = (2 * DIST * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / vh; // world units per CSS px at z = 0
    const wx = (px: number) => (px - vw / 2) * ppw;
    const wy = (py: number) => -(py - vh / 2) * ppw;
    const s = window.scrollY;
    const mobile = vw < 900;

    const hr = a.hero.getBoundingClientRect();
    const br = a.brand.getBoundingClientRect();

    // hero: cup on the plinth (hero frame measured as if unscrolled: the cup floats)
    const heroH = hr.height * (mobile ? 0.6 : 0.58);
    const heroLive: Frame = { cx: hr.left + hr.width / 2, bottom: hr.top + hr.height * 0.8, h: heroH };
    const H: Frame = { ...heroLive, bottom: heroLive.bottom + s };

    // landing: centred in the "One store" anchor
    const landH = br.height * (mobile ? 0.62 : 0.66);
    const brLive: Frame = { cx: br.left + br.width / 2, bottom: br.top + br.height / 2 + landH / 2, h: landH };
    const s1 = Math.max(1, br.top + s - (vh - br.height) / 2);
    const B: Frame = { ...brLive, bottom: vh / 2 + landH / 2 };

    // the lane down the right edge
    const laneH = mobile ? Math.min(vh * 0.2, 150) : Math.min(Math.max(vh * 0.32, 150), 300);
    const gutter = Math.min(Math.max(vw * 0.05, 20), 72);
    const L: Frame = { cx: vw - gutter - laneH * (mobile ? 0.2 : 0.32), bottom: vh * 0.56 + laneH / 2, h: laneH };

    const t = clamp01(s / s1);
    cupStore.flight = t;

    let f: Frame;
    let lane = 0;
    let turns = 0;
    if (reduced) {
      // no travel: the cup belongs to whichever section is nearer
      f = t < 0.5 ? heroLive : brLive;
    } else if (s >= s1) {
      f = brLive;
      turns = 2;
    } else {
      const up = smooth(0, 0.3, t);
      const side = smooth(0, 0.16, t); // clear the plinth sideways first
      const down = smooth(0.7, 1, t);
      lane = up * (1 - down);
      // a small hop off the plinth as the trip starts
      const hop = Math.sin(Math.PI * clamp01(t / 0.22)) * H.h * 0.22;
      // H is the hero spot as seen at the top of the page, so the cup stays put while the hero scrolls away
      const mid: Frame = { cx: lerp(H.cx, L.cx, side), bottom: lerp(H.bottom, L.bottom, up) - hop, h: lerp(H.h, L.h, up) };
      f = { cx: lerp(mid.cx, B.cx, down), bottom: lerp(mid.bottom, B.bottom, down), h: lerp(mid.h, B.h, down) };
      turns = up + down;
    }

    // entrance on first load (rise + unwind), only while at the top
    if (born.current === null) born.current = clock.elapsedTime;
    const age = clock.elapsedTime - born.current;
    const e = reduced ? 1 : 1 - Math.pow(1 - Math.min(1, age / 1.25), 4);

    const k = (f.h * ppw) / CUP_H;
    const bob = lane * Math.sin(clock.elapsedTime * 1.4) * 8;
    cup.current.position.set(wx(f.cx), wy(f.bottom + bob) - (1 - e) * 1.2 * k, 0);
    cup.current.scale.setScalar(k);
    cup.current.rotation.set(TILT, 0, lane * Math.sin(clock.elapsedTime * 0.9) * 0.08 + lane * -0.12);

    // yaw: visitor's turn + one full turn per leg of the trip + idle sway at rest in the hero
    let target = cupStore.yaw + turns * Math.PI * 2 - (1 - e) * 2.4;
    if (!cupStore.touched && !reduced && t < 0.01) target += Math.sin(clock.elapsedTime * 0.45) * 0.38;
    turn.current.rotation.y = damp(turn.current.rotation.y, target, 6, dt);

    // plinth + beans stay in the hero and scroll away with it
    // once the cup leaves, the plinth drops back in depth (size-compensated, so it
    // looks unchanged) and scrolls away behind the cup instead of through it
    const zb = reduced ? 0 : -3 * smooth(0, 0.02, t);
    const depth = (DIST - zb) / DIST;
    const kh = (heroLive.h * ppw) / CUP_H;
    base.current.position.set(wx(heroLive.cx) * depth, wy(heroLive.bottom) * depth, zb);
    base.current.scale.setScalar(kh * depth);
    base.current.rotation.set(TILT, 0, 0);
    base.current.visible = hr.bottom > -40;

    // landing shadow travels with "One store"
    const kb = (brLive.h * ppw) / CUP_H;
    land.current.position.set(wx(brLive.cx), wy(brLive.bottom), 0);
    land.current.scale.setScalar(kb);
    land.current.rotation.set(TILT, 0, 0);
    land.current.visible = t > 0.6 && br.bottom > -40 && br.top < vh + 40;
  });

  return (
    <>
      <group ref={base}>
        <Plinth />
        <ContactShadows position={[0, 0.004, 0]} opacity={0.5} scale={2.8} blur={2.2} far={2.4} resolution={512} color={COLOR.deep} />
        <Beans reduced={reduced} hideLeft={narrow} />
      </group>
      <group ref={land}>
        <ContactShadows position={[0, -0.07, 0]} opacity={0.42} scale={4} blur={2.6} far={2.4} resolution={512} color={COLOR.deep} />
      </group>
      <group ref={cup}>
        <group ref={turn}>
          <Cup />
          <Sleeve />
        </group>
      </group>
    </>
  );
}

export default function FlightScene({ active, reduced, onReady }: { active: boolean; reduced: boolean; onReady: () => void }) {
  const ready = useRef(false);
  return (
    <Canvas
      className="cup-flight"
      style={{ pointerEvents: 'none' }}
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ fov: FOV, position: [0, 0, DIST], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, powerPreference: 'high-performance' }}
      onCreated={() => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (ready.current) return;
            ready.current = true;
            onReady();
          }),
        );
      }}
    >
      <Studio />
      <Rig reduced={reduced} />
    </Canvas>
  );
}
