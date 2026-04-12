import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAuth, PassedInitialConfig, authInterceptor } from 'angular-auth-oidc-client';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { ConfigService, APP_CONFIG } from './app/services/config.service';
import { AppConfig } from './app/models/app-config.model';

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

function getConfigPath(): string {
  const configName = (window as any).__APP_CONFIG__ || 'dev';
  return `assets/config/config.${configName}.json`;
}

async function loadConfig(): Promise<AppConfig> {
  const response = await fetch(getConfigPath());
  if (!response.ok) {
    throw new Error(`Failed to load config: ${response.statusText}`);
  }
  return response.json();
}

function createAuthConfig(appConfig: AppConfig): PassedInitialConfig {
  return {
    config: {
      authority: appConfig.auth.authority,
      redirectUrl: window.location.origin + '/callback',
      postLogoutRedirectUri: window.location.origin,
      clientId: appConfig.auth.clientId,
      scope: appConfig.auth.scope,
      responseType: appConfig.auth.responseType,
      silentRenew: appConfig.auth.silentRenew,
      useRefreshToken: appConfig.auth.useRefreshToken,
      autoUserInfo: appConfig.auth.autoUserInfo,
      logLevel: appConfig.auth.logLevel,
      secureRoutes: appConfig.auth.secureRoutes,
      ignoreNonceAfterRefresh: appConfig.auth.ignoreNonceAfterRefresh,
      disableIatOffsetValidation: appConfig.auth.disableIatOffsetValidation,
      maxIdTokenIatOffsetAllowedInSeconds: appConfig.auth.maxIdTokenIatOffsetAllowedInSeconds,
    },
  };
}

loadConfig()
  .then((appConfig) => {
    bootstrapApplication(AppComponent, {
      providers: [
        provideRouter(routes),
        provideHttpClient(
          withFetch(),
          withInterceptors([authInterceptor()])
        ),
        provideAnimations(),
        provideAuth(createAuthConfig(appConfig)),
        {
          provide: APP_CONFIG,
          useValue: appConfig,
        },
        provideTranslateService({
          loader: {
            provide: TranslateLoader,
            useFactory: customLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
    }).catch((err) => console.error(err));
  })
  .catch((err) => {
    console.error('Failed to load config:', err);
  });
