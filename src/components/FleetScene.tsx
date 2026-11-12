'use client';
/* =========================================================
   Fleet page hero — WebGL scene (loaded on demand by <FleetHero>).
   Three cars (one per paint colour) parked in a dark showroom on a
   glossy floor; light streaks run under them. The camera eases in
   on load and climbs as the hero scrolls away (progress ref 0 → 1).
   ========================================================= */
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei';
import { applyPaint, useCarModel } from '@/lib/useCar';
import { diagnose } from '@/lib/site';

type Props = { progress: React.RefObject<number>; compact: boolean; active: boolean; onReady: () => void };

const LENGTH = 4.4;
// one cheap tinted glass for every window (the model's own glass uses transmission = an extra render pass)
const windowGlass = new THREE.MeshPhysicalMaterial({ color: '#0b1016', roughness: .05, metalness: .1, transparent: true, opacity: .55, envMapIntensity: 2, clearcoat: 1 });
const LINEUP = [ // x, z, turn, paint
  { x: 0, z: 0, ry: .55, paint: diagnose.paints[1].variant },
  { x: -4.6, z: -3.6, ry: .55, paint: diagnose.paints[0].variant },
  { x: 4.4, z: -3.8, ry: .55, paint: diagnose.paints[2].variant },
];

function Lineup({ compact, onReady }: { compact: boolean; onReady: () => void }) {
  const gltf = useCarModel();
  const cars = useMemo(() => {
    const list = compact ? LINEUP.slice(0, 1) : LINEUP;
    return list.map(spot => {
      const car = gltf.scene.clone(true);
      const wrap = new THREE.Group(); wrap.add(car);
      const box = new THREE.Box3().setFromObject(car), size = box.getSize(new THREE.Vector3());
      const s = LENGTH / Math.max(size.x, size.z), c = box.getCenter(new THREE.Vector3());
      car.position.sub(c); car.position.y += size.y / 2; // centred, wheels on y = 0 (before scaling)
      wrap.scale.setScalar(s);
      // front of the model faces +Z: turn it toward the camera's side
      wrap.rotation.y = spot.ry; wrap.position.set(spot.x, 0, spot.z);
      car.traverse(o => {
        const m = o as THREE.Mesh;
        if (m.isMesh && (m.material as THREE.MeshPhysicalMaterial).transmission > 0) m.material = windowGlass;
      });
      applyPaint(gltf, car, spot.paint);
      return wrap;
    });
  }, [gltf, compact]);
  useEffect(() => { onReady(); }, [onReady]);
  return <>{cars.map((c, i) => <primitive key={i} object={c} />)}</>;
}

/* light streaks running along the floor, toward the camera */
function Streaks() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 18;
  const lanes = useMemo(() => Array.from({ length: N }, (_, i) => ({ x: -9 + (i / (N - 1)) * 18 + Math.sin(i * 9.1) * .4, z: -16 + ((i * 7.3) % 16), sp: 3 + (i % 5) * 1.2, len: .6 + (i % 4) * .4 })), []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  useFrame((_, dt) => {
    const mesh = ref.current; if (!mesh) return;
    lanes.forEach((l, i) => {
      l.z += dt * l.sp; if (l.z > 6) l.z = -18;
      m.makeScale(.012, 1, l.len).setPosition(l.x, .005, l.z);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, N]}>
      <boxGeometry args={[1, .002, 1]} />
      <meshBasicMaterial color="#ff3347" transparent opacity={.28} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  );
}

function Rig({ progress, compact }: { progress: Props['progress']; compact: boolean }) {
  const t0 = useRef<number | null>(null);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, clock, pointer }) => {
    if (t0.current === null) t0.current = clock.elapsedTime;
    const intro = Math.min(1, (clock.elapsedTime - t0.current) / 3.2), e = 1 - Math.pow(1 - intro, 3);
    const p = progress.current ?? 0;
    const dist = (compact ? 13 : 10.5) + (1 - e) * 5 + p * 3;
    const y = 1.6 + p * 3.4 + (1 - e) * .6;
    const ang = -.38 + (1 - e) * -.25 + pointer.x * .05;
    camera.position.set(Math.sin(ang) * dist, y + pointer.y * .2, Math.cos(ang) * dist);
    look.set(compact ? 0 : -.6, .7 + p * .4, -1);
    camera.lookAt(look);
  });
  return null;
}

export default function FleetScene({ progress, compact, active, onReady }: Props) {
  return (
    <Canvas className="fhero__canvas" dpr={[1, 1.5]} frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 2, 14], fov: 32 }} gl={{ antialias: true }}>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 14, 30]} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#030303']} />
        <Lightformer form="rect" intensity={3.2} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[16, 2.4, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[0, 7, -5]} rotation-x={Math.PI / 2} scale={[16, 1, 1]} />
        <Lightformer form="rect" intensity={2} position={[-9, 2, 0]} rotation-y={Math.PI / 2} scale={[20, 1.4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[9, 2, 0]} rotation-y={-Math.PI / 2} scale={[20, 1, 1]} />
        <Lightformer form="ring" color="#e8102a" intensity={5} position={[0, 3, -12]} scale={4} />
      </Environment>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[60, 60]} />
        {compact
          ? <meshStandardMaterial color="#070707" roughness={.6} metalness={.4} />
          : <MeshReflectorMaterial resolution={512} blur={[400, 120]} mixBlur={1} mixStrength={18} roughness={.85} depthScale={1}
              minDepthThreshold={.4} maxDepthThreshold={1.3} color="#060606" metalness={.6} mirror={0} />}
      </mesh>
      <Suspense fallback={null}>
        <Lineup compact={compact} onReady={onReady} />
        <ContactShadows position={[0, .002, -1.2]} opacity={.85} scale={22} blur={2.4} far={2.4} resolution={512} frames={1} color="#000" />
      </Suspense>
      <Streaks />
      <Rig progress={progress} compact={compact} />
    </Canvas>
  );
}
