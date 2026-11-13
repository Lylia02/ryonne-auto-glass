/* Image sequences played by <FrameSequence> (public/seq/<name>-<set>/000.webp …).
   d = wide screens (1920×1080), m = phones held upright (720×1280).
   They were rendered from the 3D car scenes, one picture per step of the scroll.
   To load faster, every file holds `per` pictures stacked on top of each other. */
export const sequences = {
  base: '/seq',
  per: 2,
  drive: { d: 110, m: 70 },     // the drive at blue hour (About)
  arrival: { d: 100, m: 64 },   // the car drives in and parks side-on
} as const;

export type SequenceName = 'drive' | 'arrival';
