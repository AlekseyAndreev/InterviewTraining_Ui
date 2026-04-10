import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="user-info-container">
      <div class="user-card">
        <div class="user-card-header">
          @if (oidcSecurityService.userData$ | async; as userData) {
<div class="user-card-avatar">
              {{ getInitials(userData) }}
            </div>
            <h2 class="user-card-name">{{ getUserName(userData) || 'Пользователь' }}</h2>
            <p class="user-card-email">{{ getUserEmail(userData) || '' }}</p>
          }
        </div>
        
        <div class="user-card-body">
          @if (oidcSecurityService.userData$ | async; as userData) {
<div class="info-section">
<div class="info-label">Имя</div>
              <div class="info-value">{{ getUserName(userData) || 'Не указано' }}</div>
            </div>
            <div class="info-section">
              <div class="info-label">Email</div>
              <div class="info-value">{{ getUserEmail(userData) || 'Не указано' }}</div>
            </div>
           <div class="info-section">
             <div class="info-label">User ID</div>
<div class="info-value">{{ getUserId(userData) || 'Не указано' }}</div>
            </div>
          }
          
          @if (oidcSecurityService.getAccessToken() | async; as token) {
<div class="info-section">
<div class="info-label">Access Token</div>
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
    const name = this.getUserName(userData);
    const email = this.getUserEmail(userData);
    
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
    return userData?.name;
  }

  getUserEmail(userData: any): string | undefined {
    return userData?.email;
  }

  getUserId(userData: any): string | undefined {
    return userData?.sub;
  }
}
