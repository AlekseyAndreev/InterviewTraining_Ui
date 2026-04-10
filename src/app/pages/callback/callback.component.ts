import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `
    <div class="loading-container">
      <div class="spinner"></div>
     <p style="margin-top: 1rem;">Обработка аутентификации...</p>
    </div>
  `
})
export class CallbackComponent implements OnInit {
  constructor(
    private oidcSecurityService: OidcSecurityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.oidcSecurityService.checkAuth().subscribe({
      next: ({ isAuthenticated, userData }) => {
        console.log('Callback auth result:', { isAuthenticated, userData });
        if (isAuthenticated) {
          // Get return URL from query params or session storage
          const returnUrl = this.getReturnUrl();
          sessionStorage.removeItem('returnUrl');
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('Callback auth error:', err);
        this.router.navigate(['/']);
      }
    });
  }

  private getReturnUrl(): string {
    // Try to get from URL query params first
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    
    if (returnUrl) {
      return returnUrl;
    }
    
    // Fall back to session storage
    return sessionStorage.getItem('returnUrl') || '/';
  }
}
