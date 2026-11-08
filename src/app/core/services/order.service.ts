import { Injectable, computed, signal } from '@angular/core';
import { Product, Size } from '../models/product';

export interface OrderItem {
  slug: string;
  name: string;
  size: Size;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: CustomerInfo;
  status: 'Nouveau' | 'Envoyé en livraison' | 'Livré' | 'Annulé';
  deliveryRef?: string;
  sentAt?: string;
}

const ORDERS_KEY = 'follar.orders.v1';

@Injectable({ providedIn: 'root' })
export class OrderService {
  readonly orders = signal<Order[]>(this.restore());

  readonly pendingCount = computed(() =>
    this.orders().filter((o) => o.status === 'Nouveau').length,
  );

  createOrder(
    items: OrderItem[],
    subtotal: number,
    shipping: number,
    total: number,
    customer: CustomerInfo,
  ): Order {
    const order: Order = {
      id: `FOL-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString(),
      items,
      subtotal,
      shipping,
      total,
      customer,
      status: 'Nouveau',
    };

    this.orders.update((list) => {
      const next = [order, ...list];
      this.save(next);
      return next;
    });

    return order;
  }

  updateStatus(id: string, status: Order['status']): void {
    this.orders.update((list) => {
      const next = list.map((o) => (o.id === id ? { ...o, status } : o));
      this.save(next);
      return next;
    });
  }

  sendToDelivery(id: string): void {
    const deliveryRef = `DEL-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const sentAt = new Date().toISOString();
    this.orders.update((list) => {
      const next = list.map((o) =>
        o.id === id ? { ...o, status: 'Envoyé en livraison' as const, deliveryRef, sentAt } : o,
      );
      this.save(next);
      return next;
    });
  }

  deleteOrder(id: string): void {
    this.orders.update((list) => {
      const next = list.filter((o) => o.id !== id);
      this.save(next);
      return next;
    });
  }

  clearOrders(): void {
    this.orders.set([]);
    this.save([]);
  }

  private restore(): Order[] {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    // Seed a sample order for initial demo
    return [
      {
        id: `FOL-489210`,
        date: new Date(Date.now() - 3600000 * 4).toISOString(),
        items: [
          {
            slug: 'manteau-laine',
            name: 'Manteau Laine',
            size: 'M',
            qty: 1,
            unitPrice: 190,
            total: 190,
          },
        ],
        subtotal: 190,
        shipping: 0,
        total: 190,
        customer: {
          fullName: 'Claire Moreau',
          email: 'claire.moreau@exemple.fr',
          address: '14 rue de Rivoli',
          city: 'Paris',
          postalCode: '75004',
          country: 'France',
          notes: 'Sonner à l’interphone Moreau.',
        },
        status: 'Nouveau',
      },
    ];
  }

  private save(list: Order[]): void {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
    } catch {}
  }
}
