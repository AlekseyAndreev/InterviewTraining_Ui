import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { TranslateModule } from '@ngx-translate/core';

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
  constructor(public oidcSecurityService: OidcSecurityService) {}

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
}
