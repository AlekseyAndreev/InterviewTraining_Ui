import { Injectable, InjectionToken } from '@angular/core';
import { AppConfig } from '../models/app-config.model';

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;

  loadConfig(): Promise<AppConfig> {
    const configPath = this.getConfigPath();
    
    return fetch(configPath)
      .then(response => response.json())
      .then(config => {
        this.config = config as AppConfig;
        return this.config;
      });
  }

  private getConfigPath(): string {
    const configName = (window as any).__APP_CONFIG__ || 'config.dev';
    return `./assets/config/config.${configName}.json`;
  }

  getConfig(): AppConfig {
    if (!this.config) {
      throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return this.config;
  }
}
