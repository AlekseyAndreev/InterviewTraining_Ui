import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../../services/config.service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [AsyncPipe, TranslateModule],
  template: `
    <div class="user-info-container">
      <div class="user-card">
        <div class="user-card-header">
          @if (oidcSecurityService.userData$ | async; as userData) {
<div class="user-card-avatar">
              {{ getInitials(userData) }}
            </div>
            <h2 class="user-card-name">{{ getUserName(userData) || ('NAV.USER' | translate) }}</h2>
            <p class="user-card-email">{{ getUserEmail(userData) || '' }}</p>
          }
        </div>
        
        <div class="user-card-body">
          @if (oidcSecurityService.userData$ | async; as userData) {
<div class="info-section">
<div class="info-label">{{ 'USER_INFO.NAME' | translate }}</div>
              <div class="info-value">{{ getUserName(userData) || ('USER_INFO.NOT_SPECIFIED' | translate) }}</div>
            </div>
            <div class="info-section">
              <div class="info-label">{{ 'USER_INFO.EMAIL' | translate }}</div>
              <div class="info-value">{{ getUserEmail(userData) || ('USER_INFO.NOT_SPECIFIED' | translate) }}</div>
            </div>
<div class="info-section">
              <div class="info-label">{{ 'USER_INFO.USER_ID' | translate }}</div>
<div class="info-value">{{ getUserId(userData) || ('USER_INFO.NOT_SPECIFIED' | translate) }}</div>
            </div>
            <div class="info-section">
              <div class="info-label">{{ 'USER_INFO.ROLES' | translate }}</div>
              <div class="info-value">
                <div class="roles-container">
                  @if (getUserRoles(userData).length > 0) {
                    <div class="roles-list">
                      @for (role of getUserRoles(userData); track role) {
                        <span class="role-badge">{{ getRoleDisplayName(role) }}</span>
                      }
                    </div>
                  } @else {
                    <span>{{ 'USER_INFO.NO_ROLES' | translate }}</span>
                  }
                  <button class="btn-set-roles btn-set-roles-small" (click)="goToChangeRoles()">{{ 'USER_INFO.CHANGE_ROLES' | translate }}</button>
                </div>
              </div>
            </div>
          }
          
          @if (oidcSecurityService.getAccessToken() | async; as token) {
<div class="info-section">
<div class="info-label">{{ 'USER_INFO.ACCESS_TOKEN' | translate }}</div>
              <div class="token-value">{{ token }}</div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class UserInfoComponent {
  private config = inject(APP_CONFIG);
  
  constructor(
    public oidcSecurityService: OidcSecurityService,
    private translateService: TranslateService
  ) {}

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

  getUserId(userData: any): string | undefined {
    const data = userData?.userData || userData;
    return data?.sub;
  }

  getUserRoles(userData: any): string[] {
    const data = userData?.userData || userData;
    const roles = data?.role;
    if (Array.isArray(roles)) {
      return roles;
    }
    if (typeof roles === 'string') {
      return [roles];
    }
    return [];
  }

  getRoleDisplayName(role: string): string {
    const currentLang = this.translateService.currentLang || 'en';
    const roleTranslations: Record<string, Record<string, string>> = {
      'Candidate': { en: 'Candidate', ru: 'Кандидат' },
      'Expert': { en: 'Expert', ru: 'Эксперт' }
    };
    return roleTranslations[role]?.[currentLang] || role;
  }

  goToChangeRoles(): void {
    const authority = this.config.auth.authority;
    const returnUrl = window.location.origin + '/';
    window.location.href = `${authority}/Account/ChangeRoles?returnUrl=${encodeURIComponent(returnUrl)}`;
  }
}
