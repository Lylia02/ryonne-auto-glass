'use client';
/* =========================================================
   "Clear ahead" — WebGL scene (loaded on demand by <ShiftCinema>).
   A car drives down an empty road at blue hour, through low mist.
   The road keeps moving under it (speed); the scroll decides where
   the car is: it comes up toward the camera, then pulls away into
   the distance (progress ref 0 → 1).
   ========================================================= */
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { applyPaint, useCarModel } from '@/lib/useCar';
import { diagnose } from '@/lib/site';
import { rigWheels } from '@/lib/wheels';

type Props = { progress: React.RefObject<number>; active: boolean; onReady: () => void };

const LENGTH = 4.4;
const HAZE = '#1e3044';          // fog colour = sky colour at the horizon
const HORIZON = .4;              // horizon height on screen (0 = top), matches the camera tilt below
const windowGlass = new THREE.MeshPhysicalMaterial({ color: '#07090d', roughness: .05, metalness: .2, transparent: true, opacity: .7, envMapIntensity: 1.5, clearcoat: 1 });

/* ---------- canvas textures ---------- */
const canvas = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
  const el = document.createElement('canvas'); el.width = w; el.height = h;
  draw(el.getContext('2d')!);
  const t = new THREE.CanvasTexture(el); t.colorSpace = THREE.SRGBColorSpace; return t;
};

// dusk sky + tree line, drawn in screen space (scene.background)
function skyTexture() {
  return canvas(2048, 1024, c => {
    const H = 1024, hy = H * HORIZON;
    const g = c.createLinearGradient(0, 0, 0, H);
    // blue hour: deep night at the top, an icy glow on the horizon (Ryonne's glass blue)
    g.addColorStop(0, '#04060c'); g.addColorStop(.16, '#0a1324'); g.addColorStop(.3, '#1b3352');
    g.addColorStop(HORIZON - .02, '#7fa9d1'); g.addColorStop(HORIZON + .01, HAZE); g.addColorStop(1, '#06080d');
    c.fillStyle = g; c.fillRect(0, 0, 2048, H);
    // city glow far down the road
    const r = c.createRadialGradient(1024, hy, 10, 1024, hy, 760);
    r.addColorStop(0, 'rgba(170,215,255,.4)'); r.addColorStop(1, 'rgba(170,215,255,0)');
    c.fillStyle = r; c.fillRect(0, 0, 2048, H);
    // tree line in two layers: a far one, soft and hazy, and a near one, darker and sharper
    const ridge = (seed: number, height: number, rough: number) => (x: number) => {
      const edge = Math.abs(x - 1024) / 1024;
      let n = 0, amp = 1, f = .004;
      for (let o = 0; o < 6; o++) { n += Math.sin(x * f + seed * (o + 1) * 1.7) * amp; amp *= .55; f *= 2.1; }
      return height * (.25 + Math.pow(edge, 1.5)) + n * rough * (.5 + edge);
    };
    const layer = (fill: string, blur: number, h: (x: number) => number) => {
      c.save(); c.filter = `blur(${blur}px)`; c.fillStyle = fill;
      c.beginPath(); c.moveTo(0, hy + 8);
      for (let x = 0; x <= 2048; x += 2) c.lineTo(x, hy + 3 - Math.max(0, h(x)));
      c.lineTo(2048, hy + 8); c.closePath(); c.fill(); c.restore();
    };
    layer('#0f1724', 3, ridge(2.3, 120, 16));
    layer('#04060b', .6, ridge(5.1, 230, 12));
  });
}

function roadTexture() {
  const t = canvas(256, 1024, c => {
    c.fillStyle = '#15181e'; c.fillRect(0, 0, 256, 1024);
    for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(255,255,255,${Math.random() * .035})`; c.fillRect(Math.random() * 256, Math.random() * 1024, 2, 2); }
    c.fillStyle = 'rgba(235,230,220,.55)'; c.fillRect(10, 0, 5, 1024); c.fillRect(241, 0, 5, 1024); // edge lines
    c.fillStyle = 'rgba(225,235,245,.6)'; for (let y = 0; y < 1024; y += 256) c.fillRect(124, y, 8, 130); // centre dashes
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 24); t.anisotropy = 8;
  return t;
}

const glowTexture = (inner: string, outer: string) => canvas(128, 128, c => {
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner); g.addColorStop(.25, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
});

const mistTexture = () => canvas(256, 128, c => {
  for (let i = 0; i < 14; i++) {
    const r = 18 + Math.random() * 26, x = 64 + Math.random() * 128, y = 64 + (Math.random() - .5) * 16; // blobs stay inside the canvas: no hard edges
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(180,205,230,.35)'); g.addColorStop(1, 'rgba(180,205,230,0)');
    c.fillStyle = g; c.fillRect(0, 0, 256, 128);
  }
});

/* ---------- the car, its lights, the road and the mist ---------- */
function Drive({ progress, onReady }: { progress: Props['progress']; onReady: () => void }) {
  const gltf = useCarModel();
  const tex = useMemo(() => ({ road: roadTexture(), red: glowTexture('rgba(255,90,90,1)', 'rgba(232,16,42,.55)'), white: glowTexture('rgba(255,255,255,.9)', 'rgba(200,215,255,.25)'), mist: mistTexture() }), []);
  const { car, lights, roll } = useMemo(() => {
    const model = gltf.scene.clone(true);
    const wrap = new THREE.Group(); wrap.add(model);
    const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3());
    const s = LENGTH / Math.max(size.x, size.z), c = box.getCenter(new THREE.Vector3());
    model.position.sub(c); model.position.y += size.y / 2;
    wrap.scale.setScalar(s);
    wrap.rotation.y = Math.PI; // the model's front faces +Z: turn it to drive away from the camera
    model.traverse(o => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.material as THREE.MeshPhysicalMaterial).transmission > 0) m.material = windowGlass;
    });
    applyPaint(gltf, model, diagnose.paints[0].variant);
    const wheels = rigWheels(model);
    const holder = new THREE.Group(); holder.add(wrap);
    const w = Math.min(size.x, size.z) * s, h = size.y * s;
    return { car: holder, lights: { w, h }, roll: (d: number) => wheels.roll(d / s) };
  }, [gltf]);
  useEffect(() => { onReady(); }, [onReady]);

  const group = useRef<THREE.Group>(null);
  const z = useRef(-60);
  useFrame(({ clock }, dt) => {
    const p = progress.current ?? 0, t = clock.elapsedTime;
    tex.road.offset.y += dt * 2.6;                          // the road rushes by (≈ 28 m/s)
    roll(28 * dt);                                           // and the wheels turn with it
    // where the car should be: comes closer (0 → .32), then pulls away (.32 → 1)
    const target = p < .32 ? THREE.MathUtils.lerp(-46, -10.5, p / .32) : THREE.MathUtils.lerp(-10.5, -70, Math.pow((p - .32) / .68, 1.4));
    z.current = THREE.MathUtils.damp(z.current, target, 3, dt);
    const g = group.current; if (!g) return;
    g.position.set(Math.sin(t * .35) * .18 - .9, Math.sin(t * 9) * .006, z.current);
    g.rotation.z = Math.sin(t * .35 + .6) * .006;
  });

  const rear = LENGTH / 2 + .02, ly = lights.h * .62, lx = lights.w * .36;
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -120]}>
        <planeGeometry args={[7, 260]} />
        <meshStandardMaterial map={tex.road} roughness={.55} metalness={.3} />
      </mesh>
      <group ref={group}>
        <primitive object={car} />
        {/* tail lights + their glow, and the red streak they paint on the road */}
        {[-lx, lx].map(x => (
          <group key={x}>
            <sprite position={[x, ly, rear]} scale={[.9, .55, 1]}><spriteMaterial map={tex.red} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></sprite>
            <sprite position={[x, ly, rear + .05]} scale={[2.6, 1.3, 1]}><spriteMaterial map={tex.red} blending={THREE.AdditiveBlending} depthWrite={false} opacity={.35} toneMapped={false} /></sprite>
            <mesh rotation-x={-Math.PI / 2} position={[x * .9, .01, rear + 1.6]}>
              <planeGeometry args={[.5, 3.4]} />
              <meshBasicMaterial map={tex.red} transparent opacity={.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        ))}
        {/* headlights lighting the road ahead */}
        <sprite position={[0, .3, -LENGTH / 2 - 5]} scale={[6, 1.6, 1]}><spriteMaterial map={tex.white} blending={THREE.AdditiveBlending} depthWrite={false} opacity={.14} toneMapped={false} /></sprite>
      </group>
      <Mist map={tex.mist} />
    </>
  );
}

function Mist({ map }: { map: THREE.Texture }) {
  // scattered, uneven banks (no two at the same height or depth, so they never line up into stripes)
  const banks = useMemo(() => Array.from({ length: 11 }, (_, i) => {
    const r = (k: number) => (Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1;
    const side = i % 2 ? 1 : -1;
    return { x: side * (2.5 + Math.abs(r(1)) * 10), y: .25 + Math.abs(r(2)) * 1.1, z: -6 - i * 2.8 - Math.abs(r(3)) * 2, s: 5 + Math.abs(r(4)) * 7, sp: .12 + Math.abs(r(5)) * .2 };
  }), []);
  const refs = useRef<(THREE.Sprite | null)[]>([]);
  useFrame(({ clock }) => {
    banks.forEach((b, i) => { const s = refs.current[i]; if (s) s.position.x = b.x + Math.sin(clock.elapsedTime * b.sp + i) * 1.5; });
  });
  return (
    <>
      {banks.map((b, i) => (
        <sprite key={i} ref={el => { refs.current[i] = el; }} position={[b.x, b.y, b.z]} scale={[b.s, b.s * .45, 1]}>
          <spriteMaterial map={map} transparent opacity={.3} depthWrite={false} fog />
        </sprite>
      ))}
    </>
  );
}

/* camera: fixed, tilted a touch down so the horizon sits at HORIZON on screen; drifts with the pointer */
function Rig() {
  const { camera, scene } = useThree();
  const sky = useMemo(() => skyTexture(), []);
  useEffect(() => { scene.background = sky; return () => { scene.background = null; sky.dispose(); }; }, [scene, sky]);
  useFrame(({ pointer }) => {
    const cam = camera as THREE.PerspectiveCamera;
    const tilt = Math.atan((.5 - HORIZON) * 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
    // hand-held feel: a little sway and road vibration, like a camera car following
    const t = performance.now() / 1000;
    cam.position.set(pointer.x * .25 + Math.sin(t * .7) * .05, 1.35 + pointer.y * .08 + Math.sin(t * 13) * .004, 0);
    cam.rotation.set(-tilt + Math.sin(t * .9) * .003, Math.sin(t * .5) * .004, Math.sin(t * .6) * .003);
  });
  return null;
}

export default function CinemaScene({ progress, active, onReady }: Props) {
  return (
    <Canvas className="sc__canvas" dpr={[1, 1.5]} frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 1.35, 0], fov: 30, near: .1, far: 400 }} gl={{ antialias: true }}>
      <fog attach="fog" args={[HAZE, 18, 95]} />
      <hemisphereLight args={['#6f8fb8', '#0b0f17', 1.1]} />
      <directionalLight position={[2, 4, -30]} intensity={2} color="#a9c8ff" />
      <Environment resolution={128} frames={1}>
        <color attach="background" args={['#0c0c14']} />
        <Lightformer form="rect" intensity={1.6} color="#7fa9d1" position={[0, 2, -12]} scale={[24, 3, 1]} />
        <Lightformer form="rect" intensity={1} color="#2b4566" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[20, 6, 1]} />
      </Environment>
      <mesh rotation-x={-Math.PI / 2} position={[0, -.01, -150]}>
        <planeGeometry args={[400, 320]} />
        <meshStandardMaterial color="#0b0e14" roughness={1} />
      </mesh>
      <Suspense fallback={null}>
        <Drive progress={progress} onReady={onReady} />
      </Suspense>
      <Rig />
    </Canvas>
  );
}
