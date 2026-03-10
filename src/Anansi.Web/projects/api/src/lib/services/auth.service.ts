import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import {
  AuthResponse,
  ChangePasswordCommand,
  ForgotPasswordCommand,
  LoginCommand,
  RegisterCommand,
  ResetPasswordCommand,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  register(command: RegisterCommand): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.config.baseUrl}/api/auth/register`,
      command,
    );
  }

  login(command: LoginCommand): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.config.baseUrl}/api/auth/login`,
      command,
    );
  }

  forgotPassword(command: ForgotPasswordCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/auth/forgot-password`,
      command,
    );
  }

  resetPassword(command: ResetPasswordCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/auth/reset-password`,
      command,
    );
  }

  changePassword(command: ChangePasswordCommand): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/auth/change-password`,
      command,
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.config.baseUrl}/api/auth/logout`,
      {},
    );
  }
}
