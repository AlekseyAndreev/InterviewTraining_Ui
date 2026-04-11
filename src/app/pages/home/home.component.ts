import { Component } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

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
<button class="btn-login" (click)="login()">{{ 'HOME.LOGIN' | translate }}</button>
          }
        }
      </div>
    </div>
  `
})
export class HomeComponent {
  constructor(public oidcSecurityService: OidcSecurityService) {}

  login(): void {
    sessionStorage.setItem('returnUrl', '/');
    this.oidcSecurityService.authorize();
  }
}
