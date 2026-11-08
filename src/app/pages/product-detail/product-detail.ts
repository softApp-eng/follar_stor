import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { Product, Size } from '../../core/models/product';
import { CartService } from '../../core/services/cart.service';
import { UiService } from '../../core/services/ui.service';
import { GarmentComponent } from '../../shared/components/garment/garment';
import { PieceOrbitComponent } from '../../shared/components/piece-orbit/piece-orbit';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { RevealDirective } from '../../shared/directives/reveal.directive';

interface PieceLayerView {
  key: string;
  label: string;
  lead: string;
  items: string[];
}

@Component({
  selector: 'app-product-detail',
  imports: [
    RouterLink,
    PieceOrbitComponent,
    ProductCardComponent,
    GarmentComponent,
    RevealDirective,
    MagneticDirective,
  ],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailPage {
  readonly slug = input<string>('');
  readonly catalog = inject(CatalogService);

  readonly product = computed(() => this.catalog.findProduct(this.slug()));

  readonly size = signal<Size>('M');
  readonly qty = signal(1);
  readonly sizes: Size[] = ['XS', 'S', 'M', 'L', 'XL'];

  readonly unitPrice = computed(() => {
    const product = this.product();
    return product ? this.catalog.priceFor(product) : 0;
  });

  readonly total = computed(() => this.unitPrice() * this.qty());

  readonly layers = computed<PieceLayerView[]>(() => {
    const product = this.product();
    if (!product) {
      return [];
    }
    return [
      { key: '01', label: 'Matières', lead: product.material, items: product.details.material },
      { key: '02', label: 'Coupe', lead: product.fit, items: product.details.fit },
      { key: '03', label: 'Finitions', lead: product.care, items: product.details.finish },
    ];
  });

  readonly related = computed<Product[]>(() => {
    const product = this.product();
    if (!product) {
      return [];
    }
    const products = this.catalog.products();
    const others = products.filter((item) => item.slug !== product.slug);
    const sameCategory = others.filter((item) => item.category === product.category);
    const rest = others.filter((item) => item.category !== product.category);
    return [...sameCategory, ...rest].slice(0, 3);
  });

  private readonly cart = inject(CartService);
  private readonly ui = inject(UiService);

  constructor() {
    effect(() => {
      const product = this.product();
      if (product && typeof document !== 'undefined') {
        document.title = `${product.name} — ${product.line} | FOLLAR`;
      }
    });
  }

  changeQty(delta: number): void {
    this.qty.update((qty) => Math.max(1, Math.min(9, qty + delta)));
  }

  add(): void {
    const product = this.product();
    if (!product) {
      return;
    }
    this.cart.add(product, this.size(), this.qty());
    this.ui.showToast(`${product.name} · taille ${this.size()} ajoutée au panier`);
    this.ui.openCart();
  }
}
