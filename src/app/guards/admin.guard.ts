import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const oidcSecurityService = inject(OidcSecurityService);
  const router = inject(Router);

  return oidcSecurityService.userData$.pipe(
    map(({ userData }) => {
      const roles = userData?.role;
      const isAdmin = Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
      if (isAdmin) {
        return true;
      }
      router.navigate(['/']);
      return false;
    })
  );
};