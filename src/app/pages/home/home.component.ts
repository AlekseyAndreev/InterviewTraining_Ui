import { Component } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe],
  template: `
<div class="home-container">
<h1 class="slogan">
        Собеседования без обязательств
       <span class="slogan-accent">Найди свою идеальную возможность</span>
      </h1>
      @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
        @if (!auth.isAuthenticated) {
<button class="btn-login" (click)="login()">Войти</button>
        }
      }
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
