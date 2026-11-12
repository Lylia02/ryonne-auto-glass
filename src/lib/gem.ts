/* Gem geometry from an 8-point "cut" (x y in %, see choir.cuts in site.ts):
   the inner table facet, the facet lines and the outline, as SVG/CSS strings. */
export const GEM_K = .56; // size of the inner "table" facet

const pts = (cut: string) => cut.split(',').map(p => p.trim().split(/\s+/).map(parseFloat));
const inner = (cut: string) => pts(cut).map(([x, y]) => [50 + (x - 50) * GEM_K, 50 + (y - 50) * GEM_K]);

export const tableClip = (cut: string) => inner(cut).map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(', ');
export const tablePoints = (cut: string) => inner(cut).map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
export const edgePoints = (cut: string) => pts(cut).map(([x, y]) => `${x},${y}`).join(' ');
export const facetPath = (cut: string) => {
  const o = pts(cut), t = inner(cut);
  return o.map(([x, y], n) => {
    const a = t[n], b = t[(n + 1) % o.length];
    return `M${x} ${y}L${a[0].toFixed(2)} ${a[1].toFixed(2)}M${x} ${y}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
  }).join('');
};
