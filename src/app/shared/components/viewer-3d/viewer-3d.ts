import { Component, input, signal, ElementRef, viewChild, computed } from '@angular/core';
import { Product } from '../../../core/models/product';
import { GarmentComponent } from '../garment/garment';

@Component({
  selector: 'app-viewer-3d',
  imports: [GarmentComponent],
  template: `
    <div
      class="viewer-3d"
      #stage
      (mousemove)="onMouseMove($event)"
      (mouseleave)="onMouseLeave()"
      (click)="toggleSpin()"
    >
      <div
        class="viewer-3d__card"
        [style.transform]="transformStyle()"
        [class.is-spinning]="isSpinning()"
      >
        <div class="viewer-3d__face viewer-3d__front" [style.background]="product().palette.bg">
          @if (product().imageUrl) {
            <img [src]="product().imageUrl" [alt]="product().name" class="viewer-3d__img" />
          } @else {
            <app-garment [product]="product()" [animated]="true" />
          }
          <div class="viewer-3d__badge">Vue 3D Interactive</div>
        </div>

        <div class="viewer-3d__face viewer-3d__back" [style.background]="product().palette.bg">
          <div class="viewer-3d__back-content">
            <span class="eyebrow">Détail 3D</span>
            <h3>{{ product().name }}</h3>
            <p>{{ product().material }}</p>
            <p class="viewer-3d__price">{{ product().price }} €</p>
          </div>
        </div>
      </div>

      <div class="viewer-3d__controls">
        <button type="button" (click)="$event.stopPropagation(); toggleSpin()">
          {{ isSpinning() ? 'Arrêter Rotation 3D' : 'Rotation 3D Auto' }}
        </button>
        <small>Glissez ou survolez pour orienter en 3D</small>
      </div>
    </div>
  `,
  styleUrl: './viewer-3d.scss',
})
export class Viewer3dComponent {
  readonly product = input.required<Product>();

  readonly stage = viewChild<ElementRef<HTMLDivElement>>('stage');

  readonly rotateX = signal(0);
  readonly rotateY = signal(0);
  readonly isSpinning = signal(false);

  readonly transformStyle = computed(() => {
    if (this.isSpinning()) {
      return 'perspective(1000px) rotateX(10deg) rotateY(360deg)';
    }
    return `perspective(1000px) rotateX(${this.rotateX()}deg) rotateY(${this.rotateY()}deg)`;
  });

  onMouseMove(event: MouseEvent): void {
    if (this.isSpinning()) return;
    const el = this.stage()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotX = -((y - centerY) / centerY) * 20;
    const rotY = ((x - centerX) / centerX) * 20;
    this.rotateX.set(rotX);
    this.rotateY.set(rotY);
  }

  onMouseLeave(): void {
    if (this.isSpinning()) return;
    this.rotateX.set(0);
    this.rotateY.set(0);
  }

  toggleSpin(): void {
    this.isSpinning.update((v) => !v);
  }
}
