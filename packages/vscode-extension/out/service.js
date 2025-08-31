"use strict";
/**
 * RefactorIQ API service for VS Code extension.
 *
 * Handles communication with the RefactorIQ backend API including
 * authentication, analysis requests, and proposal operations.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefactorIQService = void 0;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("./utils");
class RefactorIQService {
    constructor(context) {
        this.context = context;
        const config = (0, utils_1.getConfig)();
        this.client = axios_1.default.create({
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
        this.client.interceptors.response.use((response) => response, async (error) => {
            if (error.response?.status === 401 && this.refreshToken) {
                try {
                    await this.refreshAccessToken();
                    // Retry the original request
                    return this.client.request(error.config);
                }
                catch (refreshError) {
                    // Refresh failed, need to re-authenticate
                    await this.clearTokens();
                    throw refreshError;
                }
            }
            return Promise.reject(error);
        });
    }
    /**
     * Test API connection.
     */
    async testConnection() {
        try {
            const config = (0, utils_1.getConfig)();
            if (!(0, utils_1.isValidApiUrl)(config.apiUrl)) {
                return { success: false, error: 'Invalid API URL format' };
            }
            const response = await this.client.get('/api/v1/health');
            return { success: response.status === 200 };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Connection failed'
            };
        }
    }
    /**
     * Authenticate with email and password.
     */
    async authenticate(email, password) {
        try {
            const response = await this.client.post('/api/v1/auth/login', {
                email,
                password
            });
            this.accessToken = response.data.access_token;
            this.refreshToken = response.data.refresh_token;
            // Store tokens securely
            await this.storeTokens(this.accessToken, this.refreshToken);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }
    /**
     * Authenticate with API key.
     */
    async authenticateWithApiKey(apiKey) {
        try {
            // Test API key by making a simple request
            const testClient = axios_1.default.create({
                baseURL: (0, utils_1.getConfig)().apiUrl,
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            await testClient.get('/api/v1/users/me');
            this.accessToken = apiKey;
            await this.storeTokens(apiKey);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }
    /**
     * Scan current file for issues.
     */
    async scanFile(filePath, content, language) {
        try {
            const response = await this.client.post('/api/v1/analyses/', {
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
            const findingsResponse = await this.client.get(`/api/v1/analyses/${response.data.id}/findings`);
            return {
                success: true,
                analysis: response.data,
                findings: findingsResponse.data
            };
        }
        catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }
    /**
     * Scan workspace for issues.
     */
    async scanWorkspace(files) {
        try {
            const response = await this.client.post('/api/v1/analyses/', {
                repo_url: 'vscode-workspace',
                repo_name: 'current-workspace',
                branch: 'main',
                commit_sha: 'HEAD',
                language: 'mixed',
                analysis_type: 'full',
                files: files
            });
            // Get findings for this analysis
            const findingsResponse = await this.client.get(`/api/v1/analyses/${response.data.id}/findings`);
            return {
                success: true,
                analysis: response.data,
                findings: findingsResponse.data
            };
        }
        catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }
    /**
     * Get proposals for current user.
     */
    async getProposals() {
        try {
            const response = await this.client.get('/api/v1/proposals/');
            return response.data;
        }
        catch (error) {
            console.error('Failed to get proposals:', error);
            return [];
        }
    }
    /**
     * Get proposal preview.
     */
    async getProposalPreview(proposalId) {
        try {
            const response = await this.client.get(`/api/v1/proposals/${proposalId}/preview`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get proposal preview:', error);
            return null;
        }
    }
    /**
     * Apply proposal.
     */
    async applyProposal(request) {
        try {
            const response = await this.client.post(`/api/v1/proposals/${request.proposal_id}/apply`, request);
            return response.data;
        }
        catch (error) {
            return {
                success: false,
                message: this.getErrorMessage(error)
            };
        }
    }
    /**
     * Reject proposal.
     */
    async rejectProposal(proposalId) {
        try {
            await this.client.post(`/api/v1/proposals/${proposalId}/reject`);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: this.getErrorMessage(error)
            };
        }
    }
    /**
     * Get analysis status.
     */
    async getAnalysisStatus(analysisId) {
        try {
            const response = await this.client.get(`/api/v1/analyses/${analysisId}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get analysis status:', error);
            return null;
        }
    }
    /**
     * Get findings for analysis.
     */
    async getFindings(analysisId) {
        try {
            const response = await this.client.get(`/api/v1/analyses/${analysisId}/findings`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to get findings:', error);
            return [];
        }
    }
    /**
     * Check if authenticated.
     */
    isAuthenticated() {
        return !!this.accessToken;
    }
    /**
     * Sign out and clear tokens.
     */
    async signOut() {
        await this.clearTokens();
        this.accessToken = undefined;
        this.refreshToken = undefined;
    }
    /**
     * Refresh access token.
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        const response = await this.client.post('/api/v1/auth/refresh', {
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
    async storeTokens(accessToken, refreshToken) {
        try {
            if (this.context) {
                await this.context.secrets.store('refactor-iq.access-token', accessToken);
                if (refreshToken) {
                    await this.context.secrets.store('refactor-iq.refresh-token', refreshToken);
                }
            }
        }
        catch (error) {
            console.error('Failed to store tokens:', error);
        }
    }
    /**
     * Load tokens from VS Code secrets.
     */
    async loadTokens() {
        try {
            if (this.context) {
                this.accessToken = await this.context.secrets.get('refactor-iq.access-token');
                this.refreshToken = await this.context.secrets.get('refactor-iq.refresh-token');
            }
        }
        catch (error) {
            console.error('Failed to load tokens:', error);
        }
    }
    /**
     * Clear stored tokens.
     */
    async clearTokens() {
        try {
            if (this.context) {
                await this.context.secrets.delete('refactor-iq.access-token');
                await this.context.secrets.delete('refactor-iq.refresh-token');
            }
        }
        catch (error) {
            console.error('Failed to clear tokens:', error);
        }
    }
    /**
     * Extract error message from various error types.
     */
    getErrorMessage(error) {
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.response?.data) {
                const data = axiosError.response.data;
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
    updateConfig() {
        const config = (0, utils_1.getConfig)();
        this.client.defaults.baseURL = config.apiUrl;
    }
}
exports.RefactorIQService = RefactorIQService;
//# sourceMappingURL=service.js.map