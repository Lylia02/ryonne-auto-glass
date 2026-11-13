/* =========================================================
   Site content — every piece of text on the site comes from here.
   Inline formatting in strings: *word* → <em>word</em>, \n → <br>
   ========================================================= */

/* ---------- Images (intrinsic sizes for next/image) ---------- */
export type Img = { src: string; w: number; h: number };
const img = (name: string, w: number, h: number): Img => ({ src: `/img/${name}`, w, h });
export const IMG = {
  adas: img('adas.jpg', 1264, 848),
  chip: img('chip.jpg', 1264, 848),
  drive: img('drive.jpg', 1376, 768),
  fleet: img('fleet.jpg', 1376, 768),
  hero: img('hero.jpg', 1376, 768),
  rain: img('rain.jpg', 848, 1264),
  shop: img('shop.jpg', 1264, 848),
  side: img('side.jpg', 1264, 848),
  urethane: img('urethane.jpg', 1264, 848),
  van: img('van.jpg', 1376, 768),
} as const;

/* ---------- Business ---------- */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ryonneautoglass.com';

export const business = {
  name: 'Ryonne Auto Glass',
  legalName: 'Ryonne Auto Glass LLC',
  phone: '(614) 973-3385',
  tel: '6149733385',
  telE164: '+1-614-973-3385',
  email: 'info@ryonneautoglass.com',
  city: 'Columbus',
  region: 'OH',
  country: 'US',
  description: 'OE-grade windshield replacement, rock chip repair and ADAS recalibration in Columbus, Ohio. Mobile or in-shop. 17 years, 800+ jobs.',
  // Structured hours (JSON-LD)
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '18:00' },
    { days: ['Saturday'], opens: '09:00', closes: '15:00' },
  ],
  // Hours as written in different places of the design
  hours: {
    short: 'Columbus, Ohio · Mon–Fri 8–6 · Sat 9–3',
    long: 'Monday to Friday, 8am — 6pm · Saturday 9 — 3',
    footer: ['Mon–Fri 8am – 6pm', 'Saturday 9am – 3pm', 'Sunday closed'],
    inline: 'Mon–Fri 8am – 6pm · Sat 9am – 3pm · Sun closed',
  },
  tagline: 'Mobile & in-shop · Insurance handled',
  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
    { label: 'Google', href: '#' },
  ],
  footerContact: 'Columbus, Ohio · By appointment',
  copyright: '© 2026 Ryonne Auto Glass LLC',
  credit: '3D car: “Car Concept” by Eric Chadwick, © 2024 Darmstadt Graphics Group, CC BY 4.0, modified (logos removed, compressed)',
  creditHref: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept',
};

export const stats = [
  { value: 17, label: 'Years in Columbus' },
  { value: 800, suffix: '+', label: 'Glass jobs done' },
  { value: 4.98, decimals: 2, label: 'Google rating' },
];

export const marqueeMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Jeep', 'Hyundai', 'Kia', 'Subaru', 'Tesla', 'BMW', 'Mercedes'];
export const gridMakes = [...marqueeMakes, 'Audi', 'Volkswagen', 'Mazda', 'Dodge'];

/* ---------- Navigation ---------- */
export const menu = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Process', href: '/#process' },
  { label: 'Diagnose in 3D', href: '/diagnose' },
  { label: 'Fleet', href: '/fleet' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'Contact', href: '/contact' },
];
export const footerMenu = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Diagnose in 3D', href: '/diagnose' },
  { label: 'Fleet', href: '/fleet' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'Contact', href: '/contact' },
];

/* ---------- Intro gate line, per page ---------- */
export const gateLines: Record<string, string> = {
  '/': 'Glass fitted like a safety part · Not simply replaced',
  '/services': 'Five services · One standard',
  '/fleet': 'Zero downtime · One invoice',
  '/diagnose': 'Show us the damage · In 3D',
  '/contact': 'Every chip starts with a conversation',
};

/* ---------- Page metadata ---------- */
export const pages = {
  home: {
    title: 'Ryonne Auto Glass — Columbus, Ohio | Windshield Replacement & ADAS Recalibration',
    description: 'OE-grade windshield replacement, rock chip repair and ADAS recalibration in Columbus, Ohio. Mobile or in-shop. 17 years, 800+ jobs.',
  },
  services: {
    title: 'Services — Ryonne Auto Glass, Columbus',
    description: 'Windshield replacement, rock chip repair, ADAS recalibration, side & back glass, mobile service in Columbus, Ohio.',
  },
  fleet: {
    title: 'Fleet program — Ryonne Auto Glass, Columbus',
    description: 'Priority glass maintenance for vans, trucks and corporate fleets in Columbus. On-site, monthly invoicing, zero downtime.',
  },
  diagnose: {
    title: 'Diagnose your glass in 3D — Ryonne Auto Glass, Columbus',
    description: 'Turn the car, tap the glass that took the hit, and get the right repair and a price. Send your request or a photo in one minute.',
  },
  contact: {
    title: 'Contact & booking — Ryonne Auto Glass, Columbus',
    description: 'Book windshield replacement, chip repair or ADAS recalibration in Columbus. Mobile or in-shop. (614) 973-3385.',
  },
};

/* ---------- Home ---------- */
export const home = {
  hero: {
    lines: ['Every chip', 'starts with', 'a *conversation*'],
    cta: 'Start the conversation',
  },
  makes: {
    label: 'We service all makes & models',
    title: 'Any car, *factory glass*',
    cta: 'Get a quote',
    carAlt: 'Side profile of a car',
  },
  reviewsHead: { eyebrow: 'What drivers say', title: 'Rated *4.98* from 800+ jobs' },
};

/* ---------- Process (home + fleet) ---------- */
export type ProcessData = {
  eyebrow: string; title: string; skipHref: string;
  steps: { title: string; text: string; img: Img }[];
};
export const homeProcess: ProcessData = {
  eyebrow: 'How it works',
  title: 'A considered process\n*built around your car*',
  skipHref: '#services',
  steps: [
    { title: 'Vehicle\nintake', img: IMG.shop, text: 'Your VIN is checked against our glass database so the part matches the exact factory specification: tint band, rain sensor, heating elements, camera bracket' },
    { title: 'Damage\nscan', img: IMG.chip, text: 'Technicians inspect fracture depth and frame integrity, then document the damage for your insurer. If a chip can be saved, we repair it instead of replacing' },
    { title: 'Removal\n& prep', img: IMG.urethane, text: 'Damaged glass comes out without touching your paint. The pinch-weld is cleaned, primed and prepped for a bond that meets FMVSS 212 standards' },
    { title: 'Precision\ninstall', img: IMG.hero, text: 'New glass set with OE-grade urethane to factory tolerance, ADAS cameras recalibrated and verified, and a safe drive-away time you can trust' },
  ],
};
export const fleetProcess: ProcessData = {
  eyebrow: 'How a fleet job runs',
  title: 'From your call\n*to the road*',
  skipHref: '#contact-cta',
  steps: [
    { title: 'One\ncall', img: IMG.rain, text: 'Your fleet manager texts or calls one number with the plate and the damage. We confirm a slot within the hour' },
    { title: 'Depot\nvisit', img: IMG.fleet, text: 'The van arrives at your depot before the first shift with the right glass already loaded, matched by VIN' },
    { title: 'Fit &\ncalibrate', img: IMG.adas, text: 'Glass fitted, urethane cured, ADAS recalibrated and documented — the vehicle is cleared to drive before the driver clocks in' },
    { title: 'One\ninvoice', img: IMG.shop, text: 'Every job lands on a single monthly invoice with plate, date, part and calibration report attached' },
  ],
};

/* ---------- Services (carousel on home + detail page) ---------- */
export const services = [
  {
    n: '01', name: 'Windshield Replacement', img: IMG.hero,
    short: 'OE-grade glass set with high-strength urethane for structural integrity and a watertight seal. Lifetime leak warranty',
    title: 'Windshield *replacement*', alt: 'Windshield being set onto an SUV',
    text: 'OE-grade laminated glass matched to your VIN — tint band, rain sensor, heated wiper park, camera bracket — set with high-strength urethane to FMVSS 212 standards. Lifetime leak warranty, insurance handled for you',
    facts: [['90 min', 'average install'], ['60 min', 'safe drive-away'], ['Lifetime', 'leak warranty']],
    price: 'from $249', cta: 'Get a quote', href: '/contact',
  },
  {
    n: '02', name: 'Rock Chip Repair', img: IMG.chip,
    short: 'Resin injection stops the crack and restores clarity. Thirty minutes, same day, mobile or in-shop',
    title: 'Rock chip *repair*', alt: 'Resin injection into a rock chip',
    text: 'A chip the size of a quarter can be saved if we reach it before it spreads. Vacuum-pressure resin injection fills the break, restores clarity and keeps your original factory seal intact',
    facts: [['30 min', 'on site'], ['$0', 'with most insurers'], ['Same-day', 'availability']],
    price: 'from $79', cta: 'Book a repair', href: '/contact',
  },
  {
    n: '03', name: 'ADAS Recalibration', img: IMG.adas,
    short: 'Cameras and radar recalibrated so lane-keep and auto-brake work exactly like factory',
    title: 'ADAS *recalibration*', alt: 'ADAS calibration target in front of a sedan',
    text: 'Lane-keep, auto-brake and adaptive cruise all read the road through your windshield camera. After any replacement we run static and dynamic calibration and hand you a certified report',
    facts: [['Static', 'target board'], ['Dynamic', 'road test'], ['Report', 'for insurer']],
    price: 'from $199', cta: 'Get a quote', href: '/contact',
  },
  {
    n: '04', name: 'Side & Back Glass', img: IMG.side,
    short: 'Tempered glass replaced with full interior debris cleanup and regulator check',
    title: 'Side & back *glass*', alt: 'Technician cleaning a new side window',
    text: 'Tempered door, quarter and rear glass replaced with full interior debris cleanup, regulator check and heated/antenna elements reconnected. Most same-day',
    facts: [['45 min', 'average'], ['Vacuum', 'interior cleanup'], ['Heated', 'rear glass']],
    price: 'from $179', cta: 'Get a quote', href: '/contact',
  },
  {
    n: '05', name: 'Mobile Service', img: IMG.van,
    short: 'Home, office or parking lot: our van brings the shop to your driveway anywhere in Columbus',
    title: 'Mobile *service*', alt: 'Mobile service van in a driveway at dusk',
    text: 'Home, office or parking lot: the van carries the glass, the urethane and the calibration rig. Anywhere inside the Columbus outer belt, no extra charge',
    facts: [['I-270', 'service area'], ['$0', 'travel fee'], ['7am', 'earliest slot']],
    price: 'included', cta: 'Book mobile', href: '/contact?mode=mobile',
  },
];

/* ---------- Glass Choir — home services showcase ----------
   Each service is shown like a gemstone: one "cut" (an 8-point
   polygon, x y in %) and one light tone. The cut morphs from one
   service to the next, so every polygon keeps 8 points in the same
   order (start top-left, clockwise). */

/* Gem cuts and light tones, one per service (services page jewel, fleet tiers) */
export const choir = {
  cuts: [
    '18% 14%, 50% 9%, 82% 14%, 95% 50%, 99% 88%, 50% 93%, 1% 88%, 5% 50%',   // windshield
    '30% 3%, 70% 3%, 97% 30%, 97% 70%, 70% 97%, 30% 97%, 3% 70%, 3% 30%',     // chip — round brilliant
    '24% 6%, 50% 6%, 76% 6%, 99% 50%, 76% 94%, 50% 94%, 24% 94%, 1% 50%',     // ADAS — hexagon
    '30% 7%, 76% 7%, 97% 38%, 97% 93%, 50% 93%, 3% 93%, 4% 58%, 12% 28%',     // side glass
    '14% 3%, 86% 3%, 97% 14%, 97% 86%, 86% 97%, 14% 97%, 3% 86%, 3% 14%',     // mobile — emerald cut
  ],
  tones: ['#8fb4ff', '#ffd400', '#36e2ff', '#e8102a', '#ff8a3d'],
};

/* ---------- Home, cinematic chapters (inspired by a scroll-told product story) ---------- */
export const cinema = {
  kicker: 'About Ryonne',
  text: "We're driven by *precision*. By the one-millimeter alignment most shops overlook. Every chip is a crack waiting to spread, every install a chance to make your car *safer*, *quieter*, *factory-right*",
};

export const bay = {
  kicker: 'How it works',
  title: 'Four steps, one bay',
  step: 'Step',
  shots: ['Shot 01 · VIN match', 'Shot 02 · Glass scan', 'Shot 03 · Pinch-weld prep', 'Shot 04 · Set & cure'],
};

export const surfaces = {
  kicker: 'Service',
  words: ['Sealed', 'Saved', 'Aligned', 'Cleared', 'On site'],
};

export const value = {
  title: 'Real value',
  tabs: [
    {
      label: 'For drivers', cta: 'Get my quote', href: '/contact',
      rows: [
        ['Clarity over guesswork,', 'you see the price before we start, with no surprise line items'],
        ['Safety over speed,', 'every windshield cures to a safe drive-away time and every camera is recalibrated'],
        ['Your time over ours,', 'the mobile van comes to your home or office at no extra charge'],
        ['Paperwork handled,', 'we file the insurance claim and bill your insurer directly'],
      ],
    },
    {
      label: 'For fleets', cta: 'Fleet program', href: '/fleet',
      rows: [
        ['Uptime over downtime,', 'priority scheduling keeps your vehicles on the road and earning'],
        ['One invoice over ten,', 'every job across the fleet on one consolidated bill'],
        ['Records over memory,', 'each job logged with the VIN, photos and the calibration report'],
        ['The yard over the shop,', 'we come to your depot so drivers never leave their route'],
      ],
    },
  ],
};

/* ---------- Diagnose in 3D — configurator before the quote form ----------
   `nodes` are mesh names inside /models/car.glb. `form` is the value
   it pre-selects in the quote form's "Damaged glass" field. */
export type GlassId = 'windshield' | 'driver' | 'passenger' | 'quarter' | 'rear';
export type DamageId = 'chip' | 'crack' | 'shattered';
export const diagnose = {
  eyebrow: 'Diagnose in 3D',
  title: 'Show us\n*the damage*',
  text: 'Turn the car, tap the glass that took the hit and tell us what happened. We match the right repair and pre-fill your quote',
  model: '/models/car.glb',
  steps: { glass: 'Which glass?', damage: 'What happened?', paint: 'Your colour' },
  glass: [
    { id: 'windshield', label: 'Windshield', node: 'BodyWindshield', form: 'Windshield' },
    { id: 'driver', label: 'Driver window', node: 'BodyDoorLWindow', form: 'Side window' },
    { id: 'passenger', label: 'Passenger window', node: 'BodyDoorRWindow', form: 'Side window' },
    { id: 'quarter', label: 'Rear side glass', node: 'BodyWindowsRearSides', form: 'Side window' },
    { id: 'rear', label: 'Rear glass', node: 'BodyRearwindow', form: 'Rear glass' },
  ] as { id: GlassId; label: string; node: string; form: string }[],
  damage: [
    { id: 'chip', label: 'Chip', hint: 'Smaller than a quarter' },
    { id: 'crack', label: 'Crack', hint: 'A line that spreads' },
    { id: 'shattered', label: 'Shattered', hint: 'Broken or missing' },
  ] as { id: DamageId; label: string; hint: string }[],
  paints: [
    { variant: 'Torched Graphite', label: 'Graphite', swatch: '#3b3e44' },
    { variant: 'Pearly Swirly', label: 'Pearl', swatch: '#ebe8e2' },
    { variant: 'Carmine Candy', label: 'Carmine', swatch: '#8a0f1d' },
  ],
  modes: { model: '3D diagnosis', photo: 'Send a photo' },
  vehicleTypes: ['Sedan', 'SUV', 'Pickup', 'Van', 'Coupe'],
  request: {
    title: 'Get your\n*quote*',
    photoTitle: 'Send us\n*a photo*',
    photoText: 'One clear photo of the damage is enough. We reply with a price within the hour',
    summary: 'Your diagnosis',
    back: 'Change the diagnosis',
    type: 'Vehicle type',
    which: 'Which glass?',
    drop: 'Drop a photo or tap to choose',
    dropHint: 'JPG or PNG, up to 10MB',
    attach: 'Add a photo',
    placeholder: 'Your photo shows up here',
    send: 'Send my request',
    sending: 'Sending…',
    fullForm: 'Use the full form',
  },
  sent: { title: 'Request\n*sent*', text: 'Thank you. We reply within the hour during opening times, with a price and a slot', again: 'New request' },
  idle: 'Tap a glass on the car, or pick one here',
  pickDamage: 'Now tell us what happened',
  loading: 'Preparing the car',
  cta: 'Get my quote',
  reset: 'Start over',
  rotate: 'Drag to turn',
};

/** Which repair a glass + damage combination needs (prices = price list above). */
export function diagnoseResult(glass: GlassId, damage: DamageId) {
  if (glass === 'windshield') {
    if (damage === 'chip') return {
      service: 'Rock chip repair', price: 'from $79', time: '30 min',
      note: 'Usually $0 with comprehensive insurance. A repair keeps your factory seal intact',
    };
    return {
      service: 'Windshield replacement', price: 'from $249', time: '90 min',
      extra: 'ADAS recalibration · from $199',
      note: damage === 'crack'
        ? 'A spreading crack can’t be repaired safely. If your windshield carries a camera, we recalibrate it'
        : 'Don’t drive with a shattered windshield: our van comes to you',
    };
  }
  if (glass === 'rear') return {
    service: 'Rear glass replacement', price: 'from $229', time: '60 min',
    note: 'Rear glass is tempered: it is replaced, never repaired. Heating and antenna reconnected',
  };
  return {
    service: 'Side window replacement', price: 'from $179', time: '45 min',
    note: 'Side glass is tempered: it is replaced, never repaired. Full interior vacuum included',
  };
}

/* ---------- Price rows ---------- */

/* ---------- Reviews ---------- */
export const reviews = [
  { quote: '“Fast and professional. The recalibration was spot on”', author: 'Mark T. · 2021 Honda Civic', img: IMG.hero },
  { quote: '“Fixed the chip before it spread. Clean work”', author: 'David L. · 2019 Subaru Ascent', img: IMG.chip },
  { quote: '“We use Ryonne for all our company vans. Zero downtime”', author: 'Sarah J. · Fleet manager', img: IMG.van },
  { quote: '“Explained every step and the price matched the quote”', author: 'Priya R. · 2022 Tesla Model 3', img: IMG.adas },
  { quote: '“Came to my office. Done before lunch”', author: 'Carlos M. · 2020 Ford F-150', img: IMG.drive },
];

/* ---------- Home: teaser for the 3D diagnosis page ---------- */
export const diagnoseTeaser = {
  eyebrow: 'Diagnose in 3D',
  title: 'Show us\n*the damage*',
  text: 'Turn the car, tap the glass that took the hit and get the right repair with a price. Or just send us a photo',
  cta: 'Open the 3D diagnosis',
  href: '/diagnose',
  img: img('diagnose-teaser.jpg', 1280, 800),
};

/* ---------- Reviews — the wiper ---------- */
export const reviewsWiper = {
  eyebrow: 'What drivers say',
  score: '4.98',
  label: 'Average rating from 800+ jobs in Columbus',
  hint: 'Tap the glass',
};

/* ---------- Quote form ---------- */
export const quoteForm = {
  eyebrow: 'Get a quote',
  title: 'Define your\n*glass*',
  text: 'Share your vehicle details so we can prepare a tailored quote. We aim to respond within the hour during opening times',
  contactMethods: ['Phone', 'Email', 'Text'],
  glass: ['Windshield', 'Side window', 'Rear glass', 'Not sure'],
  services: [
    { value: 'mobile', label: 'Mobile — we come to you' },
    { value: 'in-shop', label: 'In-shop — Columbus bay' },
  ],
  success: "Thank you — we'll be in touch within the hour during opening times",
  fleetMessage: (program: string) => `Fleet enquiry — ${program} program. Vehicles: [number] · Depot: [address]`,
};

/* ---------- Services page ---------- */
export const servicesPage = {
  hero: { eyebrow: 'Services', lines: ['Glass work,', '*factory-right*'], text: 'Five services, one standard. OE-grade glass, structural urethane, certified ADAS recalibration — mobile or in our Columbus bay', img: IMG.shop },
  faqTitle: 'Questions\n*drivers ask*',
  closing: { eyebrow: 'Ready when you are', title: 'Book today', cta: 'Start the conversation', href: '/contact', img: IMG.drive },
};

export const faq = [
  { q: 'Will my insurance cover it?', a: 'In Ohio, most comprehensive policies cover glass with a low or zero deductible. We file the claim for you and bill the insurer directly' },
  { q: 'How long before I can drive?', a: 'Our urethane reaches safe drive-away strength in 60 minutes at room temperature. We give you the exact time on your invoice' },
  { q: 'Do you use original glass?', a: 'OE or OEE (same manufacturer, same specification). We never fit second-tier aftermarket glass on a vehicle with a camera' },
  { q: 'Is recalibration really needed?', a: 'Yes — manufacturers require it after any windshield replacement on a camera-equipped car. A camera off by one degree reads the lane 1.5 metres wrong at 80 metres' },
  { q: 'What about rain sensors and heated glass?', a: 'Matched by VIN. The new glass carries the same sensor gel pad, heating grid and acoustic layer as the original' },
];

/* ---------- Fleet page ---------- */
export const fleetPage = {
  hero: { eyebrow: 'Commercial fleets', lines: ['Zero', '*downtime*'], text: 'Priority glass maintenance for vans, trucks and corporate fleets in Columbus. One invoice a month, one number to call, vehicles back on the road the same day', img: IMG.fleet },
  stats: [
    { value: 140, suffix: '+', label: 'Fleet vehicles' },
    { value: 24, suffix: 'h', label: 'Max turnaround' },
    { value: 0, prefix: '$', label: 'Travel fee' },
    { value: 1, label: 'Monthly invoice' },
  ],
  manifesto: {
    eyebrow: 'Why fleets choose Ryonne',
    text: 'A van off the road costs you *$600 a day*. We come to your depot before the first shift, fit the glass, recalibrate, and the driver never knows it was *cracked*',
    sub: 'Before 7am · On site · Invoiced monthly',
    left: { img: IMG.van, alt: '' },
    right: { img: IMG.urethane, alt: '' },
  },
  tiersHead: { eyebrow: 'Programs', title: 'Three ways to *partner*' },
  closing: { eyebrow: 'Keep your fleet', title: 'On the road', cta: 'Request fleet pricing', href: '/contact?fleet=priority', img: IMG.fleet, id: 'contact-cta' },
};

export const tiers = [
  { id: 'starter', k: 'Up to 10 vehicles', name: 'Starter', price: 'Pay', unit: 'PER JOB', perks: ['Priority scheduling', 'On-site service, no travel fee', 'Monthly consolidated invoice', 'Insurance filing handled'], cta: 'Enquire' },
  { id: 'priority', k: '10 – 50 vehicles', name: 'Priority', price: '−15%', unit: 'ALL GLASS WORK', perks: ['Everything in Starter', 'Dedicated account manager', 'Pre-shift slots from 6am', 'Quarterly fleet glass inspection', 'ADAS compliance reports'], cta: 'Enquire', hot: true },
  { id: 'enterprise', k: '50+ vehicles', name: 'Enterprise', price: 'Custom', unit: 'CONTRACT', perks: ['Everything in Priority', 'Technician on retainer', 'Glass stock held for your models', 'Multi-site coverage'], cta: 'Talk to us' },
] as const;
export const fleetPrograms = tiers.map(t => t.id);

/* ---------- Contact page ---------- */
export const contactPage = {
  hero: { eyebrow: 'Contact & booking', lines: ['Every chip', 'starts with a', '*conversation*'], text: 'Call, message, or send your vehicle details below. We answer within the hour during opening times and most jobs are booked for the same day', img: IMG.rain },
  cards: [
    { k: 'Phone', title: business.phone, text: business.hours.long, href: `tel:${business.tel}` },
    { k: 'Email', title: business.email, text: 'We aim to respond within the hour', href: `mailto:${business.email}` },
    { k: 'Visit us', title: 'Columbus, Ohio', text: 'In-shop by appointment · mobile anywhere inside I-270' },
  ],
  bay: {
    eyebrow: 'The bay', title: 'Columbus,\n*by appointment*', img: IMG.shop, alt: 'Inside the Ryonne Auto Glass bay',
    facts: [
      ['Hours', business.hours.inline],
      ['Mobile', 'Anywhere inside the I-270 outer belt, no travel fee'],
      ['Insurance', 'All major carriers · claim filed for you'],
      ['Payment', 'Card, fleet invoice, insurance direct-bill'],
    ],
    cta: 'Call now',
  },
};
