'use client';
/* =========================================================
   "Show us the damage" — WebGL scene (loaded on demand by <Arrival>).
   Headlights in the dark: the car drives in from the far end of a wet
   floor, slows down, turns and stops side-on in front of the camera,
   ready to be diagnosed. The scroll drives it (progress ref 0 → 1),
   with a little lag so it brakes smoothly; the wheels turn with the
   distance it really covers.
   ========================================================= */
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei';
import { applyPaint, useCarModel } from '@/lib/useCar';
import { diagnose } from '@/lib/site';
import { rigWheels } from '@/lib/wheels';

type Props = { progress: React.RefObject<number>; compact: boolean; active: boolean; onReady: () => void; pin: React.RefObject<HTMLElement | null> };

const LENGTH = 4.4;
const windowGlass = new THREE.MeshPhysicalMaterial({ color: '#0b1016', roughness: .05, metalness: .1, transparent: true, opacity: .6, envMapIntensity: 2, clearcoat: 1 });

const glow = () => {
  const el = document.createElement('canvas'); el.width = el.height = 128;
  const c = el.getContext('2d')!, g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.2, 'rgba(220,232,255,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(el); t.colorSpace = THREE.SRGBColorSpace; return t;
};

/* the route: from far away (facing the camera) to parked side-on */
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
function pose(u: number, out: { pos: THREE.Vector3; yaw: number }) {
  const e = ease(Math.min(1, u));
  out.pos.set(THREE.MathUtils.lerp(-2.6, 0, ease(Math.min(1, u * 1.15))), 0, THREE.MathUtils.lerp(-46, 0, e));
  out.yaw = THREE.MathUtils.smoothstep(u, .45, 1) * (Math.PI / 2);   // turns to show its right side
  return out;
}

function Car({ progress, onReady, pin }: { progress: Props['progress']; onReady: () => void; pin: Props['pin'] }) {
  const gltf = useCarModel();
  const tex = useMemo(() => glow(), []);
  const { car, roll, front, lamp, glass } = useMemo(() => {
    const model = gltf.scene.clone(true);
    const wrap = new THREE.Group(); wrap.add(model);
    const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3());
    const s = LENGTH / Math.max(size.x, size.z), c = box.getCenter(new THREE.Vector3());
    model.position.sub(c); model.position.y += size.y / 2;
    wrap.scale.setScalar(s);
    model.traverse(o => {
      const m = o as THREE.Mesh;
      if (m.isMesh && (m.material as THREE.MeshPhysicalMaterial).transmission > 0) m.material = windowGlass;
    });
    applyPaint(gltf, model, diagnose.paints[2].variant);
    const wheels = rigWheels(model);
    const glass = model.getObjectByName('BodyWindshield');
    return { car: wrap, roll: (d: number) => wheels.roll(d / s), front: LENGTH / 2 + .02, lamp: { x: Math.min(size.x, size.z) * s * .36, y: size.y * s * .45 }, glass };
  }, [gltf]);
  useEffect(() => { onReady(); }, [onReady]);

  const group = useRef<THREE.Group>(null);
  const u = useRef(0), last = useRef<THREE.Vector3 | null>(null);
  const p = useMemo(() => ({ pos: new THREE.Vector3(), yaw: 0 }), []);
  const at = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }, dt) => {
    u.current = THREE.MathUtils.damp(u.current, progress.current ?? 0, 2.2, dt);
    // keep the "tap the glass" hint on the windshield, wherever the car is on screen
    if (glass && pin.current) {
      new THREE.Box3().setFromObject(glass).getCenter(at).project(camera);
      pin.current.style.left = `${(at.x + 1) / 2 * size.width}px`;
      pin.current.style.top = `${(1 - at.y) / 2 * size.height}px`;
    }
    pose(u.current, p);
    const g = group.current; if (!g) return;
    g.position.copy(p.pos); g.rotation.y = p.yaw;
    if (last.current) roll(last.current.distanceTo(p.pos));
    last.current = (last.current ?? new THREE.Vector3()).copy(p.pos);
  });

  return (
    <group ref={group}>
      <primitive object={car} />
      {[-lamp.x, lamp.x].map(x => (
        <group key={x}>
          <sprite position={[x, lamp.y, front]} scale={[.7, .4, 1]}><spriteMaterial map={tex} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></sprite>
          <sprite position={[x, lamp.y, front + .1]} scale={[2.4, 1, 1]}><spriteMaterial map={tex} blending={THREE.AdditiveBlending} depthWrite={false} opacity={.3} toneMapped={false} /></sprite>
        </group>
      ))}
      {/* the beams on the wet floor ahead of the car */}
      <mesh rotation-x={-Math.PI / 2} position={[0, .01, front + 3]}>
        <planeGeometry args={[3, 6]} />
        <meshBasicMaterial map={tex} transparent opacity={.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Rig({ compact }: { compact: boolean }) {
  useFrame(({ camera, pointer, clock }) => {
    const t = clock.elapsedTime;
    camera.position.set(1.2 + pointer.x * .4 + Math.sin(t * .3) * .08, 1.35 + pointer.y * .15, compact ? 12 : 9.6);
    camera.lookAt(compact ? 0 : -1.5, .75, -1);   // on wide screens the car parks right of centre, clear of the text
  });
  return null;
}

export default function ArrivalScene({ progress, compact, active, onReady, pin }: Props) {
  return (
    <Canvas className="ar__canvas" dpr={[1, 1.5]} frameloop={active ? 'always' : 'never'}
      camera={{ position: [1.2, 1.35, 9.6], fov: 30, far: 120 }} gl={{ antialias: true }}>
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 14, 55]} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#030305']} />
        <Lightformer form="rect" intensity={2.6} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[14, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#bcd8ff" position={[-9, 2, 0]} rotation-y={Math.PI / 2} scale={[18, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#bcd8ff" position={[9, 2, 0]} rotation-y={-Math.PI / 2} scale={[18, 1.2, 1]} />
        <Lightformer form="ring" color="#e8102a" intensity={3} position={[4, 2.5, -10]} scale={3} />
      </Environment>
      {/* a single soft top light, like a spot over the parking place */}
      <spotLight position={[0, 9, 2]} angle={.45} penumbra={1} intensity={60} color="#eef4ff" />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -20]}>
        <planeGeometry args={[80, 100]} />
        {compact
          ? <meshStandardMaterial color="#07080c" roughness={.45} metalness={.5} />
          : <MeshReflectorMaterial resolution={512} blur={[260, 80]} mixBlur={1} mixStrength={20} roughness={.75} depthScale={1}
              minDepthThreshold={.4} maxDepthThreshold={1.3} color="#07080c" metalness={.6} mirror={0} />}
      </mesh>
      <Suspense fallback={null}>
        <Car progress={progress} onReady={onReady} pin={pin} />
        <ContactShadows position={[0, .003, 0]} opacity={.85} scale={12} blur={2.4} far={2.4} resolution={512} frames={Infinity} color="#000" />
      </Suspense>
      <Rig compact={compact} />
    </Canvas>
  );
}
