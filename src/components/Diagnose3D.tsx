'use client';
/* =========================================================
   Diagnose in 3D — the WebGL scene (React Three Fiber + drei).
   Loaded on demand by <Diagnose> (next/dynamic, no SSR).
   - the car is /models/car.glb ("Car Concept", same model as the
     site's renders), compressed with gltf-transform (meshopt + webp)
   - every window gets its own glass material so it can light up alone
   - tap a window (or a hotspot) → onPick ; the camera flies to it
   - the damage mark is a canvas-drawn crack laid on the glass
   - paint colours are the model's KHR_materials_variants
   ========================================================= */
import { Suspense, useEffect, useMemo, useReducer, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { CameraControls, CameraControlsImpl, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { applyPaint, preloadCar, useCarModel } from '@/lib/useCar';
import { diagnose, type DamageId, type GlassId } from '@/lib/site';
import { crackTexture } from '@/lib/crack';

export type Vec3 = [number, number, number];
export type Pick = { glass: GlassId; point?: Vec3; normal?: Vec3 };

type Props = {
  glass: GlassId | null;
  damage: DamageId | null;
  paint: string;
  mark: Pick | null;
  touch: boolean;   // touch screens: no drag-to-rotate, so the page keeps scrolling
  stacked: boolean; // narrow layout: canvas above the panel (no left shift)
  active: boolean;  // section on screen → render loop runs
  intro: React.RefObject<number>; // showroom intro progress (1 = no intro)
  hots: React.RefObject<Partial<Record<GlassId, HTMLButtonElement | null>>>; // DOM hotspots, moved here every frame
  onPick: (p: Pick) => void;
  onReady: () => void;
};

const { ACTION } = CameraControlsImpl;
const CAR_LENGTH = 4.4;
const nodeToGlass = Object.fromEntries(diagnose.glass.map(g => [g.node, g.id])) as Record<string, GlassId>;

/* ---------- Zones: where each window is, once the car is normalised ---------- */
type Zone = { id: GlassId; mesh: THREE.Mesh; mat: THREE.MeshPhysicalMaterial; hot: THREE.Vector3; out: THREE.Vector3; point: THREE.Vector3; normal: THREE.Vector3 };
type Frame = { center: THREE.Vector3; front: THREE.Vector3; left: THREE.Vector3; height: number };

const flat = (v: THREE.Vector3) => { v.y = 0; return v.normalize(); };

function makeGlass() {
  return new THREE.MeshPhysicalMaterial({
    color: '#0b1016', roughness: .04, metalness: .1, transparent: true, opacity: .42,
    envMapIntensity: 2.2, clearcoat: 1, clearcoatRoughness: .03, side: THREE.DoubleSide, depthWrite: false,
    emissive: new THREE.Color('#e8102a'), emissiveIntensity: 0,
  });
}

/* Centre of the vertices of a mesh, optionally only those on one side */
function centroid(mesh: THREE.Mesh, keep?: (v: THREE.Vector3) => boolean) {
  const pos = mesh.geometry.attributes.position, v = new THREE.Vector3(), sum = new THREE.Vector3();
  let n = 0;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    if (keep && !keep(v)) continue;
    sum.add(v); n++;
  }
  return n ? sum.divideScalar(n) : new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
}

const markSize: Record<DamageId, number> = { chip: .2, crack: .62, shattered: .86 };

/* =========================================================
   The car
   ========================================================= */
function Car({ glass, damage, paint, mark, hots, intro, onPick, onZones }: {
  glass: GlassId | null; damage: DamageId | null; paint: string; mark: Pick | null;
  hots: Props['hots']; intro: Props['intro']; onPick: (p: Pick) => void; onZones: (z: Zone[], f: Frame) => void;
}) {
  const gltf = useCarModel();
  const hover = useRef<GlassId | null>(null);

  /* Normalise the car once: centred, wheels on the floor, CAR_LENGTH long. Build the zones. */
  const { zones, frame } = useMemo(() => {
    const root = gltf.scene;
    root.position.set(0, 0, 0); root.scale.setScalar(1); root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3());
    const s = CAR_LENGTH / Math.max(size.x, size.z);
    root.scale.setScalar(s);
    const c = box.getCenter(new THREE.Vector3()).multiplyScalar(s);
    root.position.set(-c.x, -box.min.y * s, -c.z);
    root.updateMatrixWorld(true);
    root.traverse(o => { if ((o as THREE.Mesh).isMesh) { o.castShadow = false; o.receiveShadow = false; } });

    const mesh = (name: string) => root.getObjectByName(name) as THREE.Mesh;
    const height = size.y * s, center = new THREE.Vector3(0, height * .5, 0);
    const front = flat(centroid(mesh('BodyWindshield')).sub(centroid(mesh('BodyRearwindow'))));
    const left = flat(centroid(mesh('BodyDoorLWindow')).sub(center));
    const f: Frame = { center, front, left, height };

    const ray = new THREE.Raycaster();
    const zs: Zone[] = diagnose.glass.map(g => {
      const m = mesh(g.node);
      const mat = makeGlass();
      m.material = mat;
      // the rear side glass is one mesh for both sides: anchor it on the driver side
      const hot = g.id === 'quarter'
        ? centroid(m, v => v.clone().sub(center).dot(left) > 0)
        : centroid(m);
      const out = hot.clone().sub(center).normalize();
      // a point on the glass surface, facing out, for the default damage mark
      ray.set(hot.clone().addScaledVector(out, 2), out.clone().negate());
      const hit = ray.intersectObject(m, false)[0];
      const point = hit ? hit.point.clone() : hot.clone();
      const normal = hit?.face ? hit.face.normal.clone().transformDirection(m.matrixWorld) : out.clone();
      if (normal.dot(out) < 0) normal.negate();
      return { id: g.id, mesh: m, mat, hot: point.clone().addScaledVector(normal, .02), out, point, normal };
    });
    return { zones: zs, frame: f };
  }, [gltf.scene]);

  useEffect(() => { onZones(zones, frame); }, [zones, frame, onZones]);

  /* Paint colours */
  useEffect(() => { applyPaint(gltf, gltf.scene, paint); }, [paint, gltf]);

  /* Glass highlight + hotspot visibility, every frame */
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, clock, size }, dt) => {
    const t = clock.elapsedTime;
    for (const z of zones) {
      const sel = z.id === glass, hov = z.id === hover.current;
      const target = sel ? .9 + .35 * Math.sin(t * 3) : hov ? .35 : 0;
      z.mat.emissiveIntensity = THREE.MathUtils.damp(z.mat.emissiveIntensity, target, 8, dt);
      const frost = sel && damage === 'shattered' ? 1 : 0;
      z.mat.roughness = THREE.MathUtils.damp(z.mat.roughness, .04 + frost * .5, 4, dt);
      z.mat.opacity = THREE.MathUtils.damp(z.mat.opacity, .42 + frost * .3, 4, dt);
      const el = hots.current?.[z.id];
      if (el) {
        const facing = tmp.copy(camera.position).sub(z.hot).normalize().dot(z.out);
        const show = facing > .2 && !sel && (intro.current ?? 1) >= INTRO_DONE;
        tmp.copy(z.hot).project(camera);
        el.style.transform = `translate(${(tmp.x + 1) / 2 * size.width}px, ${(1 - tmp.y) / 2 * size.height}px)`;
        el.style.opacity = show ? '1' : '0';
        el.style.pointerEvents = show ? 'auto' : 'none';
      }
    }
  });

  const pickFrom = (e: ThreeEvent<MouseEvent>) => {
    const id = nodeToGlass[e.object.name];
    if (!id || e.delta > 6 || (intro.current ?? 1) < INTRO_DONE) return;
    e.stopPropagation();
    const n = e.face ? e.face.normal.clone().transformDirection(e.object.matrixWorld) : null;
    const z = zones.find(x => x.id === id)!;
    if (n && n.dot(z.out) < 0) n.negate();
    onPick({ glass: id, point: e.point.toArray() as Vec3, normal: n ? n.toArray() as Vec3 : undefined });
  };
  const setHover = (id: GlassId | null) => {
    hover.current = id;
    const wrap = document.querySelector<HTMLElement>('.dx__stage');
    if (wrap) wrap.dataset.cursor = id ? 'Select' : diagnose.rotate.split(' ')[0];
  };

  /* Damage mark */
  const markMesh = useMemo(() => {
    if (!mark || !damage) return null;
    const z = zones.find(x => x.id === mark.glass)!;
    const p = mark.point ? new THREE.Vector3(...mark.point) : z.point;
    const n = mark.normal ? new THREE.Vector3(...mark.normal) : z.normal;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    return { pos: p.addScaledVector(n, .012), q, size: markSize[damage], tex: crackTexture(damage) };
  }, [mark, damage, zones]);

  return (
    <>
      <primitive object={gltf.scene}
        onClick={pickFrom}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => setHover(nodeToGlass[e.object.name] ?? null)}
        onPointerOut={() => setHover(null)} />
      {markMesh && (
        <mesh position={markMesh.pos} quaternion={markMesh.q} renderOrder={10}>
          <planeGeometry args={[markMesh.size, markMesh.size]} />
          <meshBasicMaterial map={markMesh.tex} transparent depthWrite={false} toneMapped={false} polygonOffset polygonOffsetFactor={-4} />
        </mesh>
      )}
    </>
  );
}

/* =========================================================
   Camera: idle turntable, then flies to the selected window.
   Desktop: the canvas runs under the text panel, so the view is
   shifted left (focal offset) to keep the car in the free area.
   ========================================================= */
const FOV = 28;
export const INTRO_DONE = .8; // showroom intro progress at which the configurator takes over
const smooth = (t: number) => t * t * (3 - 2 * t);

function Rig({ controls, glass, zones, frame, stacked, intro }: {
  controls: React.RefObject<CameraControlsImpl | null>; glass: GlassId | null;
  zones: Zone[] | null; frame: Frame | null; stacked: boolean; intro: React.RefObject<number>;
}) {
  const busyUntil = useRef(0);
  const wasIntro = useRef(false);
  const size = useThree(s => s.size);
  const aspect = size.width / Math.max(1, size.height);
  const shift = stacked ? 0 : .19;            // fraction of the view width
  const free = stacked ? .9 : .56;            // share of the width the car may use
  const halfTan = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const fit = (span: number, share: number) => span / (share * 2 * halfTan * aspect);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const shiftNow = useRef(shift);

  useEffect(() => {
    const c = controls.current; if (!c) return;
    const start = () => { busyUntil.current = Infinity; };
    const end = () => { busyUntil.current = performance.now() + 4000; };
    c.addEventListener('controlstart', start); c.addEventListener('controlend', end);
    return () => { c.removeEventListener('controlstart', start); c.removeEventListener('controlend', end); };
  }, [controls]);

  /* camera on a circle around a target: angle th from the car's front toward its left side */
  const lookFrom = (target: THREE.Vector3, dir: THREE.Vector3, elev: number, dist: number, smoothMove = true) => {
    const c = controls.current!;
    const p = target.clone().addScaledVector(dir.normalize(), Math.cos(elev) * dist).addScaledVector(up, Math.sin(elev) * dist);
    c.setLookAt(p.x, p.y, p.z, target.x, target.y, target.z, smoothMove);
  };
  const dirAt = (th: number) => frame!.front.clone().multiplyScalar(Math.cos(th)).addScaledVector(frame!.left, Math.sin(th));

  /* the view for the current selection (or the idle 3/4 view) */
  const place = () => {
    if (!controls.current || !frame) return;
    const { center, front, height } = frame;
    if (!glass || !zones) {
      const th = stacked ? Math.atan2(.4, .92) : Math.atan2(.67, .74);
      lookFrom(new THREE.Vector3(center.x, height * .45, center.z), dirAt(th), .2, fit(stacked ? 5 : 5.2, free));
      return;
    }
    const z = zones.find(x => x.id === glass)!;
    const dir = flat(z.out.clone());
    if (glass === 'driver' || glass === 'passenger') dir.addScaledVector(front, .45);
    if (glass === 'quarter') dir.addScaledVector(front, -.5);
    const ends = glass === 'windshield' || glass === 'rear';
    const span = (ends ? 4.4 : 4.6) * (stacked ? .8 : 1);
    lookFrom(z.hot.clone().setY(z.hot.y - .15), dir, ends ? .36 : .14, Math.max(3.2, span / (free * 2 * halfTan * Math.min(aspect, 1.6))));
  };
  const placeRef = useRef(place); placeRef.current = place;

  useEffect(() => { if ((intro.current ?? 1) >= INTRO_DONE) placeRef.current(); }, [glass, zones, frame, stacked, aspect, intro]);

  /* showroom intro: rear 3/4 → side profile (makes around) → configurator 3/4 view */
  const introPose = (p: number) => {
    const h = frame!.height;
    const P = [
      { th: 2.4, el: .04, dist: fit(4.6, .8), ty: .42 * h, sh: 0 },
      { th: Math.PI / 2, el: .07, dist: fit(5.8, .72), ty: .5 * h, sh: 0 },
      { th: Math.atan2(.67, .74), el: .2, dist: fit(5.2, free), ty: .45 * h, sh: shift },
    ];
    const [a, b, t] = p < .45 ? [P[0], P[1], smooth(p / .45)] : [P[1], P[2], smooth(Math.min(1, (p - .45) / (INTRO_DONE - .45)))];
    const L = (k: 'th' | 'el' | 'dist' | 'ty' | 'sh') => a[k] + (b[k] - a[k]) * t;
    return { th: L('th'), el: L('el'), dist: L('dist'), ty: L('ty'), sh: L('sh') };
  };

  useFrame((_, dt) => {
    const c = controls.current; if (!c || !frame) return;
    const p = intro.current ?? 1;
    if (p < INTRO_DONE) {
      const q = introPose(p);
      c.enabled = false;
      lookFrom(new THREE.Vector3(frame.center.x, q.ty, frame.center.z), dirAt(q.th), q.el, q.dist);
      shiftNow.current = q.sh;
      wasIntro.current = true;
    } else {
      if (wasIntro.current) { wasIntro.current = false; c.enabled = true; busyUntil.current = performance.now() + 2500; if (glass) placeRef.current(); }
      shiftNow.current = shift;
      if (!glass && performance.now() > busyUntil.current) c.rotate(dt * .1, 0, false);
    }
    c.setFocalOffset(c.distance * 2 * halfTan * aspect * shiftNow.current, 0, 0, false);
  });
  return null;
}

/* =========================================================
   Scene
   ========================================================= */
export default function Diagnose3D({ glass, damage, paint, mark, touch, stacked, active, intro, hots, onPick, onReady }: Props) {
  const controls = useRef<CameraControlsImpl | null>(null);
  const zonesRef = useRef<{ zones: Zone[]; frame: Frame } | null>(null);
  const [, force] = useReducer((x: number) => x + 1, 0);

  const onZones = useMemo(() => (zones: Zone[], frame: Frame) => {
    zonesRef.current = { zones, frame }; force(); onReady();
  }, [force, onReady]);

  return (
    <Canvas className="dx__canvas" dpr={[1, 1.75]} frameloop={active ? 'always' : 'never'}
      camera={{ position: [9, 3, 9], fov: FOV, near: .1, far: 80 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <CameraControls ref={controls} makeDefault smoothTime={.55} draggingSmoothTime={.12}
        minDistance={2.6} maxDistance={24} minPolarAngle={.45} maxPolarAngle={Math.PI / 2 - .07}
        mouseButtons={{ left: ACTION.ROTATE, middle: ACTION.NONE, right: ACTION.NONE, wheel: ACTION.NONE }}
        touches={{ one: touch ? ACTION.NONE : ACTION.TOUCH_ROTATE, two: ACTION.NONE, three: ACTION.NONE }} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#050505']} />
        <Lightformer form="rect" intensity={4} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={2.4} position={[-6, 1.4, 0]} rotation-y={Math.PI / 2} scale={[14, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.4} position={[6, 1.4, 0]} rotation-y={-Math.PI / 2} scale={[14, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 2, 9]} scale={[12, 2, 1]} />
        <Lightformer form="rect" intensity={1} position={[0, 2, -9]} rotation-y={Math.PI} scale={[12, 2, 1]} />
        <Lightformer form="ring" color="#e8102a" intensity={6} position={[-3, 2.4, -8]} scale={2.6} />
      </Environment>
      <Suspense fallback={null}>
        <Car glass={glass} damage={damage} paint={paint} mark={mark} hots={hots} intro={intro} onPick={onPick} onZones={onZones} />
        <ContactShadows position={[0, .001, 0]} opacity={.9} scale={11} blur={2.2} far={2.6} resolution={512} frames={1} color="#000" />
      </Suspense>
      <Rig controls={controls} glass={glass} zones={zonesRef.current?.zones ?? null} frame={zonesRef.current?.frame ?? null} stacked={stacked} intro={intro} />
    </Canvas>
  );
}


preloadCar();
