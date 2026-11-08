import {
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Product, orbitDetails } from '../../../core/models/product';
import { GarmentComponent } from '../garment/garment';

export type OrbitVariant = 'hero' | 'detail' | 'compact';

/**
 * The signature scene: a floating garment surrounded by its matières, coupe and finitions.
 * Details orbit the piece, auto-cycle, and can be explored.
 */
@Component({
  selector: 'app-piece-orbit',
  imports: [GarmentComponent],
  templateUrl: './piece-orbit.html',
  styleUrl: './piece-orbit.scss',
})
export class PieceOrbitComponent {
  readonly product = input.required<Product>();
  readonly variant = input<OrbitVariant>('hero');
  readonly interactive = input(true);
  readonly autoCycle = input(true);

  readonly details = computed(() => orbitDetails(this.product()));
  readonly active = signal(0);
  readonly activeDetail = computed(() => this.details()[this.active()] ?? this.details()[0]);

  private readonly destroyRef = inject(DestroyRef);
  private userLocked = false;

  constructor() {
    afterNextRender(() => {
      const reduced =
        typeof matchMedia !== 'undefined' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!this.autoCycle() || reduced) {
        return;
      }
      const timer = setInterval(() => {
        if (!this.userLocked) {
          this.active.update((index) => (index + 1) % this.details().length);
        }
      }, 3600);
      this.destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

  angle(index: number): string {
    const step = 360 / this.details().length;
    return `${-90 + index * step}deg`;
  }

  select(index: number): void {
    if (!this.interactive()) {
      return;
    }
    this.userLocked = true;
    this.active.set(index);
  }

  hover(index: number): void {
    this.select(index);
  }
}
