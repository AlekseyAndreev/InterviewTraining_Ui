import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  template: `
    @if (oidcSecurityService.isAuthenticated$ | async; as auth) {
      @if (auth.isAuthenticated) {
       <nav class="top-nav">
         <a routerLink="/" class="nav-brand">Interview App</a>
         <div class="nav-menu">
           <a routerLink="/user-info" class="nav-link">
              <span>Информация</span>
            </a>
            
           <div class="nav-user">
              @if (oidcSecurityService.userData$ | async; as userData) {
<div class="user-avatar">
                  {{ getInitials(userData) }}
                </div>
                <span>{{ getUserName(userData) || 'Пользователь' }}</span>
              }
             <button class="btn-logout" (click)="logout()">Выход</button>
            </div>
          </div>
        </nav>
      }
    }
  `
})
export class TopNavComponent {
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

  logout(): void {
    this.oidcSecurityService.logoffAndRevokeTokens().subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (err) => console.error('Logout error:', err)
    });
  }
}
