import { Product } from '../models/product';

export const PRODUCTS: Product[] = [
  {
    slug: 'manteau-laine',
    name: 'Manteau Laine',
    line: 'Outerwear',
    category: 'Femme',
    garment: 'coat',
    tagline: "La pièce qui traverse l'hiver.",
    description:
      "Un manteau droit en laine mérinos, doublé de cupro. Les épaules tombent juste, la longueur s'arrête sous le genou. Rien de plus, rien de moins.",
    story:
      "Dessiné avec un tailleur de Porto, le Manteau Laine reprend la coupe d'une pièce de costume masculine, allégée pour le quotidien. La laine est tissée dans une filature familiale qui travaille avec la maison depuis vingt ans.",
    price: 190,
    material: '100 % laine mérinos',
    fit: 'Coupe droite',
    care: 'Nettoyage à sec',
    origin: 'Tissé au Portugal',
    season: 'Automne · Hiver',
    badge: 'Icône',
    palette: {
      aura: '#c9a06a',
      fabricA: '#b07d4e',
      fabricB: '#7a5330',
      accent: '#3d2c1c',
      bg: 'linear-gradient(180deg, #f4f1ea 0%, #e7dfd2 100%)',
    },
    details: {
      material: ['Laine mérinos', 'Duvet de cachemire'],
      fit: ['Coupe droite', 'Épaules tombantes'],
      finish: ['Boutons corne', 'Doublure cupro'],
    },
  },
  {
    slug: 'chemise-lin',
    name: 'Chemise Lin',
    line: 'Chemises',
    category: 'Homme',
    garment: 'shirt',
    tagline: 'Le lin, sans repassage.',
    description:
      "Une chemise ample en lin lavé, col français, boutons nacre. Elle se porte fermée, ouverte sur un tee, été comme hiver.",
    story:
      "Le lin vient d'une filature normande. Lavé une première fois en atelier, il perd sa raideur et gagne cette main souple qu'on ne retrouve pas ailleurs.",
    price: 79,
    material: '100 % lin lavé',
    fit: 'Coupe relaxed',
    care: 'Lavage 30°',
    origin: 'Tissé en France',
    season: 'Printemps · Été',
    palette: {
      aura: '#a9bfd4',
      fabricA: '#cad9e5',
      fabricB: '#8fa6b8',
      accent: '#425766',
      bg: 'linear-gradient(180deg, #f2f3f5 0%, #e3e7ea 100%)',
    },
    details: {
      material: ['Lin lavé', 'Coton bio'],
      fit: ['Coupe relaxed', 'Col français'],
      finish: ['Boutons nacre', 'Ourlet arrondi'],
    },
  },
  {
    slug: 'jean-droit',
    name: 'Jean Droit',
    line: 'Denim',
    category: 'Homme',
    garment: 'jeans',
    tagline: 'Le denim qui se patine.',
    description:
      "Un jean taille haute, coupe droite, en denim selvedge 13 oz. La couleur s'adoucit à chaque port, sans jamais se déformer.",
    story:
      "Le denim est tissé sur un métier à navette au Japon, puis monté au Portugal. Les surpiqûres ton sur ton et le bouton laiton sont volontairement discrets.",
    price: 89,
    material: '100 % coton',
    fit: 'Coupe droite',
    care: 'Lavage froid, sur l’envers',
    origin: 'Denim japonais',
    season: 'Toute l’année',
    badge: 'Nouveauté',
    palette: {
      aura: '#5b7ea8',
      fabricA: '#3f6088',
      fabricB: '#243c5a',
      accent: '#d8b26a',
      bg: 'linear-gradient(180deg, #eef0f3 0%, #dfe3e9 100%)',
    },
    details: {
      material: ['Denim selvedge 13 oz', 'Coton'],
      fit: ['Taille haute', 'Coupe droite'],
      finish: ['Surpiqûres ton sur ton', 'Bouton laiton'],
    },
  },
  {
    slug: 'pull-merinos',
    name: 'Pull Mérinos',
    line: 'Maille',
    category: 'Unisexe',
    garment: 'knit',
    tagline: 'La maille qui ne gratte pas.',
    description:
      "Un pull boxy en laine extrafine, col rond, côtes 2x2. Assez fin pour se glisser sous un manteau, assez chaud pour se porter seul.",
    story:
      "La laine extrafine est filée en Italie à partir de fibres de 19,5 microns. Tricotée en jauge 12, elle garde sa forme lavage après lavage.",
    price: 99,
    material: '100 % laine extrafine',
    fit: 'Coupe boxy',
    care: 'Lavage main',
    origin: 'Filé en Italie',
    season: 'Automne · Hiver',
    palette: {
      aura: '#d8c6a8',
      fabricA: '#dccdb4',
      fabricB: '#b3a284',
      accent: '#6b5a42',
      bg: 'linear-gradient(180deg, #f4f1ea 0%, #e8e2d7 100%)',
    },
    details: {
      material: ['Laine extrafine', 'Cachemire'],
      fit: ['Coupe boxy', 'Col rond'],
      finish: ['Côtes 2x2', 'Maille 12 jauge'],
    },
  },
  {
    slug: 'trench-coton',
    name: 'Trench Coton',
    line: 'Outerwear',
    category: 'Femme',
    garment: 'trench',
    tagline: 'La gabardine, version oversize.',
    description:
      "Un trench ample en gabardine de coton, ceinture amovible, doublure rayée. Les manches se retroussent, le col se relève.",
    story:
      "La gabardine est tissée serrée pour arrêter le vent sans rigidité. Chaque trench est coupé à Porto, puis lavé pour donner au coton un tombé immédiat.",
    price: 149,
    material: '100 % coton',
    fit: 'Coupe oversize',
    care: 'Nettoyage à sec',
    origin: 'Tissé au Portugal',
    season: 'Printemps · Automne',
    badge: 'Édition limitée',
    palette: {
      aura: '#cbb894',
      fabricA: '#c6af86',
      fabricB: '#94805e',
      accent: '#4b3d2b',
      bg: 'linear-gradient(180deg, #f4f1e9 0%, #e6e0d3 100%)',
    },
    details: {
      material: ['Gabardine coton', 'Coton bio'],
      fit: ['Coupe oversize', 'Ceinture amovible'],
      finish: ['Boutons corne', 'Doublure rayée'],
    },
  },
  {
    slug: 'tee-coton-lourd',
    name: 'Tee Coton Lourd',
    line: 'Essentiels',
    category: 'Unisexe',
    garment: 'tee',
    tagline: 'Le tee qui tient debout.',
    description:
      "Un t-shirt boxy en jersey de coton lourd 240 g. Col rond renforcé, épaules stables, ourlet double aiguille. Il ne se déforme pas.",
    story:
      "Le jersey est tricoté au Portugal dans un coton biologique peigné. Le grammage élevé donne au tee une tenue de chemise, sans lourdeur.",
    price: 29,
    material: '100 % coton bio',
    fit: 'Coupe boxy',
    care: 'Lavage 30°',
    origin: 'Tricoté au Portugal',
    season: 'Toute l’année',
    palette: {
      aura: '#d8d2c6',
      fabricA: '#f6f4ef',
      fabricB: '#d8d2c4',
      accent: '#8d8576',
      bg: 'linear-gradient(180deg, #f2f1ec 0%, #e4e1d9 100%)',
    },
    details: {
      material: ['Coton lourd 240 g', 'Coton bio'],
      fit: ['Coupe boxy', 'Col rond renforcé'],
      finish: ['Ourlet double aiguille', 'Épaules stables'],
    },
  },
  {
    slug: 'pantalon-plisse',
    name: 'Pantalon Plissé',
    line: 'Pantalons',
    category: 'Femme',
    garment: 'trousers',
    tagline: 'Le pli qui structure.',
    description:
      "Un pantalon large taille haute, pli marqué devant, tombé fluide. La taille est ajustable à l'intérieur, la jambe s'arrête au sol.",
    story:
      "La laine froide est choisie pour sa fluidité et sa résistance au pli. Chaque jambe est repassée à la main avant l'expédition.",
    price: 89,
    material: 'Laine froide mélangée',
    fit: 'Coupe large',
    care: 'Nettoyage à sec',
    origin: 'Confectionné au Portugal',
    season: 'Automne · Hiver',
    palette: {
      aura: '#8a8f98',
      fabricA: '#4e545e',
      fabricB: '#30343b',
      accent: '#b9bdc4',
      bg: 'linear-gradient(180deg, #eff0f2 0%, #dfe1e5 100%)',
    },
    details: {
      material: ['Laine froide', 'Coton'],
      fit: ['Taille haute', 'Coupe large'],
      finish: ['Pli marqué', 'Fermeture cachée'],
    },
  },
  {
    slug: 'sac-cabas',
    name: 'Sac Cabas',
    line: 'Accessoires',
    category: 'Accessoires',
    garment: 'bag',
    tagline: 'Le cuir qui vieillit bien.',
    description:
      "Un cabas en cuir pleine fleur, format 38 x 42 cm, deux anses, poche intérieure. Il se porte à l'épaule ou à la main.",
    story:
      "Le cuir est tanné végétal en Toscane. Non doublé de plastique, il prend une patine unique au fil des années.",
    price: 120,
    material: '100 % cuir pleine fleur',
    fit: '38 × 42 cm',
    care: 'Nettoyage à sec',
    origin: 'Cuir toscan',
    season: 'Toute l’année',
    badge: 'Nouveauté',
    palette: {
      aura: '#c49a63',
      fabricA: '#ab7b47',
      fabricB: '#6f4a28',
      accent: '#3a2716',
      bg: 'linear-gradient(180deg, #f3efe7 0%, #e6dfd1 100%)',
    },
    details: {
      material: ['Cuir pleine fleur', 'Toile de coton'],
      fit: ['38 × 42 cm', 'Deux anses'],
      finish: ['Piqûre sellier', 'Doublure coton'],
    },
  },
];

export const CATEGORIES = ['Tous', 'Femme', 'Homme', 'Unisexe', 'Accessoires'] as const;

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

/** Retail price is identical for every size. */
export function priceFor(product: Product): number {
  return product.price;
}
