'use client';
/* The car model shared by the 3D scenes (configurator, fleet hero).
   /models/car.glb — "Car Concept" © Darmstadt Graphics Group, CC BY 4.0,
   compressed with gltf-transform (meshopt geometry + webp textures). */
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { diagnose } from './site';

export const useCarModel = () => useGLTF(diagnose.model) as unknown as GLTF;
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
