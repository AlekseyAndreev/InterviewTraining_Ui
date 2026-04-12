import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { TranslateService } from '@ngx-translate/core';
import { TopNavComponent } from './components/top-nav/top-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopNavComponent],
  template: `
    <app-top-nav></app-top-nav>
<main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent {
  constructor(
    private oidcSecurityService: OidcSecurityService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.translateService.setDefaultLang('ru');
    this.translateService.use('ru');

    this.oidcSecurityService.checkAuth().subscribe({
      next: ({ isAuthenticated, userData, accessToken }) => {
        if (isAuthenticated) {
          const returnUrl = sessionStorage.getItem('returnUrl') || '/';
          sessionStorage.removeItem('returnUrl');
          
          if (window.location.pathname === '/callback') {
            this.router.navigateByUrl(returnUrl);
          }
        }
      },
      error: (err) => console.error('AppComponent Auth check error:', err)
    });
  }
}
