import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-chat-icon',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <a routerLink="/user-chat" class="chat-icon-btn" [title]="'USER_CHAT.ICON_TITLE' | translate">
      <span class="chat-icon">💬</span>
      @if (unreadCount > 0) {
        <span class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      }
    </a>
  `,
  styles: [`
    .chat-icon-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      position: relative;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
    }

    .chat-icon-btn:hover {
      background: #f0f0f0;
    }

    .chat-icon {
      font-size: 1.25rem;
    }

    .badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #e74c3c;
      color: white;
      border-radius: 50%;
      min-width: 18px;
      height: 18px;
      font-size: 0.7rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
  `]
})
export class ChatIconComponent {
  @Input() unreadCount: number = 0;
}