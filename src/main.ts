import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAuth, PassedInitialConfig } from 'angular-auth-oidc-client';
import { provideTranslateService, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`).pipe(
      catchError(() => {
        console.warn(`Translation file for ${lang} not found`);
        return of({});
      })
    );
  }
}

export function customLoaderFactory(http: HttpClient): CustomTranslateLoader {
  return new CustomTranslateLoader(http);
}

const authConfig: PassedInitialConfig = {
  config: {
    authority: 'https://localhost:5101',
    redirectUrl: window.location.origin + '/callback',
    postLogoutRedirectUri: window.location.origin,
    clientId: 'interview_training_web_spa',
    scope: 'openid profile roles permissions interview_training_signalr_web interview_training_interview offline_access',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    autoUserInfo: true,
    logLevel: 3,
    secureRoutes: [
      'https://localhost:5101/',
    ],
    ignoreNonceAfterRefresh: true,
    disableIatOffsetValidation: true,
    maxIdTokenIatOffsetAllowedInSeconds: 600,
  },
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideAuth(authConfig),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: customLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
}).catch((err) => console.error(err));
