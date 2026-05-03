import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const oidcSecurityService = inject(OidcSecurityService);
  const router = inject(Router);

  return oidcSecurityService.isAuthenticated$.pipe(
    take(1),
    map(({ isAuthenticated }) => {
      if (isAuthenticated) {
        return true;
      }
      // Store the attempted URL for redirecting after login (localStorage for cross-tab sync)
      localStorage.setItem('returnUrl', state.url);
      
      // Redirect to home page if not authenticated
      router.navigate(['/']);
      return false;
    })
  );
};
