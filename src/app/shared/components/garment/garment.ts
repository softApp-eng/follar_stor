import { Component, computed, input } from '@angular/core';
import { Product } from '../../../core/models/product';

let uidCounter = 0;

@Component({
  selector: 'app-garment',
  templateUrl: './garment.html',
  styleUrl: './garment.scss',
})
export class GarmentComponent {
  readonly product = input.required<Product>();
  readonly animated = input(false);

  private readonly uid = `garment${++uidCounter}`;

  readonly glowId = `${this.uid}-glow`;
  readonly shadowId = `${this.uid}-shadow`;
  readonly fabricId = `${this.uid}-fabric`;
  readonly shineId = `${this.uid}-shine`;

  readonly palette = computed(() => this.product().palette);
}
