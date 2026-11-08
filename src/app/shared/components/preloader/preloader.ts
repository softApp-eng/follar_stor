import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-preloader',
  template: `
    @if (!done()) {
      <div class="preloader" [class.is-leaving]="leaving()" aria-hidden="true">
        <div class="preloader__inner">
          <div class="preloader__brand">
            @for (letter of letters; track $index) {
              <span [style.animation-delay.ms]="140 + $index * 58">{{ letter }}</span>
            }
          </div>
          <p class="preloader__tag">Vestiaire essentiel · Paris</p>
          <div class="preloader__line"><i></i></div>
        </div>
      </div>
    }
  `,
  styles: `
    .preloader {
      position: fixed;
      inset: 0;
      z-index: 10005;
      display: grid;
      place-items: center;
      background: #080706;
      color: var(--cream);
      transition: transform 1s var(--ease);
    }

    .preloader.is-leaving {
      transform: translateY(-100%);
    }

    .preloader__inner {
      text-align: center;
      transition:
        opacity 0.5s ease,
        transform 0.6s var(--ease);
    }

    .preloader.is-leaving .preloader__inner {
      opacity: 0;
      transform: translateY(-22px);
    }

    .preloader__brand {
      display: flex;
      justify-content: center;
      gap: 0.02em;
      overflow: hidden;
      font-family: var(--serif);
      font-size: clamp(42px, 8vw, 84px);
      font-weight: 300;
      letter-spacing: 0.26em;
      line-height: 1.1;
    }

    .preloader__brand span {
      display: inline-block;
      animation: letterRise 0.95s var(--ease) both;
    }

    .preloader__tag {
      margin-top: 22px;
      font-size: 8.5px;
      letter-spacing: 0.44em;
      text-transform: uppercase;
      color: rgba(245, 240, 230, 0.42);
      animation: fadeIn 1s ease 0.7s both;
    }

    .preloader__line {
      width: 168px;
      height: 1px;
      margin: 30px auto 0;
      background: rgba(245, 240, 230, 0.14);
      overflow: hidden;
    }

    .preloader__line i {
      display: block;
      width: 0;
      height: 100%;
      background: var(--gold);
      animation: load 1.45s var(--ease) 0.15s forwards;
    }

    @keyframes letterRise {
      from {
        opacity: 0;
        transform: translateY(110%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes load {
      to {
        width: 100%;
      }
    }
  `,
})
export class PreloaderComponent {
  readonly letters = ['F', 'O', 'L', 'L', 'A', 'R'];
  readonly leaving = signal(false);
  readonly done = signal(false);

  private readonly ui = inject(UiService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const reduced =
        typeof matchMedia !== 'undefined' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches;

      const leaveAt = reduced ? 40 : 1350;
      const doneAt = reduced ? 180 : 2350;

      const leaveTimer = setTimeout(() => {
        this.leaving.set(true);
        this.ui.ready.set(true);
      }, leaveAt);

      const doneTimer = setTimeout(() => this.done.set(true), doneAt);

      this.destroyRef.onDestroy(() => {
        clearTimeout(leaveTimer);
        clearTimeout(doneTimer);
      });
    });
  }
}
