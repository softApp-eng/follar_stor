import { Injectable, computed, signal } from '@angular/core';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { Product, Category, GarmentType, Size } from '../models/product';

const PRODUCTS_KEY = 'follar.products.v3';
const LEGACY_PRODUCTS_KEY = 'follar.products.v2';
const CATEGORIES_KEY = 'follar.categories.v3';
const LEGACY_CATEGORIES_KEY = 'follar.categories.v2';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly products = signal<Product[]>(this.restoreProducts());
  readonly categories = signal<string[]>(this.restoreCategories());

  readonly activeCategory = signal<string>('Tous');

  readonly filteredProducts = computed(() => {
    const cat = this.activeCategory();
    const list = this.products();
    if (cat === 'Tous') return list;
    return list.filter((p) => p.category === cat);
  });

  addProduct(product: Product): void {
    this.products.update((list) => {
      // Ensure slug uniqueness
      let slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (list.some((p) => p.slug === slug)) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
      const newProduct = { ...product, slug };
      const next = [newProduct, ...list];
      this.saveProducts(next);
      return next;
    });
  }

  updateProduct(slug: string, patch: Partial<Product>): void {
    this.products.update((list) => {
      const next = list.map((p) => (p.slug === slug ? { ...p, ...patch } : p));
      this.saveProducts(next);
      return next;
    });
  }

  deleteProduct(slug: string): void {
    this.products.update((list) => {
      const next = list.filter((p) => p.slug !== slug);
      this.saveProducts(next);
      return next;
    });
  }

  /** Restore the original FOLLAR catalogue (removes all local changes). */
  resetProducts(): void {
    const next = PRODUCTS.map((p) => ({ ...p }));
    this.products.set(next);
    this.saveProducts(next);
  }

  /** Replace one product's image without opening the full edition modal. */
  updateProductImage(slug: string, imageUrl: string): void {
    this.updateProduct(slug, { imageUrl: imageUrl.trim() || undefined });
  }

  addCategory(category: string): void {
    const trimmed = category.trim();
    if (!trimmed || this.categories().includes(trimmed)) return;
    this.categories.update((cats) => {
      const next = [...cats, trimmed];
      this.saveCategories(next);
      return next;
    });
  }

  deleteCategory(category: string): void {
    if (category === 'Tous') return;
    this.categories.update((cats) => {
      const next = cats.filter((c) => c !== category);
      this.saveCategories(next);
      return next;
    });
  }

  findProduct(slug: string): Product | undefined {
    return this.products().find((p) => p.slug === slug);
  }

  priceFor(product: Product): number {
    return product.price;
  }

  countFor(category: string): number {
    const list = this.products();
    if (category === 'Tous') return list.length;
    return list.filter((p) => p.category === category).length;
  }

  private restoreProducts(): Product[] {
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY) || localStorage.getItem(LEGACY_PRODUCTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((p: Product) => this.withDefaultMedia(p));
          this.saveProducts(migrated);
          return migrated;
        }
      }
    } catch {}
    return PRODUCTS;
  }

  /**
   * Older saved products (v2) had no local image. Re-attach the bundled
   * catalogue photo when the slug matches, without overriding a custom image.
   */
  private withDefaultMedia(product: Product): Product {
    const base = PRODUCTS.find((item) => item.slug === product.slug);
    if (!base) return product;
    return {
      ...base,
      ...product,
      imageUrl: product.imageUrl || base.imageUrl,
      palette: { ...base.palette, ...(product.palette ?? {}) },
      details: { ...base.details, ...(product.details ?? {}) },
    };
  }

  private saveProducts(list: Product[]): void {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
    } catch {}
  }

  private restoreCategories(): string[] {
    try {
      const raw = localStorage.getItem(CATEGORIES_KEY) || localStorage.getItem(LEGACY_CATEGORIES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return [...CATEGORIES];
  }

  private saveCategories(list: string[]): void {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(list));
    } catch {}
  }
}
