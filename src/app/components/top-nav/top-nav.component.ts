import { Component, HostListener, ElementRef, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AsyncPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { ChatIconComponent } from '../chat-icon/chat-icon.component';
import { NotificationService } from '../../services/notification.service';
import { UserChatService } from '../../services/user-chat.service';
import { UserNotificationDto } from '../../models/notification.model';
import { UserChatMessageDto } from '../../models/user-chat.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [RouterLink, AsyncPipe, TranslateModule, NotificationBellComponent, ChatIconComponent],
  template: `
    @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
      <nav class="top-nav">
        <a routerLink="/" class="nav-brand">{{ 'APP.TITLE' | translate }}</a>
        
        <div class="nav-menu-desktop">
          @if (auth.isAuthenticated) {
            @if (isAdmin) {
              <a routerLink="/all-users" class="nav-link">{{ 'NAV.ALL_USERS' | translate }}</a>
            }
            <a routerLink="/my-interviews" class="nav-link">{{ 'NAV.MY_INTERVIEWS' | translate }}</a>
            @if (oidcSecurityService.userData$ | async; as userData) {
              <a routerLink="/expert-search" class="nav-link">{{ 'NAV.EXPERT_SEARCH' | translate }}</a>
            }
            <div class="nav-user">
              @if (oidcSecurityService.userData$ | async; as userData) {
                <app-chat-icon [unreadCount]="chatUnreadCount"></app-chat-icon>
                <app-notification-bell 
                  [notifications]="notifications"
                  (notificationsChange)="onNotificationsChange($event)">
                </app-notification-bell>
                <a routerLink="/my-user-info" class="user-avatar-link">
                  <div class="user-avatar">
                    {{ getInitials(userData) }}
                  </div>
                </a>
                <a routerLink="/my-user-info" class="nav-link user-name-link">{{ getUserName(userData) || ('NAV.USER' | translate) }}</a>
              }
             <select class="lang-selector" (change)="switchLanguage($event)" [value]="translateService.currentLang">
               <option value="ru">{{ 'LANGUAGE.RU' | translate }}</option>
               <option value="en">{{ 'LANGUAGE.EN' | translate }}</option>
             </select>
             <button class="btn-logout" (click)="logout()">{{ 'NAV.LOGOUT' | translate }}</button>
           </div>
          } @else {
            <select class="lang-selector" (change)="switchLanguage($event)" [value]="translateService.currentLang">
              <option value="ru">{{ 'LANGUAGE.RU' | translate }}</option>
              <option value="en">{{ 'LANGUAGE.EN' | translate }}</option>
            </select>
          }
        </div>

        <div class="nav-menu-mobile">
          @if (auth.isAuthenticated) {
            <button class="mobile-menu-btn" (click)="toggleMobileMenu($event)">
              <span class="hamburger-icon">☰</span>
            </button>
            
            @if (showMobileMenu) {
              <div class="mobile-menu-dropdown">
                @if (isAdmin) {
                  <a routerLink="/all-users" class="mobile-nav-link" (click)="closeMobileMenu()">
                    {{ 'NAV.ALL_USERS' | translate }}
                  </a>
                }
                <a routerLink="/my-interviews" class="mobile-nav-link" (click)="closeMobileMenu()">
                  {{ 'NAV.MY_INTERVIEWS' | translate }}
                </a>
                @if (oidcSecurityService.userData$ | async; as userData) {
                  <a routerLink="/expert-search" class="mobile-nav-link" (click)="closeMobileMenu()">
                    {{ 'NAV.EXPERT_SEARCH' | translate }}
                  </a>
                  <app-notification-bell 
                    [notifications]="notifications"
                    (notificationsChange)="onNotificationsChange($event)">
                  </app-notification-bell>
                  <app-chat-icon [unreadCount]="chatUnreadCount"></app-chat-icon>
                  <a routerLink="/my-user-info" class="mobile-nav-link" (click)="closeMobileMenu()">
                    {{ getUserName(userData) || ('NAV.USER' | translate) }}
                  </a>
                }
                <div class="mobile-menu-divider"></div>
                <select class="lang-selector-mobile" (change)="switchLanguage($event)" [value]="translateService.currentLang">
                  <option value="ru">{{ 'LANGUAGE.RU' | translate }}</option>
                  <option value="en">{{ 'LANGUAGE.EN' | translate }}</option>
                </select>
                <button class="btn-logout-mobile" (click)="logout()">{{ 'NAV.LOGOUT' | translate }}</button>
              </div>
            }
          } @else {
            <select class="lang-selector" (change)="switchLanguage($event)" [value]="translateService.currentLang">
              <option value="ru">{{ 'LANGUAGE.RU' | translate }}</option>
              <option value="en">{{ 'LANGUAGE.EN' | translate }}</option>
            </select>
          }
        </div>
      </nav>
    }
  `
})
export class TopNavComponent implements OnInit, OnDestroy {
  showMobileMenu = false;
  notifications: UserNotificationDto[] = [];
  chatUnreadCount: number = 0;
  currentUserId: string | null = null;
  isAdmin: boolean = false;
  
  public oidcSecurityService = inject(OidcSecurityService);
  public translateService = inject(TranslateService);
  private notificationService = inject(NotificationService);
  private userChatService = inject(UserChatService);
  private authSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.authSubscription = this.oidcSecurityService.isAuthenticated$.subscribe({
      next: ({ isAuthenticated }) => {
        if (isAuthenticated) {
          this.loadNotifications();
          this.oidcSecurityService.userData$.subscribe({
            next: ({ userData }) => {
              this.currentUserId = userData?.sub || null;
              const roles = userData?.role;
              this.isAdmin = Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
            }
          });
          this.loadChatUnreadCount();
        } else {
          this.notifications = [];
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadNotifications(): void {
    this.notificationService.getUserNotifications().subscribe({
      next: (response) => {
        this.notifications = response.notifications || [];
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }

  loadChatUnreadCount(): void {
    this.userChatService.getMessagesWithAdmins().subscribe({
      next: (response) => {
        const messages = response.messages || [];
        this.chatUnreadCount = messages.filter(m => !m.isRead && m.receiverUserId === this.currentUserId).length;
      },
      error: (err) => console.error('Error loading chat unread count:', err)
    });
  }

  onNotificationsChange(updatedNotifications: UserNotificationDto[]): void {
    this.notifications = updatedNotifications;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-menu-mobile')) {
      this.showMobileMenu = false;
    }
    if (!target.closest('.notification-wrapper')) {
    }
  }

  toggleMobileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  switchLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.translateService.use(target.value);
  }

  getInitials(userData: any): string {
    const data = userData?.userData || userData;
    const name = data?.preferred_username || data?.name;
    const email = data?.email;
    
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[1][0];
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getUserName(userData: any): string | undefined {
    const data = userData?.userData || userData;
    return data?.preferred_username || data?.name;
  }

  getUserEmail(userData: any): string | undefined {
    const data = userData?.userData || userData;
    return data?.email;
  }

  logout(): void {
    this.showMobileMenu = false;
    this.oidcSecurityService.logoffAndRevokeTokens().subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (err) => console.error('Logout error:', err)
    });
  }
}
