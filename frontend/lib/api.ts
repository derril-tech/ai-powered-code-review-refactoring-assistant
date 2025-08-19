import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';

// Types
interface TokenPayload {
  exp: number;
  sub: string;
  user_id: number;
}

// API Client Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  private setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        this.setTokens(access_token, refresh_token);
        return access_token;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }) {
    const response = await this.post<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>('/auth/login', credentials);

    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    full_name: string;
    preferred_language: string;
    notification_email: boolean;
    notification_webhook: boolean;
  }) {
    const response = await this.post<{
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
    }>('/auth/register', userData);

    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async logout() {
    this.clearTokens();
  }

  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.post('/auth/reset-password', { token, new_password: newPassword });
  }

  // User methods
  async getCurrentUser() {
    return this.get<{
      id: number;
      email: string;
      username: string;
      full_name: string;
      is_active: boolean;
      is_verified: boolean;
      preferred_language: string;
      notification_email: boolean;
      notification_webhook: boolean;
      avatar_url?: string;
      bio?: string;
      github_username?: string;
      created_at: string;
      updated_at: string;
    }>('/users/me');
  }

  async updateProfile(profileData: {
    full_name?: string;
    bio?: string;
    preferred_language?: string;
    notification_email?: boolean;
    notification_webhook?: boolean;
  }) {
    return this.put('/users/me', profileData);
  }

  async deleteAccount() {
    return this.delete('/users/me');
  }

  // Analysis methods
  async createAnalysis(analysisData: {
    repo_url?: string;
    branch?: string;
    commit_sha?: string;
    language: string;
    analysis_type: string;
    custom_rules?: Record<string, any>;
  }) {
    return this.post<{
      id: number;
      status: string;
      created_at: string;
    }>('/analyses', analysisData);
  }

  async getAnalyses(params?: {
    page?: number;
    size?: number;
    status?: string;
    language?: string;
    analysis_type?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.get<{
      items: any[];
      total: number;
      page: number;
      size: number;
      pages: number;
    }>(`/analyses?${searchParams.toString()}`);
  }

  async getAnalysis(analysisId: number) {
    return this.get(`/analyses/${analysisId}`);
  }

  async getAnalysisFindings(
    analysisId: number,
    params?: {
      severity?: string;
      finding_type?: string;
      page?: number;
      size?: number;
    }
  ) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.get(`/analyses/${analysisId}/findings?${searchParams.toString()}`);
  }

  async deleteAnalysis(analysisId: number) {
    return this.delete(`/analyses/${analysisId}`);
  }

  // File upload methods
  async getPresignedUrl(fileData: {
    filename: string;
    content_type: string;
    file_size: number;
  }) {
    return this.post<{
      upload_url: string;
      file_url: string;
      fields: Record<string, string>;
    }>('/uploads/presign', fileData);
  }

  async analyzeFile(fileData: {
    file_url: string;
    language: string;
    analysis_type: string;
  }) {
    return this.post('/uploads/analyze', fileData);
  }

  // Health check
  async healthCheck() {
    return this.get<{
      status: string;
      version: string;
      environment: string;
    }>('/health');
  }

  async detailedHealthCheck() {
    return this.get<{
      status: string;
      version: string;
      environment: string;
      services: {
        database: string;
        redis: string;
      };
    }>('/health/detailed');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export for use in components
export default apiClient;
