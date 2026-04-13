import { Component, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { APP_CONFIG } from '../../services/config.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, TranslateModule],
  template: `
<div class="home-container">
<h1 class="slogan">
        {{ 'APP.SLOGAN' | translate }}
       <span class="slogan-accent">{{ 'APP.SLOGAN_ACCENT' | translate }}</span>
      </h1>
      <div class="home-controls">
        @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
          @if (!auth.isAuthenticated) {
            @if (isLoggingIn) {
              <div class="login-loading">
                <div class="spinner"></div>
                <span>{{ 'HOME.LOGGING_IN' | translate }}</span>
              </div>
            } @else {
              <button class="btn-login" (click)="login()">{{ 'HOME.LOGIN' | translate }}</button>
            }
          } @else {
            @if (oidcSecurityService.userData$ | async; as userData) {
              @if (getUserRoles(userData).length === 0) {
                <div class="set-roles-container">
                  <p class="set-roles-hint">{{ 'HOME.SET_ROLES_HINT' | translate }}</p>
                  <button class="btn-set-roles" (click)="goToChangeRoles()">{{ 'HOME.SET_ROLES' | translate }}</button>
                </div>
              }
            }
          }
        }
      </div>
    </div>
  `
})
export class HomeComponent {
  isLoggingIn = false;
  private config = inject(APP_CONFIG);

  constructor(
    public oidcSecurityService: OidcSecurityService,
    private router: Router
  ) {}

  login(): void {
    this.isLoggingIn = true;
    sessionStorage.setItem('returnUrl', '/');
    this.oidcSecurityService.authorize();
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

  goToChangeRoles(): void {
    this.oidcSecurityService.authorize(undefined, {
      customParams: {
        redirect_to_change_roles: 'true',
        prompt: 'login'
      }
    });
  }
}
