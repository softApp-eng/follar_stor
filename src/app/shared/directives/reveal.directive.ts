import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

type RevealVariant = 'up' | 'fade' | 'scale' | 'left' | 'right';

/**
 * Fades / slides an element into view once it enters the viewport.
 * Stagger items with [revealDelay]="index * 80".
 */
@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  readonly appReveal = input<string>('up');
  readonly revealDelay = input(0, { transform: numberAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const element = this.host.nativeElement;
    const variant: RevealVariant = (this.appReveal() || 'up') as RevealVariant;
    element.setAttribute('data-reveal', variant);
    element.style.setProperty('--reveal-delay', `${this.revealDelay()}ms`);

    const reducedMotion =
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof IntersectionObserver === 'undefined' || reducedMotion) {
      element.classList.add('is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
