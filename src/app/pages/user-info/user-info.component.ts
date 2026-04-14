import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../../services/config.service';
import { UserService } from '../../services/user.service';
import { GetUserInfoResponse } from '../../models/user-info.model';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [AsyncPipe, TranslateModule],
  template: `
    <div class="user-info-container">
      <div class="user-card">
        <div class="user-card-header">
          @if (apiUserInfo) {
            <div class="user-card-avatar">
              @if (apiUserInfo.photoUrl) {
                <img [src]="apiUserInfo.photoUrl" alt="User photo" class="avatar-image">
              } @else {
                {{ getInitialsFromName(apiUserInfo.fullName) }}
              }
            </div>
            <h2 class="user-card-name">{{ apiUserInfo.fullName || ('NAV.USER' | translate) }}</h2>
          } @else if (oidcSecurityService.userData$ | async; as userData) {
            <div class="user-card-avatar">
              {{ getInitials(userData) }}
            </div>
            <h2 class="user-card-name">{{ getUserEmail(userData) || ('NAV.USER' | translate) }}</h2>
          }
        </div>
        
        <div class="user-card-body">
          @if (apiUserInfo) {
            @if (apiUserInfo.shortDescription) {
              <div class="info-section">
                <div class="info-label">{{ 'USER_INFO.SHORT_DESCRIPTION' | translate }}</div>
                <div class="info-value">{{ apiUserInfo.shortDescription }}</div>
              </div>
            }
            @if (apiUserInfo.description) {
              <div class="info-section">
                <div class="info-label">{{ 'USER_INFO.DESCRIPTION' | translate }}</div>
                <div class="info-value">{{ apiUserInfo.description }}</div>
              </div>
            }
          }
          
          @if (oidcSecurityService.userData$ | async; as userData) {
            <div class="info-section">
              <div class="info-label">{{ 'USER_INFO.EMAIL' | translate }}</div>
              <div class="info-value">{{ getUserEmail(userData) || ('USER_INFO.NOT_SPECIFIED' | translate) }}</div>
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
        </div>
      </div>
    </div>
  `
})
export class UserInfoComponent implements OnInit {
  private config = inject(APP_CONFIG);
  private userService = inject(UserService);
  
  apiUserInfo: GetUserInfoResponse | null = null;
  
  constructor(
    public oidcSecurityService: OidcSecurityService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    this.userService.getUserInfo().subscribe({
      next: (response) => {
        this.apiUserInfo = response;
      },
      error: (error) => {
        console.error('Error loading user info:', error);
      }
    });
  }

  getInitialsFromName(name: string | null): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return name.substring(0, 2).toUpperCase();
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
    this.oidcSecurityService.authorize(undefined, {
      customParams: {
        redirect_to_change_roles: 'true',
        prompt: 'login'
      }
    });
  }
}
