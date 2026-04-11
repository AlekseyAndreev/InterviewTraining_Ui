import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AsyncPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [RouterLink, AsyncPipe, TranslateModule],
  template: `
    @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
      <nav class="top-nav">
        <a routerLink="/" class="nav-brand">{{ 'APP.TITLE' | translate }}</a>
        <div class="nav-menu">
          @if (auth.isAuthenticated) {
            @if (oidcSecurityService.userData$ | async; as userData) {
              <a routerLink="/expert-search" class="nav-link">{{ 'NAV.EXPERT_SEARCH' | translate }}</a>
            }
            <div class="nav-user">
              @if (oidcSecurityService.userData$ | async; as userData) {
                <div class="user-avatar">
                  {{ getInitials(userData) }}
                </div>
                <a routerLink="/user-info" class="nav-link user-name-link">{{ getUserName(userData) || ('NAV.USER' | translate) }}</a>
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
      </nav>
    }
  `
})
export class TopNavComponent {
  constructor(
    public oidcSecurityService: OidcSecurityService,
    public translateService: TranslateService
  ) {}

  switchLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.translateService.use(target.value);
  }

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

  logout(): void {
    this.oidcSecurityService.logoffAndRevokeTokens().subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (err) => console.error('Logout error:', err)
    });
  }
}
