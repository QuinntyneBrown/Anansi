export interface RegisterCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  photographerId?: string;
}

export interface LoginCommand {
  email: string;
  password: string;
}

export interface ForgotPasswordCommand {
  email: string;
}

export interface ResetPasswordCommand {
  token: string;
  newPassword: string;
}

export interface ChangePasswordCommand {
  currentPassword: string;
  newPassword: string;
}

export interface AccountSettings {
  email: string;
  firstName: string;
  lastName: string;
  businessName: string;
  timezone?: string;
}

export interface UpdateAccountSettingsCommand {
  firstName: string;
  lastName: string;
  businessName: string;
  timezone?: string;
}

export interface StorageUsageDto {
  usedBytes: number;
  totalBytes: number;
  warningLevel: string;
}
