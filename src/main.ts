import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAuth, PassedInitialConfig } from 'angular-auth-oidc-client';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

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
    logLevel: 1,
    secureRoutes: [
      'https://localhost:5101/',
    ],
  },
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideAuth(authConfig),
  ],
}).catch((err) => console.error(err));
