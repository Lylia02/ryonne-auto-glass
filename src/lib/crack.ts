/* Damage marks (chip / crack / shattered) drawn once on a canvas and
   used as a texture — shared by the 3D configurator and the services reel. */
import * as THREE from 'three';
import type { DamageId } from './site';

const markTextures: Partial<Record<DamageId, THREE.CanvasTexture>> = {};
export function crackTexture(type: DamageId) {
  if (markTextures[type]) return markTextures[type]!;
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d')!, cx = S / 2;
  let seed = type === 'chip' ? 7 : type === 'crack' ? 21 : 42;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  g.lineCap = 'round';
  const branch = (x: number, y: number, a: number, len: number, w: number, depth: number) => {
    g.lineWidth = w; g.strokeStyle = `rgba(255,255,255,${.55 + .4 * rnd()})`;
    g.beginPath(); g.moveTo(x, y);
    const steps = 6 + Math.floor(rnd() * 5);
    for (let i = 0; i < steps; i++) {
      a += (rnd() - .5) * .7; x += Math.cos(a) * len / steps; y += Math.sin(a) * len / steps; g.lineTo(x, y);
      if (depth > 0 && rnd() < .22) { g.stroke(); branch(x, y, a + (rnd() - .5) * 1.6, len * .45, w * .7, depth - 1); g.lineWidth = w; g.strokeStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.moveTo(x, y); }
    }
    g.stroke();
  };
  const rays = type === 'chip' ? 9 : type === 'crack' ? 4 : 14;
  const reach = type === 'chip' ? S * .2 : type === 'crack' ? S * .48 : S * .46;
  for (let i = 0; i < rays; i++) branch(cx, cx, (i / rays) * Math.PI * 2 + rnd() * .5, reach * (.55 + .45 * rnd()), type === 'chip' ? 2.4 : 3, type === 'chip' ? 0 : 2);
  if (type !== 'crack') { // concentric breaks
    const rings = type === 'chip' ? 2 : 4;
    for (let r = 1; r <= rings; r++) {
      g.lineWidth = 1.6; g.strokeStyle = 'rgba(255,255,255,.5)';
      const R = (type === 'chip' ? S * .06 : S * .1) * r;
      g.beginPath();
      for (let k = 0; k <= 24; k++) {
        const t = k / 24 * Math.PI * 2, j = R * (.85 + .3 * rnd()), x = cx + Math.cos(t) * j, y = cx + Math.sin(t) * j;
        if (k) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.stroke();
    }
  }
  const glow = g.createRadialGradient(cx, cx, 0, cx, cx, S * .07); // impact point
  glow.addColorStop(0, 'rgba(255,255,255,.95)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(cx, cx, S * .07, 0, Math.PI * 2); g.fill();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return (markTextures[type] = tex);
}
