import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService } from '../../../core/services/cart.service';
import { UiService } from '../../../core/services/ui.service';
import { SettingsService } from '../../../core/services/settings.service';

interface NavLink {
  label: string;
  fragment: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  readonly cart = inject(CartService);
  readonly ui = inject(UiService);
  readonly settings = inject(SettingsService);

  readonly siteName = computed(() => this.settings.settings().siteName || 'FOLLAR');
  readonly siteInitial = computed(() => this.siteName().trim().charAt(0).toUpperCase() || 'F');

  readonly links: NavLink[] = [
    { label: 'Collection', fragment: 'collection' },
    { label: 'Matières', fragment: 'matieres' },
    { label: 'La maison', fragment: 'maison' },
    { label: 'Vestiaire', fragment: 'vestiaire' },
  ];

  readonly scrolled = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.ui.closeMenu());
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }
}
