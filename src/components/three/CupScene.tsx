'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
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

export type CupControl = {
  /** target yaw in radians; the scene eases toward it */
  yaw: number;
  /** true once the visitor has touched the cup (stops the idle sway) */
  touched: boolean;
};

export type CupSceneProps = {
  mode: 'hero' | 'inspect';
  control: React.RefObject<CupControl>;
  lidOpen?: boolean;
  sleeveOn?: boolean;
  active: boolean;
  reduced: boolean;
  onReady?: () => void;
};

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

function Cup({ lidOpen }: { lidOpen: boolean }) {
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

function Sleeve({ on }: { on: boolean }) {
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

function Beans({ reduced }: { reduced: boolean }) {
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

function Plinth() {
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

function Rig({ mode, control, reduced, lidOpen, sleeveOn, onReady }: Omit<CupSceneProps, 'active'>) {
  const turn = useRef<THREE.Group>(null);
  const lift = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);
  const readied = useRef(false);

  useFrame(({ clock }, dt) => {
    if (!turn.current || !lift.current) return;
    if (born.current === null) born.current = clock.elapsedTime;
    const age = clock.elapsedTime - born.current;
    if (!readied.current && age > 0.05) {
      readied.current = true;
      onReady?.();
    }
    // entrance: rise and unwind (skipped with reduced motion)
    const k = reduced ? 1 : Math.min(1, age / 1.25);
    const e = 1 - Math.pow(1 - k, 4);
    lift.current.position.y = (1 - e) * -1.2;
    const c = control.current!;
    let target = c.yaw;
    if (!c.touched && !reduced && mode === 'hero') target += Math.sin(clock.elapsedTime * 0.45) * 0.38;
    const intro = (1 - e) * -2.4;
    turn.current.rotation.y = damp(turn.current.rotation.y, target + intro, 5.5, dt);
  });

  return (
    <group ref={lift}>
      <group ref={turn}>
        <Cup lidOpen={!!lidOpen} />
        {mode === 'inspect' && <Sleeve on={!!sleeveOn} />}
      </group>
      {mode === 'hero' && <Beans reduced={reduced} />}
    </group>
  );
}

export default function CupScene(props: CupSceneProps) {
  const { mode, active } = props;
  const hero = mode === 'hero';
  return (
    <Canvas
      className="cup-canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      shadows
      camera={hero ? { fov: 25, position: [0, 3.9, 11.4] } : { fov: 24, position: [0, 5.2, 11] }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.NeutralToneMapping, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => camera.lookAt(0, hero ? 1.45 : 1.55, 0)}
    >
      <ambientLight intensity={0.45} color={COLOR.cream} />
      <directionalLight
        position={[-4, 7, 5]}
        intensity={2.1}
        color={COLOR.cream}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={6}
        shadow-camera-bottom={-2}
      />
      <Environment resolution={256} frames={1}>
        {/* studio: a big soft key, a strip rim, and green bounce from the room */}
        <Lightformer form="rect" intensity={3.6} color={COLOR.cream} position={[-5, 4, 6]} scale={[6, 8, 1]} target={[0, 1.5, 0]} />
        <Lightformer form="rect" intensity={3.2} color={COLOR.cream} position={[5.5, 3, -2]} scale={[1.2, 9, 1]} target={[0, 1.5, 0]} />
        <Lightformer form="rect" intensity={0.35} color={COLOR.green} position={[0, -3, 3]} scale={[12, 4, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={0.55} color={COLOR.green} position={[0, 5, -8]} scale={[16, 10, 1]} target={[0, 1, 0]} />
        <Lightformer form="ring" intensity={1.4} color={COLOR.cream} position={[2, 7, 4]} scale={2.5} target={[0, 1, 0]} />
      </Environment>

      <Rig {...props} />

      {hero ? (
        <>
          <Plinth />
          <ContactShadows position={[0, 0.002, 0]} opacity={0.5} scale={2.8} blur={2.2} far={2.6} resolution={512} color={COLOR.deep} />
        </>
      ) : (
        <ContactShadows position={[0, -0.07, 0]} opacity={0.42} scale={5} blur={2.6} far={3} resolution={512} color={COLOR.deep} />
      )}
    </Canvas>
  );
}
