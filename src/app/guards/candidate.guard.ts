import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, take, switchMap } from 'rxjs/operators';

export const candidateGuard: CanActivateFn = (route, state) => {
  const oidcSecurityService = inject(OidcSecurityService);
  const router = inject(Router);

  return oidcSecurityService.isAuthenticated$.pipe(
    take(1),
    switchMap(({ isAuthenticated }) => {
      if (!isAuthenticated) {
        sessionStorage.setItem('returnUrl', state.url);
        router.navigate(['/']);
        return [false];
      }
      
      return oidcSecurityService.userData$.pipe(
        take(1),
        map(({ userData }) => {
          const roles = userData?.role as string | string[];
          const hasCandidateRole = Array.isArray(roles) 
            ? roles.includes('Candidate') || roles.includes('Admin')
            : roles === 'Candidate' || roles === 'Admin';

          if (hasCandidateRole) {
            return true;
          }

          router.navigate(['/']);
          return false;
        })
      );
    })
  );
};
