# Ryonne Auto Glass — Next.js

Migration du site statique `../ryonne-site` vers Next.js 15 (App Router, TypeScript).
Les animations sont reprises à l'identique (mêmes valeurs GSAP, GSAP 3.13.0, Lenis 1.1.18).
Typographie : Manrope pour tout le site (titres, chiffres, texte).

## Lancer

```bash
npm install
cp .env.example .env.local     # puis renseigner FORMSPREE_ENDPOINT
npm run dev                    # http://localhost:3000
```

| Commande        | Rôle                                   |
| --------------- | -------------------------------------- |
| `npm run dev`   | serveur de dev (Turbopack)             |
| `npm run build` | build de production (lint + types)     |
| `npm start`     | sert le build de production            |
| `npm run lint`  | ESLint                                 |

## Variables d'environnement

| Variable               | Obligatoire | Rôle |
| ---------------------- | ----------- | ---- |
| `FORMSPREE_ENDPOINT`   | oui         | URL du formulaire Formspree, ex. `https://formspree.io/f/abcdwxyz`. Utilisée uniquement côté serveur (Server Action). Sans elle, le formulaire affiche « Online booking isn't live yet » avec le téléphone. |
| `NEXT_PUBLIC_SITE_URL` | non         | URL publique du site (canonical, Open Graph, sitemap, JSON-LD). Défaut : `https://ryonneautoglass.com`. |

Côté Formspree :
- désactiver le reCAPTCHA du formulaire (l'envoi se fait depuis le serveur, en JSON) ;
- l'upload de photo nécessite un plan Formspree qui accepte les fichiers. Sur le plan gratuit, Formspree refuse l'envoi et le message d'erreur s'affiche sous le formulaire.

## Structure

```
public/
  img/              photos (servies et optimisées par next/image)
src/
  app/
    layout.tsx      polices + MotionProvider + Gate + rideau + Chrome + Nav + <main> + Footer + JSON-LD
    template.tsx    transition de page (fondu du contenu + rideau noir qui s'efface)
    page.tsx        /            services/page.tsx   /services
    fleet/page.tsx  /fleet       contact/page.tsx    /contact (lit ?mode= et ?fleet=)
    actions.ts      Server Action du formulaire : validation zod → Formspree
    globals.css     style.css d'origine + en bas : ajouts migration, typographie Manrope, corrections de mise en page
    fonts.ts        Manrope (variable 300–800) via next/font/google, auto-hébergée au build
    sitemap.ts · robots.ts · icon.svg
  components/       une section = un composant (Hero, Makes, Process, ReviewsArc, SpecForm…)
  lib/
    site.ts         TOUT le contenu texte (business, services, prix, avis, FAQ, formules fleet…)
    motion.tsx      MotionProvider (GSAP + Lenis), useGsap, intro, transitions, helpers
    seo.ts          metadata par page (OG/Twitter/canonical) + JSON-LD AutoRepair
    keys.ts         clé sessionStorage du gate
```

### Modifier le contenu
Tout est dans `src/lib/site.ts`. Dans les chaînes, `*mot*` devient `<em>mot</em>` et `\n` devient un `<br>`.

### Animations
- `useGsap(setup, deps, { scope, fonts })` : tout ce qui est créé dans `setup` (tweens, ScrollTrigger, SplitText) est enregistré dans un `gsap.context` et annulé au démontage. `fonts: true` attend le chargement des polices (nécessaire pour SplitText).
- Les sections « épinglées » (hero, makes, process) utilisent `position: sticky` en CSS, comme dans l'original. GSAP ne fait que le scrub.
- **Gate** : joué une fois par session (`sessionStorage`). Aux chargements suivants, un script inline ferme le rideau avant le premier rendu, puis l'intro le lève.
- **Transitions** : `<TLink>` lève le rideau sur l'ancienne page puis navigue. `template.tsx` fait apparaître la nouvelle page en fondu et termine la course du rideau. Les boutons précédent/suivant du navigateur passent directement par `template.tsx`.
- Mobile (< 980 px) : hero non épinglé et curseur désactivé, comme dans le CSS d'origine.

## Déploiement sur Vercel

1. Pousser le dossier `ryonne-next` sur GitHub, GitLab ou Bitbucket.
2. Sur vercel.com : **Add New → Project**, importer le dépôt (framework détecté : Next.js). Si le dépôt contient aussi le site statique, régler **Root Directory** sur `ryonne-next`.
3. **Settings → Environment Variables** : ajouter `FORMSPREE_ENDPOINT` (et `NEXT_PUBLIC_SITE_URL` si le domaine diffère), pour Production et Preview.
4. Déployer, puis brancher le domaine dans **Settings → Domains**.

Vous pouvez aussi passer par la CLI : `npx vercel` puis `npx vercel --prod`.

## À compléter avant la mise en ligne
- `streetAddress` / `postalCode` dans le JSON-LD (`src/lib/seo.ts`) une fois l'adresse du bay publique.
- Liens des réseaux sociaux (`business.socials` dans `site.ts`, actuellement `#`).
- Photos HD dans `public/img` (mêmes noms ; mettre à jour les dimensions dans `IMG` de `site.ts`).
