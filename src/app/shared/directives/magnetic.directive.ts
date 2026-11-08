import { Directive, ElementRef, HostListener, inject, input, numberAttribute } from '@angular/core';

/** Pulls an element gently toward the cursor. */
@Directive({
  selector: '[appMagnetic]',
})
export class MagneticDirective {
  readonly strength = input(0.22, { transform: numberAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('pointermove', ['$event'])
  onMove(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || this.reducedMotion()) {
      return;
    }
    const rect = this.host.nativeElement.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * this.strength();
    const y = (event.clientY - rect.top - rect.height / 2) * this.strength();
    this.host.nativeElement.style.setProperty('--mag-x', `${x.toFixed(1)}px`);
    this.host.nativeElement.style.setProperty('--mag-y', `${y.toFixed(1)}px`);
  }

  @HostListener('pointerleave')
  onLeave(): void {
    this.host.nativeElement.style.setProperty('--mag-x', '0px');
    this.host.nativeElement.style.setProperty('--mag-y', '0px');
  }

  private reducedMotion(): boolean {
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
