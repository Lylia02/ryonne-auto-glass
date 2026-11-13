'use client';
/* =========================================================
   "How it works" — WebGL scene (loaded on demand by <BayProcess>).
   The car waits in a dark service bay under strip lights. The scroll
   moves the camera from one shot to the next, one per step:
   intake (wide), damage scan (a light line sweeps the windshield),
   removal & prep (low side view), install (high, over the glass).
   ========================================================= */
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei';
import { applyPaint, useCarModel } from '@/lib/useCar';
import { diagnose } from '@/lib/site';

type Props = { progress: React.RefObject<number>; compact: boolean; active: boolean; onReady: () => void };

const LENGTH = 4.4;
const windowGlass = new THREE.MeshPhysicalMaterial({ color: '#0b1016', roughness: .05, metalness: .1, transparent: true, opacity: .55, envMapIntensity: 2, clearcoat: 1 });
// one camera shot per step: where the camera stands, what it looks at (the car's front faces +Z)
const SHOTS = [
  { pos: [6.4, 2.1, 7.6], look: [0, .6, 0] },
  { pos: [.5, 2.5, 4.6], look: [0, 1.05, .7] },
  { pos: [-7, 1, 1.4], look: [0, .7, 0] },
  { pos: [3, 4.8, 5.4], look: [0, .8, .3] },
].map(s => ({ pos: new THREE.Vector3(...s.pos), look: new THREE.Vector3(...s.look) }));
const smooth = (t: number) => t * t * (3 - 2 * t);

function Car({ progress, onReady }: { progress: Props['progress']; onReady: () => void }) {
  const gltf = useCarModel();
  const { car, shield } = useMemo(() => {
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
    applyPaint(gltf, model, diagnose.paints[1].variant);
    wrap.updateMatrixWorld(true);
    const ws = model.getObjectByName('BodyWindshield');
    const shield = ws ? new THREE.Box3().setFromObject(ws) : new THREE.Box3(new THREE.Vector3(-.7, .9, .2), new THREE.Vector3(.7, 1.3, 1.1));
    return { car: wrap, shield };
  }, [gltf]);
  useEffect(() => { onReady(); }, [onReady]);

  // the scan: a thin bright bar that sweeps up and down the windshield during step 2
  const scan = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const sw = shield.max.x - shield.min.x;
  useFrame(({ clock }) => {
    const p = (progress.current ?? 0) * 3;
    const on = Math.max(0, 1 - Math.abs(p - 1) * 1.6);   // fades in around step 2
    if (!scan.current || !mat.current) return;
    const t = (Math.sin(clock.elapsedTime * 1.6) + 1) / 2;
    scan.current.position.set((shield.min.x + shield.max.x) / 2, THREE.MathUtils.lerp(shield.min.y, shield.max.y, t) + .02, THREE.MathUtils.lerp(shield.max.z, shield.min.z, t) + .03);
    mat.current.opacity = on * .9;
  });

  return (
    <>
      <primitive object={car} />
      <mesh ref={scan} rotation-x={-.95}>
        <planeGeometry args={[sw * 1.05, .035]} />
        <meshBasicMaterial ref={mat} color="#8fd3ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

function Rig({ progress }: { progress: Props['progress'] }) {
  const pos = useMemo(() => new THREE.Vector3(), []), look = useMemo(() => new THREE.Vector3(), []);
  const cur = useRef<{ pos: THREE.Vector3; look: THREE.Vector3 } | null>(null);
  useFrame(({ camera, clock, pointer }, dt) => {
    const p = Math.min(.9999, Math.max(0, progress.current ?? 0)) * (SHOTS.length - 1);
    const i = Math.floor(p), f = smooth(p - i);
    const a = SHOTS[i], b = SHOTS[Math.min(i + 1, SHOTS.length - 1)];
    pos.lerpVectors(a.pos, b.pos, f); look.lerpVectors(a.look, b.look, f);
    // a slow breathing drift so the shot never feels frozen
    pos.x += Math.sin(clock.elapsedTime * .25) * .25 + pointer.x * .3;
    pos.y += Math.sin(clock.elapsedTime * .2) * .08 + pointer.y * .12;
    if (!cur.current) cur.current = { pos: pos.clone(), look: look.clone() };
    const k = 1 - Math.exp(-4 * dt);
    cur.current.pos.lerp(pos, k); cur.current.look.lerp(look, k);
    camera.position.copy(cur.current.pos); camera.lookAt(cur.current.look);
  });
  return null;
}

export default function BayScene({ progress, compact, active, onReady }: Props) {
  return (
    <Canvas className="bp__canvas" dpr={[1, 1.5]} frameloop={active ? 'always' : 'never'}
      camera={{ position: [6.4, 2.1, 7.6], fov: 34 }} gl={{ antialias: true }}>
      <color attach="background" args={['#07080d']} />
      <fog attach="fog" args={['#07080d', 12, 26]} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#040507']} />
        {/* shop strip lights overhead, cold side panels, one red work lamp */}
        {[-2.4, 0, 2.4].map(x => <Lightformer key={x} form="rect" intensity={3} position={[x, 6, 0]} rotation-x={Math.PI / 2} scale={[.35, 10, 1]} />)}
        <Lightformer form="rect" intensity={1.6} color="#bcd8ff" position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[16, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#bcd8ff" position={[8, 2, 0]} rotation-y={-Math.PI / 2} scale={[16, 1, 1]} />
        <Lightformer form="ring" color="#e8102a" intensity={4} position={[0, 2.6, -9]} scale={2.4} />
      </Environment>
      {/* the strip lights themselves, visible above the car */}
      {[-2.4, 0, 2.4].map(x => (
        <mesh key={x} position={[x, 4.2, 0]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[.08, 7]} />
          <meshBasicMaterial color="#e9f2ff" toneMapped={false} />
        </mesh>
      ))}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[60, 60]} />
        {compact
          ? <meshStandardMaterial color="#090a0f" roughness={.5} metalness={.5} />
          : <MeshReflectorMaterial resolution={512} blur={[300, 100]} mixBlur={1} mixStrength={14} roughness={.8} depthScale={1}
              minDepthThreshold={.4} maxDepthThreshold={1.3} color="#08090e" metalness={.6} mirror={0} />}
      </mesh>
      <Suspense fallback={null}>
        <Car progress={progress} onReady={onReady} />
        <ContactShadows position={[0, .002, 0]} opacity={.9} scale={10} blur={2.2} far={2.4} resolution={512} frames={1} color="#000" />
      </Suspense>
      <Rig progress={progress} />
    </Canvas>
  );
}
