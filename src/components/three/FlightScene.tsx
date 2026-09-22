'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BlobShadow, Beans, Cup, LandingDisc, Plinth, Sleeve, Studio } from './CupModels';
import { cupStore } from './cupStore';
import { measureLayout } from './flight/measure';
import { CAM_POS, FOV, PIVOT, buildPlan, clamp01, smooth, type Plan, type Pose } from './flight/plan';

gsap.registerPlugin(ScrollTrigger);

/*
  Ownership of transforms (nothing else writes these):

    place   position = pivot on the planned path, scale = the cup's one rigid size
    orient  quaternion = authored tumble · bank · yaw  (+ the visitor's yaw when docked)
    float   small additive drift and rock, strongest mid-flight, zero when docked
    base    moves the model so the pivot sits at its centre of mass
    settle  the one tiny rock after touchdown, hinged at the base

  GSAP ScrollTrigger owns `progress` (scrubbed); the render loop owns the rest.
*/

const LAG_PX = 48; // the scrubbed cup may trail the page by at most this much

type Shared = { plan: Plan | null; tween: gsap.core.Tween | null; proxy: { p: number } };

function Rig({ reduced, still, debug, onReady }: { reduced: boolean; still: boolean; debug: boolean; onReady: () => void }) {
  const place = useRef<THREE.Group>(null);
  const orient = useRef<THREE.Group>(null);
  const float = useRef<THREE.Group>(null);
  const settle = useRef<THREE.Group>(null);
  const pedestal = useRef<THREE.Group>(null);
  const landing = useRef<THREE.Group>(null);
  const shadowHero = useRef<THREE.Mesh>(null);
  const shadowLand = useRef<THREE.Mesh>(null);
  const shared = useRef<Shared>({ plan: null, tween: null, proxy: { p: 0 } });
  const pose = useRef<Pose>({ center: new THREE.Vector3(), quat: new THREE.Quaternion(), rock: 0, float: 0, dock: 'hero', heroW: 1, landW: 0 });
  const readied = useRef(false);

  // the pedestal never occludes the cup (it only ever sits below it): draw it
  // first and without depth writes, so a passing cup always reads in front
  useEffect(() => {
    pedestal.current?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (!m || (o as THREE.Mesh).geometry?.type === 'PlaneGeometry') return;
      m.depthWrite = false;
      o.renderOrder = -1;
    });
  }, []);

  // --- measure, plan, and bind progress to scroll
  useEffect(() => {
    const S = shared.current;
    const replan = () => {
      const L = measureLayout();
      if (L) S.plan = buildPlan(L);
      return S.plan?.L.s1 ?? 1;
    };
    replan();
    S.proxy.p = clamp01(window.scrollY / (S.plan?.L.s1 ?? 1)); // refresh mid-page: start where the page is
    S.tween = gsap.to(S.proxy, {
      p: 1,
      ease: 'none',
      scrollTrigger: {
        start: 0,
        end: () => replan(), // re-measured on every ScrollTrigger refresh
        scrub: reduced ? true : 0.6,
        invalidateOnRefresh: true,
      },
    });

    // layout changes ScrollTrigger doesn't see on its own (fonts, images, grid swaps)
    let t = 0;
    const later = () => {
      clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 180);
    };
    const ro = new ResizeObserver(later);
    ro.observe(document.body);
    document.fonts?.ready.then(later);
    window.addEventListener('load', later);

    if (debug) (window as unknown as { __flight: unknown }).__flight = { get plan() { return S.plan; }, get p() { return S.proxy.p; } };

    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener('load', later);
      S.tween?.scrollTrigger?.kill();
      S.tween?.kill();
    };
  }, [reduced, debug]);

  const scratch = useRef({ qUser: new THREE.Quaternion(), Y: new THREE.Vector3(0, 1, 0), up: new THREE.Vector3(), down: new THREE.Vector3(), base: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3() });

  useFrame(({ clock }, dt) => {
    const S = shared.current;
    const plan = S.plan;
    if (!plan || !place.current || !orient.current || !float.current || !settle.current || !pedestal.current || !landing.current) return;
    const L = plan.L;
    const X = scratch.current;
    const scroll = window.scrollY;

    // progress: scrubbed by GSAP, but never more than LAG_PX from the page,
    // so fast scrolling can't slide content under a trailing cup
    const raw = clamp01(scroll / L.s1);
    const lag = LAG_PX / L.s1;
    let p = Math.min(raw + lag, Math.max(raw - lag, S.proxy.p));
    if (reduced) p = raw < 0.5 ? 0 : 1;
    cupStore.flight = p;

    const P = plan.evaluate(p, scroll, pose.current);
    const k = plan.k;

    // (no intro move: the 3D cup takes over from the poster in the poster's exact pose)

    // --- the visitor's yaw applies only when docked; mid-flight it relaxes to a whole turn
    const docked = P.heroW + P.landW;
    if (docked < 0.01) {
      const home = Math.round(cupStore.yaw / (Math.PI * 2)) * Math.PI * 2;
      cupStore.yaw = THREE.MathUtils.damp(cupStore.yaw, home, 3, dt);
    }
    let userYaw = cupStore.yaw * docked;
    if (!cupStore.touched && !reduced && !still) userYaw += Math.sin(clock.elapsedTime * 0.45) * 0.38 * P.heroW;

    place.current.position.copy(P.center);
    place.current.scale.setScalar(k);
    X.qUser.setFromAxisAngle(X.Y, userYaw);
    orient.current.quaternion.copy(P.quat).multiply(X.qUser);

    // buoyancy: a few px of drift and ~1.5° of rock, mid-flight only
    const t = clock.elapsedTime;
    const pxWorld = (2 * P.center.distanceTo(CAM_POS) * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / L.vh / k;
    float.current.position.set(Math.sin(t * 0.7) * 3 * pxWorld * P.float, Math.sin(t * 1.3) * 4 * pxWorld * P.float, 0);
    float.current.rotation.set(Math.sin(t * 1.05) * 0.02 * P.float, 0, Math.sin(t * 0.8 + 1) * 0.026 * P.float);
    settle.current.rotation.x = P.rock;

    // --- the hero pedestal and the landing disc are glued to the page
    plan.heroFootWorld(scroll, pedestal.current.position);
    pedestal.current.scale.setScalar(k);
    pedestal.current.visible = L.heroFoot.y - scroll > -300;
    plan.landFootWorld(scroll, landing.current.position);
    landing.current.scale.setScalar(k);
    const landY = L.landFoot.y - scroll;
    landing.current.visible = landY > -300 && landY < L.vh + 300;

    // contact shadows tighten and darken as the base nears a surface
    X.down.set(0, -PIVOT * k, 0).applyQuaternion(orient.current.quaternion);
    X.base.copy(place.current.position).add(X.down);
    const upright = Math.max(0, X.up.set(0, 1, 0).applyQuaternion(orient.current.quaternion).y);
    const contact = (surface: THREE.Vector3, mesh: THREE.Mesh | null) => {
      if (!mesh) return;
      const gap = Math.max(0, (X.base.y - surface.y) / k);
      const off = X.a.copy(X.base).setY(0).distanceTo(X.b.copy(surface).setY(0)) / k;
      const near = 1 - smooth(0, 1.6, gap + off);
      (mesh.material as THREE.MeshBasicMaterial).opacity = 0.62 * near * (0.35 + 0.65 * upright);
      mesh.scale.setScalar(0.85 + gap * 0.5);
    };
    contact(pedestal.current.position, shadowHero.current);
    contact(landing.current.position, shadowLand.current);

    if (!readied.current) {
      readied.current = true;
      requestAnimationFrame(() => onReady());
    }
    if (debug) drawDebug(plan, p, scroll);
  });

  return (
    <>
      <group ref={pedestal}>
        <Plinth />
        <BlobShadow shadowRef={shadowHero} />
        <Beans reduced={reduced || still} />
      </group>
      <group ref={landing}>
        <LandingDisc />
        <BlobShadow shadowRef={shadowLand} />
      </group>
      <group ref={place}>
        <group ref={orient}>
          <group ref={float}>
            <group position={[0, -PIVOT, 0]}>
              <group ref={settle}>
                <Cup />
                <Sleeve />
              </group>
            </group>
          </group>
        </group>
      </group>
    </>
  );
}

// ------------------------------------------------------- development guides
let dbg: HTMLCanvasElement | null = null;
function drawDebug(plan: Plan, p: number, scroll: number) {
  if (!dbg) {
    dbg = document.createElement('canvas');
    Object.assign(dbg.style, { position: 'fixed', inset: '0', zIndex: '35', pointerEvents: 'none' });
    document.body.appendChild(dbg);
  }
  const L = plan.L;
  dbg.width = L.vw;
  dbg.height = L.vh;
  const g = dbg.getContext('2d')!;
  g.clearRect(0, 0, L.vw, L.vh);
  g.lineWidth = 1.5;
  g.font = '12px monospace';
  for (const r of plan.protectAt(scroll, 0)) {
    g.fillStyle = 'rgba(255,0,80,0.10)';
    g.strokeStyle = 'rgba(255,0,80,0.8)';
    g.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
    g.strokeRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
    g.fillStyle = 'rgba(255,0,80,1)';
    g.fillText(r.name, r.x0 + 4, r.y0 + 14);
  }
  g.strokeStyle = 'rgba(0,160,255,0.9)';
  g.setLineDash([6, 6]);
  g.strokeRect(L.corridor.x0, 0, L.corridor.x1 - L.corridor.x0, L.vh);
  g.setLineDash([]);
  g.fillStyle = 'rgba(255,200,0,0.9)';
  for (let i = 0; i <= 200; i++) {
    const s = plan.sample(i / 200);
    g.fillRect(s.center.x - 1.5, s.center.y - 1.5, 3, 3);
  }
  const cur = plan.sample(p);
  g.strokeStyle = cur.hits.length ? 'red' : 'lime';
  g.lineWidth = 2;
  g.strokeRect(cur.bbox.x0, cur.bbox.y0, cur.bbox.x1 - cur.bbox.x0, cur.bbox.y1 - cur.bbox.y0);
  g.fillStyle = 'cyan';
  g.beginPath();
  g.arc(L.landFoot.x, L.landFoot.y - scroll, 6, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'black';
  g.fillRect(8, L.vh - 30, 460, 22);
  g.fillStyle = 'white';
  g.fillText(`p ${p.toFixed(3)}  pT ${plan.pT.toFixed(2)}  pC ${plan.pC.toFixed(2)}  ${cur.hits.join(', ')}`, 14, L.vh - 14);
}

export default function FlightScene({ reduced, still = false, active, onReady, debug }: { reduced: boolean; still?: boolean; active: boolean; onReady: () => void; debug: boolean }) {
  return (
    <Canvas
      className="cup-flight"
      style={{ pointerEvents: 'none' }}
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{ fov: FOV, position: CAM_POS.toArray() as [number, number, number], near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <Studio />
      <Rig reduced={reduced} still={still} debug={debug} onReady={onReady} />
    </Canvas>
  );
}
