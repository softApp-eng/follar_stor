import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';

/**
 * A soft gold dot + trailing ring that follows the cursor on fine pointers.
 * Keeps the native cursor for accessibility when motion is reduced.
 */
@Component({
  selector: 'app-cursor',
  template: `
    <div class="cursor" #shell aria-hidden="true">
      <span class="cursor__ring" #ring></span>
      <span class="cursor__dot" #dot></span>
    </div>
  `,
  styles: `
    .cursor {
      position: fixed;
      inset: 0;
      z-index: 10000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.35s ease;
    }

    .cursor.is-visible {
      opacity: 1;
    }

    .cursor__dot,
    .cursor__ring {
      position: fixed;
      top: 0;
      left: 0;
      border-radius: 50%;
      will-change: transform;
    }

    .cursor__dot {
      width: 4px;
      height: 4px;
      margin: -2px 0 0 -2px;
      background: var(--gold);
      box-shadow: 0 0 10px rgba(201, 163, 92, 0.9);
    }

    .cursor__ring {
      width: 32px;
      height: 32px;
      margin: -16px 0 0 -16px;
      border: 1px solid rgba(201, 163, 92, 0.65);
      transition:
        width 0.3s var(--ease),
        height 0.3s var(--ease),
        margin 0.3s var(--ease),
        background 0.3s var(--ease),
        border-color 0.3s var(--ease);
    }

    .cursor__ring.is-hover {
      width: 62px;
      height: 62px;
      margin: -31px 0 0 -31px;
      background: rgba(201, 163, 92, 0.08);
      border-color: rgba(201, 163, 92, 0.9);
    }
  `,
})
export class CursorComponent implements OnDestroy {
  @ViewChild('shell') private shell?: ElementRef<HTMLElement>;
  @ViewChild('ring') private ring?: ElementRef<HTMLElement>;
  @ViewChild('dot') private dot?: ElementRef<HTMLElement>;

  private readonly zone = inject(NgZone);
  private raf = 0;
  private enabled = false;
  private x = 0;
  private y = 0;
  private ringX = 0;
  private ringY = 0;

  private readonly onMove = (event: PointerEvent): void => {
    this.x = event.clientX;
    this.y = event.clientY;
    if (this.dot && this.shell) {
      this.dot.nativeElement.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
      this.shell.nativeElement.classList.add('is-visible');
    }
  };

  private readonly onOver = (event: PointerEvent): void => {
    const target = event.target as Element | null;
    const interactive = Boolean(
      target?.closest?.('a, button, input, textarea, select, summary, [data-cursor]'),
    );
    this.ring?.nativeElement.classList.toggle('is-hover', interactive);
  };

  private readonly onLeave = (): void => {
    this.shell?.nativeElement.classList.remove('is-visible');
  };

  constructor() {
    afterNextRender(() => {
      if (typeof matchMedia === 'undefined') {
        return;
      }
      if (!matchMedia('(pointer: fine)').matches) {
        return;
      }
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      this.enabled = true;
      this.x = window.innerWidth / 2;
      this.y = window.innerHeight / 2;
      this.ringX = this.x;
      this.ringY = this.y;

      document.documentElement.classList.add('cursor-ready');
      this.zone.runOutsideAngular(() => {
        document.addEventListener('pointermove', this.onMove, { passive: true });
        document.addEventListener('pointerover', this.onOver, { passive: true });
        document.documentElement.addEventListener('mouseleave', this.onLeave);
        this.loop();
      });
    });
  }

  private loop = (): void => {
    this.ringX += (this.x - this.ringX) * 0.15;
    this.ringY += (this.y - this.ringY) * 0.15;
    if (this.ring) {
      this.ring.nativeElement.style.transform = `translate3d(${this.ringX.toFixed(2)}px, ${this.ringY.toFixed(2)}px, 0)`;
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  ngOnDestroy(): void {
    if (!this.enabled) {
      return;
    }
    cancelAnimationFrame(this.raf);
    document.removeEventListener('pointermove', this.onMove);
    document.removeEventListener('pointerover', this.onOver);
    document.documentElement.removeEventListener('mouseleave', this.onLeave);
    document.documentElement.classList.remove('cursor-ready');
  }
}
