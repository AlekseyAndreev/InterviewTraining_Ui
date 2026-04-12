import { Component } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

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
          }
        }
      </div>
    </div>
  `
})
export class HomeComponent {
  isLoggingIn = false;

  constructor(
    public oidcSecurityService: OidcSecurityService,
    private router: Router
  ) {}

  login(): void {
    this.isLoggingIn = true;
    sessionStorage.setItem('returnUrl', '/');
    this.oidcSecurityService.authorize();
  }
}
