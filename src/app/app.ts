import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UiService } from './core/services/ui.service';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer';
import { CursorComponent } from './shared/components/cursor/cursor';
import { FooterComponent } from './shared/components/footer/footer';
import { HeaderComponent } from './shared/components/header/header';
import { PreloaderComponent } from './shared/components/preloader/preloader';
import { ToastComponent } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CartDrawerComponent,
    ToastComponent,
    CursorComponent,
    PreloaderComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[class.app-ready]': 'ui.ready()',
  },
})
export class App {
  readonly ui = inject(UiService);
  readonly progress = signal(0);

  constructor() {
    // Keep anchor targets clear of the fixed header.
    inject(ViewportScroller).setOffset([0, 76]);

    effect(() => {
      if (typeof document === 'undefined') {
        return;
      }
      document.body.classList.toggle('is-locked', this.ui.cartOpen() || this.ui.menuOpen());
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    this.progress.set(Math.min(1, Math.max(0, ratio)));
  }
}
