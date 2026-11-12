'use client';
/* =========================================================
   Services reel — the WebGL scene (loaded on demand by <GlassReel>).
   A windshield cut like a jewel (drei MeshTransmissionMaterial:
   refraction + chromatic aberration) floats beside the text and
   changes pose for each chapter, the way the WebGi ring moves
   between sections. Pearls drift around it; light bars and a
   coloured glow behind it bend through the glass.
   chapter: -1 = hero, 0…4 = services, 5 = end
   ========================================================= */
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshTransmissionMaterial } from '@react-three/drei';
import { crackTexture } from '@/lib/crack';
import { choir } from '@/lib/site';

type Props = { chapter: React.RefObject<number>; compact: boolean; active: boolean };

/* pose per chapter: [x, y, rotX, rotY, scale] — x is flipped on phones (glass stays centred) */
const POSES: Record<number, [number, number, number, number, number]> = {
  [-1]: [0, .55, -.12, -.35, 1.12],
  0: [1.3, 0, -.08, -.4, .95],      // windshield — text on the left
  1: [-1.25, .05, .05, .32, 1.22],  // chip — close up
  2: [1.25, -.05, -.32, -.18, .95], // ADAS — tilted, camera on top
  3: [-1.2, 0, .05, 1.15, .95],     // side & back — turned to show its edge
  4: [1.25, .1, -.1, -.5, .9],      // mobile — spinning, pearls orbit
  5: [0, -.1, -.1, 0, .7],
};
const tones = ['#9fc4ff', ...choir.tones]; // hero + 5 services
const toneOf = (ch: number) => tones[Math.max(0, Math.min(tones.length - 1, ch + 1))];

/* ---------- the glass: a slab with rounded corners, tapered and bent like a windshield ---------- */
const W = 3.2, H = 1.6, D = .12;
function windshieldGeometry() {
  const geo = new THREE.BoxGeometry(W, H, D, 64, 32, 2);
  const pos = geo.attributes.position as THREE.BufferAttribute, v = new THREE.Vector3(), n = 7;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let u = v.x / (W / 2), w = v.y / (H / 2);
    const m = Math.max(Math.abs(u), Math.abs(w));
    if (m > 0) { const k = m / Math.pow(Math.abs(u) ** n + Math.abs(w) ** n, 1 / n); u *= k; w *= k; } // square → rounded
    let x = u * W / 2; const y = w * H / 2;
    x *= 1 - .16 * (w + 1) / 2;                       // narrower at the top
    const z = v.z - x * x * .085 - y * y * .05;        // curved both ways
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function Jewel({ chapter, compact }: { chapter: Props['chapter']; compact: boolean }) {
  const group = useRef<THREE.Group>(null);
  const glass = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const chip = useRef<THREE.Mesh>(null);
  const adas = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const geo = useMemo(windshieldGeometry, []);
  const pointer = useRef(new THREE.Vector2());
  const tint = useMemo(() => new THREE.Color('#ffffff'), []);
  const chipTex = useMemo(() => crackTexture('chip'), []);
  const beamTex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 256;
    const g = c.getContext('2d')!, gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame(({ clock, pointer: p }, dt) => {
    const g = group.current; if (!g) return;
    const ch = chapter.current ?? -1, t = clock.elapsedTime;
    const [x, y, rx, ry, s] = POSES[ch] ?? POSES[-1];
    pointer.current.lerp(p, .05);
    const k = 3.2;
    g.position.x = THREE.MathUtils.damp(g.position.x, compact ? 0 : x, k, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, (compact ? .7 : y) + Math.sin(t * .8) * .05, k, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rx + pointer.current.y * .12, k, dt);
    const spin = ch === 4 ? t * .6 : 0;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ry + spin + pointer.current.x * .2 + Math.sin(t * .4) * .06, k, dt);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s * (compact ? .62 : 1), k, dt));
    // chapter details fade in / out
    const fade = (m: THREE.Mesh | null, on: boolean, max = 1) => {
      if (!m) return; const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, on ? max : 0, 5, dt); m.visible = mat.opacity > .01;
    };
    fade(chip.current, ch === 1);
    if (chip.current) chip.current.scale.setScalar(1 + Math.sin(t * 2) * .03);
    if (adas.current) {
      const on = ch === 2;
      adas.current.position.y = THREE.MathUtils.damp(adas.current.position.y, on ? .62 : .9, 4, dt);
      adas.current.traverse(o => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined; if (m && 'opacity' in m) { m.transparent = true; m.opacity = THREE.MathUtils.damp(m.opacity, on ? 1 : 0, 5, dt); } });
      adas.current.visible = ((adas.current.children[0] as THREE.Mesh).material as THREE.Material).opacity > .01;
    }
    if (beam.current) { beam.current.rotation.y = Math.sin(t * 1.6) * .45; fade(beam.current, ch === 2, .55); }
    tint.lerp(new THREE.Color(toneOf(ch)).lerp(new THREE.Color('#ffffff'), .72), .04);
    mat.current?.color.copy(tint);
  });

  return (
    <group ref={group}>
      <mesh ref={glass} geometry={geo}>
        <MeshTransmissionMaterial ref={mat as never} transmission={1} thickness={.55} roughness={.03} ior={1.5}
          chromaticAberration={.09} anisotropicBlur={.12} distortion={.18} distortionScale={.4} temporalDistortion={.06}
          samples={compact ? 4 : 8} resolution={compact ? 256 : 512} backside backsideThickness={.3}
          attenuationColor="#d9f2ee" attenuationDistance={2.4} clearcoat={1} clearcoatRoughness={.05} envMapIntensity={1.4} />
      </mesh>
      {/* 02 · chip */}
      <mesh ref={chip} position={[-.35, -.2, .075]} renderOrder={5}>
        <planeGeometry args={[.55, .55]} />
        <meshBasicMaterial map={chipTex} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* 03 · ADAS camera + scanning beam */}
      <group ref={adas} position={[0, .9, -.18]}>
        <mesh><boxGeometry args={[.42, .2, .16]} /><meshStandardMaterial color="#141416" metalness={.7} roughness={.35} transparent opacity={0} /></mesh>
        <mesh position={[0, 0, .09]} rotation-x={Math.PI / 2}><cylinderGeometry args={[.055, .055, .04, 32]} /><meshStandardMaterial color="#0a0a0a" emissive="#36e2ff" emissiveIntensity={1.4} transparent opacity={0} /></mesh>
      </group>
      <mesh ref={beam} position={[0, .62, .2]} rotation-x={-Math.PI / 2 + .25}>
        <coneGeometry args={[.9, 3.2, 48, 1, true, -.5, 1]} />
        <meshBasicMaterial map={beamTex} color="#36e2ff" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ---------- pearls orbiting the glass (they follow it from chapter to chapter) ---------- */
function Pearls({ chapter, compact }: { chapter: Props['chapter']; compact: boolean }) {
  const N = compact ? 14 : 26;
  const ref = useRef<THREE.InstancedMesh>(null);
  const holder = useRef<THREE.Group>(null);
  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => {
    const r = (a: number) => { const x = Math.sin(i * 127.1 + a * 311.7) * 43758.5453; return x - Math.floor(x); };
    return { a: r(1) * Math.PI * 2, rad: 1.9 + r(2) * 1.3, y: (r(3) - .5) * 1.8, tilt: (r(4) - .5) * .8, s: .025 + r(5) * .04, sp: .08 + r(6) * .14 };
  }), [N]);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const swirl = useRef(1);
  useFrame(({ clock }, dt) => {
    const mesh = ref.current, h = holder.current; if (!mesh || !h) return;
    const ch = chapter.current ?? -1, t = clock.elapsedTime;
    const [x, y] = POSES[ch] ?? POSES[-1];
    h.position.x = THREE.MathUtils.damp(h.position.x, compact ? 0 : x, 2.4, dt);
    h.position.y = THREE.MathUtils.damp(h.position.y, compact ? .7 : y, 2.4, dt);
    swirl.current = THREE.MathUtils.damp(swirl.current, ch === 4 ? 5 : 1, 2, dt);
    seeds.forEach((p, i) => {
      p.a += dt * p.sp * swirl.current;
      const px = Math.cos(p.a) * p.rad, pz = Math.sin(p.a) * p.rad * .55 - .4;
      const py = p.y + px * p.tilt * .3 + Math.sin(t * .6 + i) * .08;
      m.makeScale(p.s, p.s, p.s).setPosition(px, py, pz);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <group ref={holder}>
      <instancedMesh ref={ref} args={[undefined, undefined, N]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhysicalMaterial color="#ffffff" roughness={.14} metalness={0} clearcoat={1} clearcoatRoughness={.06} envMapIntensity={2.6}
          emissive="#3a3330" iridescence={1} iridescenceIOR={1.7} iridescenceThicknessRange={[250, 750]} sheen={1} sheenColor="#ffe3ee" />
      </instancedMesh>
    </group>
  );
}

/* ---------- what bends through the glass: light bars + a coloured glow ---------- */
function Backdrop({ chapter }: { chapter: Props['chapter'] }) {
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const glowTex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d')!, gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  const target = useMemo(() => new THREE.Color(), []);
  useFrame(() => { if (glow.current) glow.current.color.lerp(target.set(toneOf(chapter.current ?? -1)), .04); });
  return (
    <group position={[0, 0, -3]}>
      <mesh scale={[9, 7, 1]}><planeGeometry /><meshBasicMaterial ref={glow} map={glowTex} transparent opacity={.55} depthWrite={false} toneMapped={false} /></mesh>
      {[-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6].map(x => (
        <mesh key={x} position={[x, 0, .2]}><planeGeometry args={[.012, 12]} /><meshBasicMaterial color="#ffffff" transparent opacity={.22} toneMapped={false} /></mesh>
      ))}
    </group>
  );
}

/* ---------- a light that sweeps across the glass (reflections), faster on each change ---------- */
function Studio({ chapter }: { chapter: Props['chapter'] }) {
  const sweep = useRef<THREE.Mesh>(null);
  const last = useRef(-2), pos = useRef(-8);
  useFrame((_, dt) => {
    const ch = chapter.current ?? -1;
    if (ch !== last.current) { last.current = ch; pos.current = -8; }
    pos.current = pos.current > 8 ? pos.current : pos.current + dt * 9;
    if (sweep.current) sweep.current.position.x = pos.current;
  });
  return (
    <Environment resolution={256} frames={Infinity}>
      <color attach="background" args={['#050505']} />
      <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 2, 1]} />
      <Lightformer form="rect" intensity={1.2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 1.2, 1]} />
      <Lightformer form="rect" intensity={1.2} position={[5, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 1.2, 1]} />
      <Lightformer ref={sweep} form="rect" intensity={6} position={[-8, 0, 4]} scale={[.8, 10, 1]} />
    </Environment>
  );
}

function Fit({ compact }: { compact: boolean }) {
  const camera = useThree(s => s.camera) as THREE.PerspectiveCamera;
  useFrame(() => { camera.position.z = compact ? 8.5 : 7; });
  return null;
}

export default function ReelScene({ chapter, compact, active }: Props) {
  return (
    <Canvas className="reel__canvas" dpr={[1, compact ? 1.5 : 1.75]} frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 7], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <Fit compact={compact} />
      <Studio chapter={chapter} />
      <Backdrop chapter={chapter} />
      <Pearls chapter={chapter} compact={compact} />
      <Jewel chapter={chapter} compact={compact} />
    </Canvas>
  );
}
