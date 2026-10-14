// ============================================================
// TOUT LE CONTENU DU SITE EST ICI.
// Pour changer un texte, un numéro, un horaire : modifie ce fichier,
// pas les composants. Les pages lisent ces données et les affichent.
// ============================================================

import type { ImageKey } from "./images";
export const business = {
  name: "Ryonne Auto Glass LLC",
  city: "Columbus, Ohio",
  phone: "(614) 973-3385",
  phoneHref: "tel:+16149733385",
  email: "Ryonneautoglass@info.com", // ⚠️ à remplacer par la vraie adresse
  note: "By Appointment Only",
  hours: [
    { days: "Mon–Fri", time: "8am – 6pm" },
    { days: "Saturday", time: "9am – 3pm" },
    { days: "Sunday", time: "Closed" },
  ],
};

// Les liens de la barre du haut
export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/book", label: "Contact" },
];

export const stats = [
  { value: "17 years", label: "Expert service, all makes & models" },
  { value: "4.98", label: "Client rating from 800+ jobs" },
  { value: "5,000+", label: "Glass jobs completed" },
  { value: "Same day", label: "Mobile or in-shop service" },
];

// Les services : `image` = le nom d'une image de lib/images.ts
export const services = [
  {
    id: "windshield",
    code: "GLS-01",
    short: "Windshield",
    name: "Windshield Replacement",
    title: "OEM windshield replacement.",
    summary:
      "Full OE-grade glass replacement using high-strength urethane adhesives for structural integrity and safety.",
    text: "Precision-fit windshields using OE-grade glass and structural adhesives for factory-standard safety and optical clarity.",
    points: [
      "Certified technicians with 17 years of specialized glass experience",
      "High-strength urethane curing for rapid, safe vehicle return",
      "Full compliance with all vehicle safety and structural standards",
    ],
    badges: ["Precision Aligned", "Safety Certified"],
    image: "carFrontWhite" as ImageKey,
  },
  {
    id: "adas",
    code: "GLS-03",
    short: "ADAS",
    name: "ADAS Recalibration",
    title: "ADAS camera recalibration.",
    summary: "Camera and sensor recalibration so your safety systems work with factory precision.",
    text: "Advanced driver assistance system recalibration to ensure lane departure and collision sensors function perfectly.",
    points: [
      "Digital target alignment for front-facing camera sensor arrays",
      "Post-replacement diagnostic testing for all safety systems",
      "Detailed documentation for insurance and safety records",
    ],
    badges: ["Rapid Turnaround", "Quality Guaranteed"],
    image: "carHeroSilver" as ImageKey,
  },
  {
    id: "side",
    code: "GLS-04",
    short: "Side & Rear",
    name: "Side & Back Glass",
    title: "Side & rear glass repair.",
    summary: "Tempered side and rear glass with thorough interior debris cleanup.",
    text: "Expert replacement of tempered door glass and heated rear windows, including thorough debris removal and vacuuming.",
    points: [
      "Complete removal of shattered glass from door panels and tracks",
      "Testing of power window regulators and heating elements",
      "OE-spec glass matching for perfect fit and weather sealing",
    ],
    badges: ["Rapid Turnaround", "Quality Guaranteed"],
    image: "carSideGraphite" as ImageKey,
  },
  {
    id: "fleet",
    code: "FLEET",
    short: "Fleet",
    name: "Commercial Fleet Glass",
    title: "Commercial fleet glass.",
    summary: "Priority glass maintenance for vans, trucks and corporate fleets to minimize downtime.",
    text: "Priority glass maintenance for delivery vans, contractor trucks, and corporate fleets to minimize vehicle downtime.",
    points: [
      "Bulk glass inventory for rapid response on common fleet models",
      "Flexible scheduling to accommodate your operational hours",
      "Dedicated account management for consistent service quality",
    ],
    badges: ["Scheduled Priority", "Corporate Billing"],
    image: "carMidnight" as ImageKey,
  },
];

export const chipRepair = {
  code: "GLS-02",
  name: "Rock Chip Repair",
  summary: "Precision resin injection to stop crack propagation and restore clarity.",
  badges: ["Same-Day Service", "Mobile or In-Shop"],
  image: "detailGlass" as ImageKey,
};

// Les 4 arguments avec icône (page d'accueil). `icon` = un nom de components/Icon.tsx
export const features = [
  { icon: "shield", title: "OE-Grade Glass", text: "Factory-standard glass and structural urethane for a safe, precise fit." },
  { icon: "award", title: "17 Years Experience", text: "Certified technicians who work on all makes and models." },
  { icon: "van", title: "Mobile Service", text: "We come to your home or workplace anywhere in Columbus." },
  { icon: "clock", title: "Same-Day Service", text: "Most repairs and replacements done the same day." },
] as const;

// La bande "We service all makes & models" (simples noms écrits, pas de logos officiels)
export const brands = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "Jeep", "Hyundai", "Kia"];

export const specs = [
  { title: "OE-grade glass", text: "Precision-fit windshields for factory-standard safety and optical clarity." },
  { title: "Structural urethane bond", text: "High-strength urethane curing for a rapid, safe vehicle return." },
  { title: "ADAS recalibration", text: "Forward-facing camera alignment following every replacement." },
];

export const steps = [
  {
    n: "01",
    tag: "Vehicle intake",
    title: "Vehicle data entry",
    short: "We verify your glass specifications against our database to ensure a perfect factory-grade fit.", // version courte (page d'accueil)
    text: "Submit your vehicle year, make, and model details. We verify your glass specifications against our database to ensure a perfect factory-grade fit.",
    points: ["Confirm glass type and tint level", "Check for ADAS sensor requirements", "Verify vehicle trim and molding"],
    badges: ["VIN Verification", "Instant Match"],
  },
  {
    n: "02",
    tag: "Damage scan",
    title: "Damage assessment",
    short: "Our technicians inspect fracture depth and frame integrity, and document the damage.", // version courte (page d'accueil)
    text: "Our technicians inspect the fracture depth and frame integrity. We document the damage to ensure the new glass bonds securely to the vehicle chassis.",
    points: ["Assess crack length and severity", "Inspect frame for rust or debris", "Document existing sensor condition"],
    badges: ["Safety Inspection", "Photo Verified"],
  },
  {
    n: "03",
    tag: "Glass prep",
    title: "Removal & preparation",
    short: "Damaged glass removed without scratching your paint. The frame is cleaned and primed.", // version courte (page d'accueil)
    text: "We carefully remove the damaged glass without scratching your paint. The frame is cleaned and primed to create a clean surface for the new seal.",
    points: ["Safe removal of old adhesive", "Frame surface decontamination", "Apply high-strength primer"],
    badges: ["Zero Scratch Guarantee", "Precision Prep"],
  },
  {
    n: "04",
    tag: "Installation",
    title: "Precision installation",
    short: "New glass set with OE-grade urethane to factory tolerances, with a watertight seal.", // version courte (page d'accueil)
    text: "Using OE-grade urethane, we set your new glass with factory-level precision. We ensure a watertight seal and perfect optical clarity for your safety.",
    points: ["Apply uniform urethane bead", "Set glass to factory tolerances", "Final inspection of all seals"],
    badges: ["17 Years Experience", "Same-Day Ready"],
  },
];

export const reviews = [
  {
    quote:
      "Ryonne Auto Glass was fast and professional. They handled my windshield replacement perfectly and the recalibration was spot on.",
    name: "Mark T.",
    detail: "2021 Honda Civic · Windshield Replacement",
  },
  {
    quote:
      "They came to my home and fixed the chip before it spread. Very polite, clean work, and they explained the whole process.",
    name: "David L.",
    detail: "2019 Subaru Ascent · Chip Repair",
  },
  {
    quote: "We use Ryonne for all our company vans. They keep our fleet safe and on the road with zero downtime.",
    name: "Sarah J.",
    detail: "Fleet Manager · 4x Ford Transit",
  },
];

export const trust = [
  { title: "17 Years Experience", text: "Expert glass craft" },
  { title: "Columbus Based", text: "Local auto service" },
  { title: "Safety Certified", text: "Quality installation" },
];

export const footerServices = [
  "Windshield Replacement",
  "Auto Glass Repair",
  "ADAS Recalibration",
  "Side Window Repair",
  "Rear Glass Replacement",
  "Mobile Glass Service",
];

// Les choix du formulaire de réservation (⚠️ à confirmer avec ton frère)
export const bookingOptions = {
  repairOrReplace: ["Repair", "Replace", "Not sure"],
  glass: [
    "Windshield",
    "Driver front door",
    "Passenger front door",
    "Driver rear door",
    "Passenger rear door",
    "Rear windshield (back glass)",
    "Quarter glass",
    "Sunroof",
  ],
  service: [
    "Windshield Replacement",
    "Rock Chip Repair",
    "ADAS Recalibration",
    "Side & Rear Glass",
    "Commercial Fleet Glass",
  ],
  location: [
    { value: "Mobile", label: "Mobile service", hint: "We come to your location" },
    { value: "In-shop", label: "In-shop", hint: "Our Columbus workshop" },
  ],
  windows: ["Morning · 8am – 12pm", "Afternoon · 12pm – 6pm"],
};
