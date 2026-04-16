import { Component, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-candidate-info',
  standalone: true,
  imports: [AsyncPipe, TranslateModule, RouterLink],
  template: `
    <div class="info-container">
      <h1 class="info-title">{{ 'CANDIDATE_INFO.TITLE' | translate }}</h1>
      
      <section class="info-section">
        <h2>{{ 'CANDIDATE_INFO.WHAT_YOU_CAN_DO' | translate }}</h2>
        <ul class="benefit-list">
          <li>{{ 'HOME.CANDIDATE_BENEFIT_1' | translate }}</li>
          <li>{{ 'HOME.CANDIDATE_BENEFIT_2' | translate }}</li>
          <li>{{ 'HOME.CANDIDATE_BENEFIT_3' | translate }}</li>
          <li>{{ 'HOME.CANDIDATE_BENEFIT_4' | translate }}</li>
        </ul>
      </section>

      <section class="info-section">
        <h2>{{ 'CANDIDATE_INFO.HOW_TO_START' | translate }}</h2>
        @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
          @if (!auth.isAuthenticated) {
            <p>
              {{ 'CANDIDATE_INFO.STEP_1_REGISTER_PREFIX' | translate }}
              <a (click)="register()" class="info-link action-link">{{ 'CANDIDATE_INFO.REGISTER_LINK' | translate }}</a>
              {{ 'CANDIDATE_INFO.STEP_1_OR' | translate }}
              <a (click)="login()" class="info-link action-link">{{ 'CANDIDATE_INFO.LOGIN_LINK' | translate }}</a>
              {{ 'CANDIDATE_INFO.STEP_1_SUFFIX' | translate }}
            </p>
          } @else {
            <p>{{ 'CANDIDATE_INFO.STEP_1_LOGGED_IN' | translate }}</p>
          }
        }
        <p>{{ 'CANDIDATE_INFO.STEP_2' | translate }}</p>
        <p>{{ 'CANDIDATE_INFO.STEP_3' | translate }}</p>
        <p>{{ 'CANDIDATE_INFO.STEP_4' | translate }}</p>
      </section>

      @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
        @if (auth.isAuthenticated) {
          @if (oidcSecurityService.userData$ | async; as userData) {
            @if (hasCandidateRole(userData)) {
              <section class="info-section authorized-section">
                <h2>{{ 'CANDIDATE_INFO.AVAILABLE_NOW' | translate }}</h2>
                <p>
                  {{ 'CANDIDATE_INFO.CAN_SEARCH_EXPERTS_PREFIX' | translate }}
                  <a routerLink="/expert-search" class="info-link">{{ 'CANDIDATE_INFO.SEARCH_EXPERTS_LINK' | translate }}</a>
                  {{ 'CANDIDATE_INFO.CAN_SEARCH_EXPERTS_SUFFIX' | translate }}
                </p>
                <p>
                  {{ 'CANDIDATE_INFO.CAN_EDIT_PROFILE_PREFIX' | translate }}
                  <a routerLink="/my-user-info" class="info-link">{{ 'CANDIDATE_INFO.EDIT_PROFILE_LINK' | translate }}</a>
                  {{ 'CANDIDATE_INFO.CAN_EDIT_PROFILE_SUFFIX' | translate }}
                </p>
                <p>
                  {{ 'CANDIDATE_INFO.CAN_VIEW_INTERVIEWS_PREFIX' | translate }}
                  <a routerLink="/my-interviews" class="info-link">{{ 'CANDIDATE_INFO.VIEW_INTERVIEWS_LINK' | translate }}</a>
                  {{ 'CANDIDATE_INFO.CAN_VIEW_INTERVIEWS_SUFFIX' | translate }}
                </p>
              </section>
            }
          }
        }
      }

      <section class="info-section">
        <h2>{{ 'CANDIDATE_INFO.FILLING_PROFILE' | translate }}</h2>
        <p>{{ 'CANDIDATE_INFO.PROFILE_DESCRIPTION_1' | translate }}</p>
        <p>{{ 'CANDIDATE_INFO.PROFILE_DESCRIPTION_2' | translate }}</p>
      </section>

      <div class="back-button-container">
        <button class="btn-back" routerLink="/">{{ 'CANDIDATE_INFO.BACK' | translate }}</button>
      </div>
    </div>
  `
})
export class CandidateInfoComponent {
  constructor(public oidcSecurityService: OidcSecurityService) {}

  login(): void {
    sessionStorage.setItem('returnUrl', '/candidate-info');
    this.oidcSecurityService.authorize();
  }

  register(): void {
    sessionStorage.setItem('returnUrl', '/candidate-info');
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
}
