import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
    private translateService: TranslateService
  ) {
    this.translateService.setDefaultLang('ru');
    this.translateService.use('ru');

    this.oidcSecurityService.checkAuth().subscribe({
      next: ({ isAuthenticated, userData, accessToken }) => {
        console.log('Auth check result:', { isAuthenticated, userData, accessToken });
      },
      error: (err) => console.error('Auth check error:', err)
    });
  }
}
