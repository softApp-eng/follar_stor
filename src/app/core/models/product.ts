export type DetailLayer = 'Matière' | 'Coupe' | 'Finition';

export interface PieceDetail {
  name: string;
  layer: DetailLayer;
}

export interface ProductPalette {
  aura: string;
  fabricA: string;
  fabricB: string;
  accent: string;
  bg: string;
}

export interface ProductDetails {
  material: string[];
  fit: string[];
  finish: string[];
}

export type GarmentType =
  | 'coat'
  | 'shirt'
  | 'jeans'
  | 'knit'
  | 'trench'
  | 'tee'
  | 'trousers'
  | 'bag';

export type Category = 'Femme' | 'Homme' | 'Unisexe' | 'Accessoires';

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface Product {
  slug: string;
  name: string;
  line: string;
  category: Category;
  garment: GarmentType;
  tagline: string;
  description: string;
  story: string;
  price: number;
  material: string;
  fit: string;
  care: string;
  origin: string;
  season: string;
  badge?: string;
  imageUrl?: string;
  palette: ProductPalette;
  details: ProductDetails;
}

/** Détails displayed around the garment, from matière to finition. */
export function orbitDetails(product: Product): PieceDetail[] {
  const details: PieceDetail[] = [
    { name: product.details.material[0], layer: 'Matière' },
    { name: product.details.fit[0], layer: 'Coupe' },
    { name: product.details.finish[0], layer: 'Finition' },
    { name: product.details.material[1] ?? product.details.fit[1], layer: 'Matière' },
    { name: product.details.fit[1] ?? product.details.finish[1], layer: 'Coupe' },
    { name: product.details.finish[1] ?? product.details.material[1], layer: 'Finition' },
  ];
  return details.filter((detail) => Boolean(detail.name));
}
