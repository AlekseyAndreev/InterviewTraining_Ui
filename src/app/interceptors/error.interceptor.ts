import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { SnackbarService } from '../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackbarService = inject(SnackbarService);
  const translateService = inject(TranslateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = translateService.instant('ERRORS.UNKNOWN');

      if (error.error?.Error?.Message) {
        errorMessage = error.error.Error.Message;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = translateService.instant('ERRORS.NO_CONNECTION');
      } else if (error.status === 500) {
        errorMessage = translateService.instant('ERRORS.INTERNAL_SERVER');
      } else if (error.status === 403) {
        errorMessage = translateService.instant('ERRORS.ACCESS_DENIED');
      } else if (error.status === 404) {
        errorMessage = translateService.instant('ERRORS.NOT_FOUND');
      }

      if (error.status !== 401) {
        snackbarService.showError(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
