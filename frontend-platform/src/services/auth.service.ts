/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from '@/lib/api-client';
import type {
  ISignupRequest,
  ISignupResponse,
  ILoginRequest,
  ILoginResponse,
  IVerifyEmailRequest,
  IVerifyEmailResponse,
  IForgotPasswordRequest,
  IForgotPasswordResponse,
  IResetPasswordRequest,
  IResetPasswordResponse,
  IProfileResponse,
} from '@/../../shared/types';

export const authService = {
  /**
   * Register a new instructor with their academy
   */
  async signup(data: ISignupRequest): Promise<ISignupResponse> {
    return apiClient.post<ISignupResponse>('/auth/signup', data);
  },

  /**
   * Login with email and password
   */
  async login(data: ILoginRequest): Promise<ILoginResponse> {
    return apiClient.post<ILoginResponse>('/auth/login', data);
  },

  /**
   * Verify email with token
   */
  async verifyEmail(data: IVerifyEmailRequest): Promise<IVerifyEmailResponse> {
    return apiClient.post<IVerifyEmailResponse>('/auth/verify-email', data);
  },

  /**
   * Request password reset email
   */
  async forgotPassword(data: IForgotPasswordRequest): Promise<IForgotPasswordResponse> {
    return apiClient.post<IForgotPasswordResponse>('/auth/forgot-password', data);
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: IResetPasswordRequest): Promise<IResetPasswordResponse> {
    return apiClient.post<IResetPasswordResponse>('/auth/reset-password', data);
  },

  /**
   * Get current user profile (requires authentication)
   */
  async getProfile(token: string): Promise<IProfileResponse> {
    return apiClient.get<IProfileResponse>('/auth/profile', token);
  },
};
