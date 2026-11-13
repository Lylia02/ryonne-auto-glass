'use client';
/* The car model shared by the 3D scenes (configurator, fleet hero).
   /models/car.glb — "Car Concept" by Eric Chadwick, © 2024 Darmstadt Graphics Group,
   CC BY 4.0 (credited in the footer). Modified: compressed with gltf-transform
   (meshopt geometry + webp textures); the Khronos logos are removed at load
   (they are trademarks, not covered by the CC licence) — see unbrand(). */
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { diagnose } from './site';

export const useCarModel = () => unbrand(useGLTF(diagnose.model) as unknown as GLTF);
export const preloadCar = () => useGLTF.preload(diagnose.model);

const originals = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>(); // kept out of userData (clone() copies userData as JSON)

/** Paint colours are the model's KHR_materials_variants (same method as three.js' gltf variants example). */
export function applyPaint(gltf: GLTF, root: THREE.Object3D, variant: string) {
  const ext = gltf.userData?.gltfExtensions?.KHR_materials_variants as { variants: { name: string }[] } | undefined;
  if (!ext) return;
  const index = ext.variants.findIndex(v => v.name === variant);
  root.traverse(async o => {
    const m = o as THREE.Mesh;
    const data = m.isMesh ? m.userData.gltfExtensions?.KHR_materials_variants as { mappings: { material: number; variants: number[] }[] } | undefined : undefined;
    if (!data) return;
    if (!originals.has(m)) originals.set(m, m.material);
    const map = data.mappings.find(x => x.variants.includes(index));
    if (map) { m.material = await gltf.parser.getDependency('material', map.material); gltf.parser.assignFinalMaterial(m); }
    else m.material = originals.get(m)!;
  });
}

/* ---------- remove the Khronos logos (once per loaded model) ----------
   - licence plates ("License" material) → a Ryonne plate drawn on a canvas
   - logos used as glowing emissive maps (rims, calipers, mirrors…) → removed
   - tyre sidewall lettering ("Tireside") → plain rubber */
const cleaned = new WeakSet<object>();
let plate: THREE.CanvasTexture | null = null;
function plateTexture() {
  if (plate) return plate;
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#0b0b0c'; g.fillRect(0, 0, 512, 512);
  g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '700 118px Arial, sans-serif'; g.fillText('RYONNE', 256, 236);
  g.fillStyle = '#e8102a'; g.fillRect(126, 316, 260, 8);
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '600 40px Arial, sans-serif'; g.fillText('AUTO GLASS', 256, 370);
  plate = new THREE.CanvasTexture(c);
  plate.flipY = false; // glTF texture convention
  plate.colorSpace = THREE.SRGBColorSpace;
  return plate;
}
export function unbrand(gltf: GLTF) {
  if (cleaned.has(gltf)) return gltf;
  cleaned.add(gltf);
  gltf.scene.traverse(o => {
    const m = o as THREE.Mesh; if (!m.isMesh) return;
    for (const mat of (Array.isArray(m.material) ? m.material : [m.material]) as THREE.MeshStandardMaterial[]) {
      if (mat.name === 'License') { mat.map = plateTexture(); mat.needsUpdate = true; }
      else if (mat.name === 'Tireside') { mat.map = null; mat.normalMap = null; mat.color.set('#161616'); mat.needsUpdate = true; }
      else if (mat.emissiveMap && mat.name !== 'Dashboard') { mat.emissiveMap = null; mat.emissive.set('#000000'); mat.needsUpdate = true; }
    }
  });
  return gltf;
}
