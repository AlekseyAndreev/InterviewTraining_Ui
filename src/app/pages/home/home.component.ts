import { Component, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { APP_CONFIG } from '../../services/config.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, TranslateModule, RouterLink],
  template: 
`
  <div class="home-container">
    <h1 class="slogan">
      {{ 'APP.SLOGAN' | translate }}
      <span class="slogan-accent">{{ 'APP.SLOGAN_ACCENT' | translate }}</span>
    </h1>
    @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
      @if (!auth.isAuthenticated) {
        @if (isLoggingIn) {
          <div class="login-loading">
            <div class="spinner"></div>
            <span>{{ 'HOME.LOGGING_IN' | translate }}</span>
          </div>
        } @else {
          <div class="auth-buttons">
            <button class="btn-login" (click)="login()">{{ 'HOME.LOGIN' | translate }}</button>
            <button class="btn-register" (click)="register()">{{ 'HOME.REGISTER' | translate }}</button>
          </div>
        }
      }
    }
    @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
      @if (auth.isAuthenticated) {
        @if (oidcSecurityService.userData$ | async; as userData) {
          @if (hasCandidateRole(userData)) {
            <p class="candidate-hint">
              {{ 'HOME.CANDIDATE_HINT_PREFIX' | translate }}
              <a routerLink="/expert-search" class="candidate-link">{{ 'HOME.CANDIDATE_HINT_LINK' | translate }}</a>
              {{ 'HOME.CANDIDATE_HINT_SUFFIX' | translate }}
            </p>
          } @else if (hasExpertRole(userData)) {
            <p class="candidate-hint">
              {{ 'HOME.EXPERT_HINT_PREFIX' | translate }}
              <a routerLink="/my-interviews" class="candidate-link">{{ 'HOME.EXPERT_HINT_LINK' | translate }}</a>
              {{ 'HOME.EXPERT_HINT_SUFFIX' | translate }}
            </p>
          } @else if (getUserRoles(userData).length === 0) {
            <div class="set-roles-container">
              <p class="set-roles-hint">{{ 'HOME.SET_ROLES_HINT' | translate }}</p>
              <button class="btn-set-roles" (click)="goToChangeRoles()">{{ 'HOME.SET_ROLES' | translate }}</button>
            </div>
          }
        }
      }
    }
    <div class="benefits-container">
      <a routerLink="/candidate-info" class="benefit-card candidate-card clickable-card">
        <h2 class="benefit-title">{{ 'HOME.FOR_CANDIDATES' | translate }}</h2>
        <ul class="benefit-list">
          <li>{{ 'HOME.CANDIDATE_BENEFIT_1' | translate }}</li>
          <li>{{ 'HOME.CANDIDATE_BENEFIT_2' | translate }}</li>
          <li>{{ 'HOME.CANDIDATE_BENEFIT_3' | translate }}</li>
          <li>{{ 'HOME.CANDIDATE_BENEFIT_4' | translate }}</li>
        </ul>
      </a>
      <a routerLink="/expert-info" class="benefit-card expert-card clickable-card">
        <h2 class="benefit-title">{{ 'HOME.FOR_EXPERTS' | translate }}</h2>
        <ul class="benefit-list">
          <li>{{ 'HOME.EXPERT_BENEFIT_1' | translate }}</li>
          <li>{{ 'HOME.EXPERT_BENEFIT_2' | translate }}</li>
          <li>{{ 'HOME.EXPERT_BENEFIT_3' | translate }}</li>
        </ul>
      </a>
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

  register(): void {
    this.isLoggingIn = true;
    sessionStorage.setItem('returnUrl', '/');
    this.oidcSecurityService.authorize(undefined, {
      customParams: {
        'redirect_to_register': 'true'
      }
    });
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

  hasCandidateRole(userData: any): boolean {
    return this.getUserRoles(userData).includes('Candidate');
  }

  hasExpertRole(userData: any): boolean {
    return this.getUserRoles(userData).includes('Expert');
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
