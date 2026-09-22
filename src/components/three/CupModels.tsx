'use client';

import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { LANDED, cupStore } from './cupStore';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  COLOR,
  CUP,
  SLEEVE,
  baseGeometry,
  beanGeometry,
  innerGeometry,
  lidGeometry,
  paintWall,
  rimGeometry,
  wallGeometry,
} from './cupParts';

const damp = THREE.MathUtils.damp;

function useWallTexture(kind: 'cup' | 'sleeve') {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.Texture | null = null;
    const opts =
      kind === 'cup'
        ? { rBot: CUP.rBot, rTop: CUP.rTop, h: CUP.h, base: COLOR.cream, ink: COLOR.green, ground: COLOR.cream, logoD: 1.08, logoV: 0.55, seam: true }
        : { rBot: SLEEVE.rBot, rTop: SLEEVE.rTop, h: SLEEVE.h, base: COLOR.steel, ink: COLOR.steelInk, ground: COLOR.steel, logoD: 1.0, logoV: 0.5, grain: 0.02 };
    paintWall(opts).then((t) => {
      made = t;
      if (alive) setTex(t);
      else t.dispose();
    });
    return () => {
      alive = false;
      made?.dispose();
    };
  }, [kind]);
  return tex;
}

export function Cup() {
  const wallTex = useWallTexture('cup');
  const lid = useRef<THREE.Group>(null);
  const geo = useMemo(
    () => ({
      wall: wallGeometry(CUP.rBot, CUP.rTop, CUP.h),
      inner: innerGeometry(),
      base: baseGeometry(),
      rim: rimGeometry(),
      lid: lidGeometry(),
      coffee: new THREE.CircleGeometry(CUP.rTop - 0.035, 96),
      sip: new THREE.CapsuleGeometry(0.045, 0.2, 6, 16),
    }),
    [],
  );

  useFrame((_, dt) => {
    if (!lid.current) return;
    const g = lid.current;
    const lidOpen = cupStore.lidOpen && cupStore.flight > LANDED;
    g.position.y = damp(g.position.y, lidOpen ? CUP.h + 0.7 : CUP.h, 5, dt);
    g.rotation.x = damp(g.rotation.x, lidOpen ? -0.32 : 0, 5, dt);
    g.position.z = damp(g.position.z, lidOpen ? -0.55 : 0, 5, dt);
  });

  return (
    <group>
      <mesh geometry={geo.wall} castShadow>
        <meshPhysicalMaterial
          key={wallTex ? 'printed' : 'blank'}
          map={wallTex ?? undefined}
          color={wallTex ? '#ffffff' : COLOR.cream}
          roughness={0.62}
          sheen={0.25}
          sheenRoughness={0.8}
          sheenColor={COLOR.cream}
        />
      </mesh>
      <mesh geometry={geo.inner}>
        <meshStandardMaterial color={COLOR.cream} roughness={0.7} side={THREE.BackSide} />
      </mesh>
      <mesh geometry={geo.base}>
        <meshStandardMaterial color={COLOR.cream} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geo.rim} position={[0, CUP.h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color={COLOR.cream} roughness={0.5} />
      </mesh>
      {/* the coffee, seen when the lid lifts: deep green, glossy */}
      <mesh geometry={geo.coffee} position={[0, CUP.h - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color={COLOR.deep} roughness={0.18} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>

      <group ref={lid} position={[0, CUP.h, 0]}>
        <mesh geometry={geo.lid} castShadow>
          <meshPhysicalMaterial
            color={COLOR.cream}
            roughness={0.34}
            clearcoat={0.5}
            clearcoatRoughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* sip opening on the raised ridge, facing the viewer */}
        <mesh geometry={geo.sip} position={[0, 0.247, CUP.rTop - 0.16]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.45]}>
          <meshStandardMaterial color={COLOR.deep} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

export function Sleeve() {
  const tex = useWallTexture('sleeve');
  const g = useRef<THREE.Group>(null);
  const geo = useMemo(
    () => ({
      wall: wallGeometry(SLEEVE.rBot, SLEEVE.rTop, SLEEVE.h),
      inner: wallGeometry(SLEEVE.rBot - 0.03, SLEEVE.rTop - 0.03, SLEEVE.h),
      lip: new THREE.TorusGeometry(SLEEVE.rTop - 0.015, 0.022, 12, 160),
      base: new THREE.CircleGeometry(SLEEVE.rBot, 96),
    }),
    [],
  );
  useFrame((_, dt) => {
    if (!g.current) return;
    const on = cupStore.sleeveOn && cupStore.flight > LANDED;
    g.current.position.y = damp(g.current.position.y, on ? SLEEVE.lift : -4.2, on ? 4.2 : 3.2, dt);
    g.current.visible = g.current.position.y > -4.1;
  });
  return (
    <group ref={g} position={[0, -4.2, 0]}>
      <mesh geometry={geo.wall} castShadow>
        <meshPhysicalMaterial
          key={tex ? 'printed' : 'blank'}
          map={tex ?? undefined}
          color={tex ? '#ffffff' : COLOR.steel}
          metalness={0.55}
          roughness={0.32}
          clearcoat={0.35}
          clearcoatRoughness={0.25}
          anisotropy={0.7}
          anisotropyRotation={Math.PI / 2}
        />
      </mesh>
      <mesh geometry={geo.inner}>
        <meshStandardMaterial color={COLOR.steel} metalness={0.5} roughness={0.4} side={THREE.BackSide} />
      </mesh>
      <mesh geometry={geo.lip} position={[0, SLEEVE.h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={COLOR.steel} metalness={0.6} roughness={0.22} />
      </mesh>
      <mesh geometry={geo.base} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={COLOR.steel} metalness={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
}

const BEANS: [number, number, number, number][] = [
  // x, y, z, phase
  [-1.9, 2.9, -0.6, 0],
  [1.75, 3.4, -0.9, 1.7],
  [2.1, 1.3, 0.4, 3.1],
  [-2.25, 0.9, 0.2, 4.2],
  [-1.2, 3.9, -1.6, 5.3],
  [1.2, 0.35, 1.25, 2.4],
];

export function Beans({ reduced, hideLeft = false }: { reduced: boolean; hideLeft?: boolean }) {
  const geo = useMemo(() => beanGeometry(), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const [x, y, z, p] = BEANS[i];
      m.position.set(x, y + Math.sin(t * 0.6 + p) * 0.12, z);
      m.rotation.set(p + t * 0.15, p * 0.7 + t * 0.22, p * 0.3);
    });
  });
  return (
    <>
      {BEANS.map((b, i) => (
        <mesh
          visible={!(hideLeft && b[0] < 0)}
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          geometry={geo}
          position={[b[0], b[1], b[2]]}
          scale={1.25}
          castShadow
        >
          <meshPhysicalMaterial color={COLOR.bean} roughness={0.38} clearcoat={0.5} clearcoatRoughness={0.35} />
        </mesh>
      ))}
    </>
  );
}

export function Plinth() {
  const geo = useMemo(() => {
    const r = 1.28;
    const b = 0.08;
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, -0.42), new THREE.Vector2(r - b, -0.42)];
    for (let i = 0; i <= 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, -0.42 + b + Math.sin(a) * b));
    }
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2);
      pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, -b + Math.sin(a) * b));
    }
    pts.push(new THREE.Vector2(0, 0));
    return new THREE.LatheGeometry(pts, 128);
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshPhysicalMaterial color={COLOR.cream} roughness={0.85} />
    </mesh>
  );
}

export function Studio() {
  return (
    <>
      <ambientLight intensity={0.45} color={COLOR.cream} />
      <directionalLight position={[-4, 7, 9]} intensity={2.1} color={COLOR.cream} />
      <Environment resolution={256} frames={1}>
        {/* studio: a big soft key, a strip rim, and green bounce from the room */}
        <Lightformer form="rect" intensity={3.6} color={COLOR.cream} position={[-5, 4, 6]} scale={[6, 8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={3.2} color={COLOR.cream} position={[5.5, 3, -2]} scale={[1.2, 9, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.35} color={COLOR.green} position={[0, -3, 3]} scale={[12, 4, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.55} color={COLOR.green} position={[0, 5, -8]} scale={[16, 10, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={1.4} color={COLOR.cream} position={[2, 7, 4]} scale={2.5} target={[0, 0, 0]} />
      </Environment>
    </>
  );
}

/** The receiving surface in the story section: a slim cream disc. */
export function LandingDisc() {
  const geo = useMemo(() => {
    const r = 1.2;
    const h = 0.16;
    const b = 0.05;
    const pts: THREE.Vector2[] = [new THREE.Vector2(0, -h), new THREE.Vector2(r - b, -h)];
    for (let i = 0; i <= 6; i++) {
      const a = -Math.PI / 2 + (i / 6) * Math.PI;
      pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, -h / 2 + Math.sin(a) * (h / 2)));
    }
    pts.push(new THREE.Vector2(0, 0));
    return new THREE.LatheGeometry(pts, 128);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial color={COLOR.cream} roughness={0.8} />
    </mesh>
  );
}

let blobTex: THREE.Texture | null = null;
function blobTexture() {
  if (blobTex) return blobTex;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,59,37,1)');
  grd.addColorStop(0.45, 'rgba(0,59,37,0.55)');
  grd.addColorStop(1, 'rgba(0,59,37,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  blobTex = new THREE.CanvasTexture(c);
  blobTex.colorSpace = THREE.SRGBColorSpace;
  return blobTex;
}

/** Soft contact shadow whose size and strength the flight drives each frame. */
export function BlobShadow({ shadowRef }: { shadowRef: React.RefObject<THREE.Mesh | null> }) {
  const map = useMemo(() => (typeof document === 'undefined' ? null : blobTexture()), []);
  return (
    <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} renderOrder={1}>
      <planeGeometry args={[2.2, 2.2]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} opacity={0} toneMapped={false} />
    </mesh>
  );
}
