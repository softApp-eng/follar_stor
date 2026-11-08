import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UiService {
  readonly cartOpen = signal(false);
  readonly menuOpen = signal(false);
  readonly ready = signal(false);
  readonly toast = signal<string | null>(null);

  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  openCart(): void {
    this.menuOpen.set(false);
    this.cartOpen.set(true);
  }

  closeCart(): void {
    this.cartOpen.set(false);
  }

  toggleCart(): void {
    this.cartOpen() ? this.closeCart() : this.openCart();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  showToast(message: string): void {
    this.toast.set(message);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 3400);
  }

  dismissToast(): void {
    clearTimeout(this.toastTimer);
    this.toast.set(null);
  }
}
