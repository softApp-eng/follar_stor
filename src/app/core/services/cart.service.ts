import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { CatalogService } from './catalog.service';
import { Product, Size } from '../models/product';

export interface CartLine {
  slug: string;
  size: Size;
  qty: number;
}

export interface CartItem extends CartLine {
  product: Product;
  unitPrice: number;
  total: number;
}

const STORAGE_KEY = 'follar.cart.v2';
const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL'];

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly catalog = inject(CatalogService);

  readonly lines = signal<CartLine[]>(this.restore());

  readonly items = computed<CartItem[]>(() =>
    this.lines().flatMap((line) => {
      const product = this.catalog.findProduct(line.slug);
      if (!product) {
        return [];
      }
      const unitPrice = this.catalog.priceFor(product);
      return [{ ...line, product, unitPrice, total: unitPrice * line.qty }];
    }),
  );

  readonly count = computed(() => this.lines().reduce((total, line) => total + line.qty, 0));

  readonly subtotal = computed(() =>
    this.items().reduce((total, item) => total + item.total, 0),
  );

  readonly shipping = computed(() => (this.subtotal() >= 90 || this.subtotal() === 0 ? 0 : 6));

  readonly total = computed(() => this.subtotal() + this.shipping());

  constructor() {
    effect(() => {
      const lines = this.lines();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
      } catch {}
    });
  }

  add(product: Product, size: Size = 'M', qty = 1): void {
    this.lines.update((lines) => {
      const index = lines.findIndex((line) => line.slug === product.slug && line.size === size);
      if (index === -1) {
        return [...lines, { slug: product.slug, size, qty }];
      }
      const next = [...lines];
      next[index] = { ...next[index], qty: Math.min(9, next[index].qty + qty) };
      return next;
    });
  }

  setQty(line: CartLine, qty: number): void {
    if (qty <= 0) {
      this.remove(line);
      return;
    }
    this.lines.update((lines) =>
      lines.map((item) =>
        item.slug === line.slug && item.size === line.size
          ? { ...item, qty: Math.min(9, qty) }
          : item,
      ),
    );
  }

  remove(line: CartLine): void {
    this.lines.update((lines) =>
      lines.filter((item) => !(item.slug === line.slug && item.size === line.size)),
    );
  }

  clear(): void {
    this.lines.set([]);
  }

  private restore(): CartLine[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as CartLine[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter(
          (line) =>
            line &&
            typeof line.slug === 'string' &&
            SIZES.includes(line.size) &&
            Number.isFinite(line.qty),
        )
        .map((line) => ({ slug: line.slug, size: line.size, qty: Math.max(1, Math.min(9, line.qty)) }));
    } catch {
      return [];
    }
  }
}
