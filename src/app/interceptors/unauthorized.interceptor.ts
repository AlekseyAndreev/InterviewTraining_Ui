import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Router } from '@angular/router';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const oidcSecurityService = inject(OidcSecurityService);
  const router = inject(Router);

  return next(req).pipe(
    tap({
      error: (error) => {
        if (error.status === 401) {
          console.warn('Unauthorized - logging out');
          oidcSecurityService.logoff().subscribe({
            complete: () => {
              router.navigate(['/']);
            }
          });
        }
      }
    })
  );
};
