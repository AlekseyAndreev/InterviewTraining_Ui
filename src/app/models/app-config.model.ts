export interface AuthConfig {
  authority: string;
  clientId: string;
  scope: string;
  responseType: string;
  silentRenew: boolean;
  useRefreshToken: boolean;
  autoUserInfo: boolean;
  logLevel: number;
  secureRoutes: string[];
  ignoreNonceAfterRefresh: boolean;
  disableIatOffsetValidation: boolean;
  maxIdTokenIatOffsetAllowedInSeconds: number;
}

export interface ApiConfig {
  baseUrl: string;
}

export interface AppConfig {
  auth: AuthConfig;
  api: ApiConfig;
}
