import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { orbitDetails } from '../../../core/models/product';
import { Product } from '../../../core/models/product';
import { CartService } from '../../../core/services/cart.service';
import { UiService } from '../../../core/services/ui.service';
import { GarmentComponent } from '../garment/garment';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, GarmentComponent],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly index = input(0);

  private readonly cart = inject(CartService);
  private readonly ui = inject(UiService);

  readonly details = computed(() => orbitDetails(this.product()).slice(0, 3));

  add(): void {
    const product = this.product();
    this.cart.add(product, 'M');
    this.ui.showToast(`${product.name} — taille M ajoutée au panier`);
  }
}
