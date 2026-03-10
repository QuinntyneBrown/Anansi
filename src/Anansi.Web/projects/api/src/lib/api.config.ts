import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  baseUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');

export function provideApiConfig(baseUrl: string) {
  return { provide: API_CONFIG, useValue: { baseUrl } };
}
