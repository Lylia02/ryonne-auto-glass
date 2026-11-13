/* Spinning wheels for the 3D car.
   In the model each wheel is several parts (tyre, rim, brake disc) placed
   around the wheel's centre, not around their own origin. rigWheels() puts
   each wheel's parts in a pivot at the tyre's centre, so turning the pivot
   on its axle spins the wheel in place. Brake pads stay put, as on a real car.
   Call it on a clone of the scene (any scaling around it is fine). */
import * as THREE from 'three';

const CORNERS = ['FrontL', 'FrontR', 'RearL', 'RearR'];

export function rigWheels(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true);   // parents too: the box below needs up-to-date world matrices
  const pivots: THREE.Group[] = [];
  let radius = .35;
  for (const c of CORNERS) {
    const tyre = root.getObjectByName(`Wheel${c}`);
    if (!tyre?.parent) continue;
    const parts: THREE.Object3D[] = [];
    root.traverse(o => { if (o.name.startsWith(`Wheel${c}`) && !/pad/i.test(o.name) && !parts.some(p => p === o.parent)) parts.push(o); });
    const box = new THREE.Box3().setFromObject(tyre);
    const centre = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    radius = Math.max(size.y, Math.min(size.x, size.z)) / 2;
    const parent = tyre.parent;
    const pivot = new THREE.Group();
    parent.add(pivot);
    pivot.position.copy(parent.worldToLocal(centre.clone()));
    pivot.updateMatrixWorld(true);
    parts.forEach(p => pivot.attach(p));
    pivots.push(pivot);
  }
  /** spin by the distance travelled (model units, before scaling); the axle runs along X */
  const roll = (distance: number) => pivots.forEach(p => { p.rotation.x += distance / radius; });
  return { roll, radius };
}
