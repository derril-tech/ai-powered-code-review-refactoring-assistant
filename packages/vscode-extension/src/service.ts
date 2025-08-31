/**
 * RefactorIQ API service for VS Code extension.
 * 
 * Handles communication with the RefactorIQ backend API including
 * authentication, analysis requests, and proposal operations.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import * as vscode from 'vscode';
import {
  ApiResponse,
  TokenResponse,
  AnalysisResponse,
  AnalysisFinding,
  ProposalResponse,
  ProposalPreviewResponse,
  ProposalApplyRequest,
  ProposalApplyResponse,
  ApiError,
  ScanResult
} from './types';
import { getConfig, isValidApiUrl } from './utils';

export class RefactorIQService {
  private client: AxiosInstance;
  private accessToken?: string;
  private refreshToken?: string;
  private context?: vscode.ExtensionContext;

  constructor(context?: vscode.ExtensionContext) {
    this.context = context;
    const config = getConfig();
    
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RefactorIQ-VSCode/1.0.0'
      }
    });

    // Setup request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Setup response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken();
            // Retry the original request
            return this.client.request(error.config);
          } catch (refreshError) {
            // Refresh failed, need to re-authenticate
            await this.clearTokens();
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Test API connection.
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const config = getConfig();
      if (!isValidApiUrl(config.apiUrl)) {
        return { success: false, error: 'Invalid API URL format' };
      }

      const response = await this.client.get('/api/v1/health');
      return { success: response.status === 200 };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  /**
   * Authenticate with email and password.
   */
  async authenticate(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: AxiosResponse<TokenResponse> = await this.client.post('/api/v1/auth/login', {
        email,
        password
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;

      // Store tokens securely
      await this.storeTokens(this.accessToken, this.refreshToken);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: this.getErrorMessage(error) 
      };
    }
  }

  /**
   * Authenticate with API key.
   */
  async authenticateWithApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Test API key by making a simple request
      const testClient = axios.create({
        baseURL: getConfig().apiUrl,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      await testClient.get('/api/v1/users/me');
      
      this.accessToken = apiKey;
      await this.storeTokens(apiKey);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: this.getErrorMessage(error) 
      };
    }
  }

  /**
   * Scan current file for issues.
   */
  async scanFile(filePath: string, content: string, language: string): Promise<ScanResult> {
    try {
      const response: AxiosResponse<AnalysisResponse> = await this.client.post('/api/v1/analyses/', {
        repo_url: 'vscode-workspace',
        repo_name: 'current-workspace',
        branch: 'main',
        commit_sha: 'HEAD',
        language: language,
        analysis_type: 'full',
        files: [{
          path: filePath,
          content: content,
          language: language
        }]
      });

      // Get findings for this analysis
      const findingsResponse: AxiosResponse<AnalysisFinding[]> = await this.client.get(
        `/api/v1/analyses/${response.data.id}/findings`
      );

      return {
        success: true,
        analysis: response.data,
        findings: findingsResponse.data
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Scan workspace for issues.
   */
  async scanWorkspace(files: { path: string; content: string; language: string }[]): Promise<ScanResult> {
    try {
      const response: AxiosResponse<AnalysisResponse> = await this.client.post('/api/v1/analyses/', {
        repo_url: 'vscode-workspace',
        repo_name: 'current-workspace',
        branch: 'main',
        commit_sha: 'HEAD',
        language: 'mixed',
        analysis_type: 'full',
        files: files
      });

      // Get findings for this analysis
      const findingsResponse: AxiosResponse<AnalysisFinding[]> = await this.client.get(
        `/api/v1/analyses/${response.data.id}/findings`
      );

      return {
        success: true,
        analysis: response.data,
        findings: findingsResponse.data
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Get proposals for current user.
   */
  async getProposals(): Promise<ProposalResponse[]> {
    try {
      const response: AxiosResponse<ProposalResponse[]> = await this.client.get('/api/v1/proposals/');
      return response.data;
    } catch (error) {
      console.error('Failed to get proposals:', error);
      return [];
    }
  }

  /**
   * Get proposal preview.
   */
  async getProposalPreview(proposalId: number): Promise<ProposalPreviewResponse | null> {
    try {
      const response: AxiosResponse<ProposalPreviewResponse> = await this.client.get(
        `/api/v1/proposals/${proposalId}/preview`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get proposal preview:', error);
      return null;
    }
  }

  /**
   * Apply proposal.
   */
  async applyProposal(request: ProposalApplyRequest): Promise<ProposalApplyResponse> {
    try {
      const response: AxiosResponse<ProposalApplyResponse> = await this.client.post(
        `/api/v1/proposals/${request.proposal_id}/apply`,
        request
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Reject proposal.
   */
  async rejectProposal(proposalId: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.client.post(`/api/v1/proposals/${proposalId}/reject`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error)
      };
    }
  }

  /**
   * Get analysis status.
   */
  async getAnalysisStatus(analysisId: number): Promise<AnalysisResponse | null> {
    try {
      const response: AxiosResponse<AnalysisResponse> = await this.client.get(
        `/api/v1/analyses/${analysisId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get analysis status:', error);
      return null;
    }
  }

  /**
   * Get findings for analysis.
   */
  async getFindings(analysisId: number): Promise<AnalysisFinding[]> {
    try {
      const response: AxiosResponse<AnalysisFinding[]> = await this.client.get(
        `/api/v1/analyses/${analysisId}/findings`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get findings:', error);
      return [];
    }
  }

  /**
   * Check if authenticated.
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Sign out and clear tokens.
   */
  async signOut(): Promise<void> {
    await this.clearTokens();
    this.accessToken = undefined;
    this.refreshToken = undefined;
  }

  /**
   * Refresh access token.
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response: AxiosResponse<TokenResponse> = await this.client.post('/api/v1/auth/refresh', {
      refresh_token: this.refreshToken
    });

    this.accessToken = response.data.access_token;
    if (response.data.refresh_token) {
      this.refreshToken = response.data.refresh_token;
    }

    await this.storeTokens(this.accessToken, this.refreshToken);
  }

  /**
   * Store tokens securely in VS Code secrets.
   */
  private async storeTokens(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      if (this.context) {
        await this.context.secrets.store('refactor-iq.access-token', accessToken);
        if (refreshToken) {
          await this.context.secrets.store('refactor-iq.refresh-token', refreshToken);
        }
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Load tokens from VS Code secrets.
   */
  async loadTokens(): Promise<void> {
    try {
      if (this.context) {
        this.accessToken = await this.context.secrets.get('refactor-iq.access-token');
        this.refreshToken = await this.context.secrets.get('refactor-iq.refresh-token');
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  /**
   * Clear stored tokens.
   */
  private async clearTokens(): Promise<void> {
    try {
      if (this.context) {
        await this.context.secrets.delete('refactor-iq.access-token');
        await this.context.secrets.delete('refactor-iq.refresh-token');
      }
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Extract error message from various error types.
   */
  private getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.data) {
        const data = axiosError.response.data as any;
        return data.detail || data.message || axiosError.message;
      }
      return axiosError.message;
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'Unknown error occurred';
  }

  /**
   * Update API configuration.
   */
  updateConfig(): void {
    const config = getConfig();
    this.client.defaults.baseURL = config.apiUrl;
  }
}