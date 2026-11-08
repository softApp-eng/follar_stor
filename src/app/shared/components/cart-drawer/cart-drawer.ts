import { Component, HostListener, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartLine, CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { UiService } from '../../../core/services/ui.service';
import { GarmentComponent } from '../garment/garment';

@Component({
  selector: 'app-cart-drawer',
  imports: [RouterLink, GarmentComponent],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
  readonly orderService = inject(OrderService);
  readonly ui = inject(UiService);

  readonly freeShippingThreshold = 90;
  readonly shippingLeft = computed(() =>
    Math.max(0, this.freeShippingThreshold - this.cart.subtotal()),
  );
  readonly shippingProgress = computed(() =>
    Math.min(100, (this.cart.subtotal() / this.freeShippingThreshold) * 100),
  );

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.ui.closeCart();
  }

  checkout(): void {
    if (this.cart.count() === 0) {
      return;
    }

    const items = this.cart.items().map((item) => ({
      slug: item.product.slug,
      name: item.product.name,
      size: item.size,
      qty: item.qty,
      unitPrice: item.unitPrice,
      total: item.total,
    }));

    const order = this.orderService.createOrder(
      items,
      this.cart.subtotal(),
      this.cart.shipping(),
      this.cart.total(),
      {
        fullName: 'Client FOLLAR',
        email: 'client@follar.paris',
        address: '10 rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        notes: 'Commande passée directement sur le site.',
      },
    );

    this.cart.clear();
    this.ui.closeCart();
    this.ui.showToast(`Commande ${order.id} confirmée et transmise !`);
  }

  remove(line: CartLine): void {
    this.cart.remove(line);
  }
}
