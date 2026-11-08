import { Component, inject } from '@angular/core';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-toast',
  template: `
    @if (ui.toast(); as message) {
      <div class="toast" role="status" aria-live="polite">
        <span class="toast__dot" aria-hidden="true"></span>
        <span class="toast__text">{{ message }}</span>
        <button type="button" class="toast__close" (click)="ui.dismissToast()" aria-label="Fermer">
          ×
        </button>
      </div>
    }
  `,
  styles: `
    .toast {
      position: fixed;
      left: 50%;
      bottom: 28px;
      z-index: 1200;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: min(92vw, 520px);
      padding: 14px 16px 14px 20px;
      border: 1px solid rgba(201, 163, 92, 0.45);
      background: var(--ink);
      color: var(--cream);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      transform: translateX(-50%);
      animation: toastIn 0.5s var(--ease) both;
    }

    .toast__dot {
      width: 6px;
      height: 6px;
      flex: 0 0 auto;
      border-radius: 50%;
      background: var(--gold);
      box-shadow: 0 0 0 4px rgba(201, 163, 92, 0.16);
      animation: toastPulse 1.8s ease-in-out infinite;
    }

    .toast__text {
      flex: 1;
    }

    .toast__close {
      flex: 0 0 auto;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 16px;
      line-height: 1;
      color: rgba(245, 240, 230, 0.5);
      transition: color 0.3s ease;
    }

    .toast__close:hover {
      color: var(--cream);
    }

    @keyframes toastIn {
      from {
        opacity: 0;
        transform: translate(-50%, 18px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }

    @keyframes toastPulse {
      0%,
      100% {
        box-shadow: 0 0 0 3px rgba(201, 163, 92, 0.14);
      }
      50% {
        box-shadow: 0 0 0 7px rgba(201, 163, 92, 0.04);
      }
    }
  `,
})
export class ToastComponent {
  readonly ui = inject(UiService);
}
