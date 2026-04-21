import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserNotificationDto } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="notification-wrapper">
      <button class="bell-btn" (click)="toggleDropdown($event)">
        <span class="bell-icon">🔔</span>
        @if (unreadCount > 0) {
          <span class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        }
      </button>
      
      @if (isOpen) {
        <div class="notification-dropdown" (click)="$event.stopPropagation()">
          <div class="dropdown-header">
            <span class="dropdown-title">{{ 'NOTIFICATIONS.TITLE' | translate }}</span>
            <span class="unread-count">{{ unreadCount }} {{ 'NOTIFICATIONS.UNREAD' | translate }}</span>
          </div>
          
          <div class="notification-list">
            @if (notifications.length === 0) {
              <div class="no-notifications">{{ 'NOTIFICATIONS.EMPTY' | translate }}</div>
            } @else {
              @for (notification of notifications; track notification.id) {
                <div class="notification-item" [class.unread]="!notification.isRead">
                  <div class="notification-content">
                    <div class="notification-text">{{ notification.text }}</div>
                    <div class="notification-date">{{ formatDate(notification.created) }}</div>
                  </div>
                  <div class="notification-actions">
                    @if (notification.isRead) {
                      <button class="action-btn mark-unread" (click)="markAsUnread(notification)" [title]="'NOTIFICATIONS.MARK_UNREAD' | translate">
                        ○
                      </button>
                    } @else {
                      <button class="action-btn mark-read" (click)="markAsRead(notification)" [title]="'NOTIFICATIONS.MARK_READ' | translate">
                        ●
                      </button>
                    }
                    <button class="action-btn delete" (click)="deleteNotification(notification)" [title]="'NOTIFICATIONS.DELETE' | translate">
                      ×
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-wrapper {
      position: relative;
    }

    .bell-btn {
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
    }

    .bell-btn:hover {
      background: #f0f0f0;
    }

    .bell-icon {
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

    .notification-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      width: 360px;
      max-height: 480px;
      display: flex;
      flex-direction: column;
      z-index: 1001;
      overflow: hidden;
    }

    .dropdown-header {
      padding: 16px;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dropdown-title {
      font-weight: 600;
      color: #333;
      font-size: 1rem;
    }

    .unread-count {
      color: #888;
      font-size: 0.85rem;
    }

    .notification-list {
      flex: 1;
      overflow-y: auto;
      max-height: 400px;
    }

    .no-notifications {
      padding: 32px 16px;
      text-align: center;
      color: #888;
    }

    .notification-item {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background: #f8f9fa;
    }

    .notification-item.unread {
      background: #f0f7ff;
    }

    .notification-item.unread:hover {
      background: #e8f0ff;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-text {
      color: #333;
      font-size: 0.9rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .notification-item.unread .notification-text {
      font-weight: 500;
    }

    .notification-date {
      color: #888;
      font-size: 0.8rem;
      margin-top: 4px;
    }

    .notification-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .action-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 1rem;
      opacity: 0.5;
      transition: all 0.2s;
    }

    .action-btn:hover {
      opacity: 1;
      background: #f0f0f0;
    }

    .action-btn.mark-read {
      color: #667eea;
    }

    .action-btn.mark-unread {
      color: #888;
    }

    .action-btn.delete {
      color: #e74c3c;
    }

    @media (max-width: 480px) {
      .notification-dropdown {
        position: fixed;
        top: 60px;
        left: 16px;
        right: 16px;
        width: auto;
      }
    }
  `]
})
export class NotificationBellComponent {
  private notificationService = inject(NotificationService);
  private snackbarService = inject(SnackbarService);
  private translateService = inject(TranslateService);

  @Input() notifications: UserNotificationDto[] = [];
  @Output() notificationsChange = new EventEmitter<UserNotificationDto[]>();

  isOpen = false;

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isOpen = false;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  markAsRead(notification: UserNotificationDto): void {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        this.notifications = [...this.notifications];
        this.notificationsChange.emit(this.notifications);
      },
      error: () => {
        this.snackbarService.showError(this.translateService.instant('NOTIFICATIONS.ERROR_MARK_READ'));
      }
    });
  }

  markAsUnread(notification: UserNotificationDto): void {
    this.notificationService.markAsUnread(notification.id).subscribe({
      next: () => {
        notification.isRead = false;
        this.notifications = [...this.notifications];
        this.notificationsChange.emit(this.notifications);
      },
      error: () => {
        this.snackbarService.showError(this.translateService.instant('NOTIFICATIONS.ERROR_MARK_UNREAD'));
      }
    });
  }

  deleteNotification(notification: UserNotificationDto): void {
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
        this.notificationsChange.emit(this.notifications);
      },
      error: () => {
        this.snackbarService.showError(this.translateService.instant('NOTIFICATIONS.ERROR_DELETE'));
      }
    });
  }
}
