import { Directive, ElementRef, HostListener, inject, input, numberAttribute } from '@angular/core';

/** Subtle 3D tilt following the cursor. Sets --tilt-x / --tilt-y on the host. */
@Directive({
  selector: '[appTilt]',
})
export class TiltDirective {
  readonly max = input(7, { transform: numberAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('pointermove', ['$event'])
  onMove(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || this.reducedMotion()) {
      return;
    }
    const rect = this.host.nativeElement.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    const max = this.max();
    this.host.nativeElement.style.setProperty('--tilt-x', `${(-py * max).toFixed(2)}deg`);
    this.host.nativeElement.style.setProperty('--tilt-y', `${(px * max).toFixed(2)}deg`);
  }

  @HostListener('pointerleave')
  onLeave(): void {
    this.host.nativeElement.style.setProperty('--tilt-x', '0deg');
    this.host.nativeElement.style.setProperty('--tilt-y', '0deg');
  }

  private reducedMotion(): boolean {
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
