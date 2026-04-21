import { Component, inject } from '@angular/core';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  template: `
    @for (msg of snackbarService.messages(); track msg.id) {
      <div class="snackbar" [class]="'snackbar-' + msg.type">
        <span class="snackbar-message">{{ msg.message }}</span>
        <button class="snackbar-close" (click)="snackbarService.dismiss(msg.id)">×</button>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .snackbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.4;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .snackbar-error {
      background-color: #dc2626;
      color: white;
    }

    .snackbar-success {
      background-color: #16a34a;
      color: white;
    }

    .snackbar-info {
      background-color: #2563eb;
      color: white;
    }

    .snackbar-message {
      flex: 1;
      margin-right: 12px;
    }

    .snackbar-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .snackbar-close:hover {
      opacity: 1;
    }

    @media (max-width: 480px) {
      :host {
        left: 20px;
        right: 20px;
        max-width: none;
      }
    }
  `]
})
export class SnackbarComponent {
  snackbarService = inject(SnackbarService);
}
