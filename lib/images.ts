// La liste de nos images (dans public/images) avec leur taille réelle en pixels.
// next/image a besoin de width/height pour réserver la place avant le chargement
// (sinon la page "saute" quand l'image arrive).
//
// Pour ajouter une vraie photo plus tard :
//   1. mets le fichier dans public/images/
//   2. ajoute une ligne ici avec sa taille
//   3. utilise-la :  <Image {...images.maPhoto} alt="..." />

export const images = {
  carMidnight: { src: "/images/car-midnight.webp", width: 1707, height: 680 },
  carMidnight2: { src: "/images/car-midnight-2.webp", width: 1780, height: 661 },
  carFrontWhite: { src: "/images/car-front-white.webp", width: 1329, height: 1170 },
  carFrontBlue: { src: "/images/car-front-blue.webp", width: 1338, height: 1174 },
  carHeroSilver: { src: "/images/car-hero-silver.webp", width: 1587, height: 633 },
  carSideGraphite: { src: "/images/car-side-graphite.webp", width: 1408, height: 448 },
  carWhite: { src: "/images/car-white.webp", width: 1600, height: 595 },
  detailGlass: { src: "/images/detail-glass.webp", width: 1365, height: 1200 },

  // ---- LES PHOTOS DE LA PAGE D'ACCUEIL (générées avec Gemini) ----
  // Pour changer une photo : mets-la dans public/images/
  // puis remplace le src + la taille (width/height) sur la bonne ligne.
  hero: { src: "/images/hero.jpg", width: 2912, height: 1440 },
  serviceWindshield: { src: "/images/service-windshield.jpg", width: 2400, height: 1792 },
  serviceChip: { src: "/images/service-chip.jpg", width: 2400, height: 1792 },
  serviceAdas: { src: "/images/service-adas.jpg", width: 2400, height: 1792 },
  serviceSide: { src: "/images/car-side-graphite.webp", width: 1408, height: 448 }, // ⚠️ à remplacer -> service-side.jpg (format 4:3)
  promoMobile: { src: "/images/promo-mobile.jpg", width: 2400, height: 1792 },
  promoFleet: { src: "/images/promo-fleet.jpg", width: 2624, height: 1632 },
};

export type ImageKey = keyof typeof images;
