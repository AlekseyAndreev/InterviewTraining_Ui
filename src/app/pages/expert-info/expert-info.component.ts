import { Component, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-expert-info',
  standalone: true,
  imports: [AsyncPipe, TranslateModule, RouterLink],
  template: `
    <div class="info-container">
      <h1 class="info-title">{{ 'EXPERT_INFO.TITLE' | translate }}</h1>
      
      <section class="info-section">
        <h2>{{ 'EXPERT_INFO.WHAT_YOU_CAN_DO' | translate }}</h2>
        <ul class="benefit-list">
          <li>{{ 'HOME.EXPERT_BENEFIT_1' | translate }}</li>
          <li>{{ 'HOME.EXPERT_BENEFIT_2' | translate }}</li>
          <li>{{ 'HOME.EXPERT_BENEFIT_3' | translate }}</li>
        </ul>
      </section>

      <section class="info-section">
        <h2>{{ 'EXPERT_INFO.HOW_TO_START' | translate }}</h2>
        @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
          @if (!auth.isAuthenticated) {
            <p>
              {{ 'EXPERT_INFO.STEP_1_REGISTER_PREFIX' | translate }}
              <a (click)="register()" class="info-link action-link">{{ 'EXPERT_INFO.REGISTER_LINK' | translate }}</a>
              {{ 'EXPERT_INFO.STEP_1_OR' | translate }}
              <a (click)="login()" class="info-link action-link">{{ 'EXPERT_INFO.LOGIN_LINK' | translate }}</a>
              {{ 'EXPERT_INFO.STEP_1_SUFFIX' | translate }}
            </p>
          } @else {
            <p>{{ 'EXPERT_INFO.STEP_1_LOGGED_IN' | translate }}</p>
          }
        }
        <p>{{ 'EXPERT_INFO.STEP_2' | translate }}</p>
        <p>{{ 'EXPERT_INFO.STEP_3' | translate }}</p>
        <p>{{ 'EXPERT_INFO.STEP_4' | translate }}</p>
      </section>

      @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
        @if (auth.isAuthenticated) {
          @if (oidcSecurityService.userData$ | async; as userData) {
            @if (hasExpertRole(userData)) {
              <section class="info-section authorized-section">
                <h2>{{ 'EXPERT_INFO.AVAILABLE_NOW' | translate }}</h2>
                <p>
                  {{ 'EXPERT_INFO.CAN_EDIT_PROFILE_PREFIX' | translate }}
                  <a routerLink="/my-user-info" class="info-link">{{ 'EXPERT_INFO.EDIT_PROFILE_LINK' | translate }}</a>
                  {{ 'EXPERT_INFO.CAN_EDIT_PROFILE_SUFFIX' | translate }}
                </p>
                <p class="hint-text">{{ 'EXPERT_INFO.PROFILE_IMPORTANT' | translate }}</p>
                <p>
                  {{ 'EXPERT_INFO.CAN_VIEW_INTERVIEWS_PREFIX' | translate }}
                  <a routerLink="/my-interviews" class="info-link">{{ 'EXPERT_INFO.VIEW_INTERVIEWS_LINK' | translate }}</a>
                  {{ 'EXPERT_INFO.CAN_VIEW_INTERVIEWS_SUFFIX' | translate }}
                </p>
              </section>
            }
          }
        }
      }

      <section class="info-section">
        <h2>{{ 'EXPERT_INFO.FILLING_PROFILE' | translate }}</h2>
        <p>{{ 'EXPERT_INFO.PROFILE_DESCRIPTION_1' | translate }}</p>
        <p>{{ 'EXPERT_INFO.PROFILE_DESCRIPTION_2' | translate }}</p>
      </section>

      <div class="back-button-container">
        <button class="btn-back" routerLink="/">{{ 'EXPERT_INFO.BACK' | translate }}</button>
      </div>
    </div>
  `
})
export class ExpertInfoComponent {
  constructor(public oidcSecurityService: OidcSecurityService) {}

  login(): void {
    sessionStorage.setItem('returnUrl', '/expert-info');
    this.oidcSecurityService.authorize();
  }

  register(): void {
    sessionStorage.setItem('returnUrl', '/expert-info');
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

  hasExpertRole(userData: any): boolean {
    return this.getUserRoles(userData).includes('Expert');
  }
}
