/**
 * Authentication-related types
 */

import { UserRole } from './user.types';

/**
 * Request DTOs
 */
export interface ISignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  academyName: string;
  academySlug: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IVerifyEmailRequest {
  token: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * Response DTOs
 */
export interface IUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string | null;
  isEmailVerified: boolean;
}

export interface ITenantResponse {
  id: string;
  name: string;
  slug: string;
}

export interface ISignupResponse {
  accessToken: string;
  user: IUserResponse;
  tenant: ITenantResponse;
  verificationToken?: string; // Only in development
}

export interface ILoginResponse {
  accessToken: string;
  user: IUserResponse;
  tenant: ITenantResponse | null;
}

export interface IVerifyEmailResponse {
  message: string;
  user: {
    id: string;
    email: string;
    isEmailVerified: boolean;
  };
}

export interface IForgotPasswordResponse {
  message: string;
  resetToken?: string; // Only in development
}

export interface IResetPasswordResponse {
  message: string;
}

export interface IProfileResponse {
  user: IUserResponse;
  tenant: ITenantResponse | null;
}

/**
 * JWT Payload
 */
export interface IJwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  tenantId: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Decoded user from JWT
 */
export interface IAuthUser {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
}
