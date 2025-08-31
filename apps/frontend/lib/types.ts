// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  preferred_language: SupportedLanguage;
  notification_email: boolean;
  notification_webhook: boolean;
  avatar_url?: string;
  bio?: string;
  github_username?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  full_name?: string;
  bio?: string;
  preferred_language?: SupportedLanguage;
  notification_email?: boolean;
  notification_webhook?: boolean;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  full_name: string;
  preferred_language: SupportedLanguage;
  notification_email: boolean;
  notification_webhook: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface PasswordReset {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

// Analysis Types
export interface Analysis {
  id: number;
  user_id: number;
  repo_url?: string;
  branch?: string;
  commit_sha?: string;
  language: SupportedLanguage;
  analysis_type: AnalysisType;
  status: AnalysisStatus;
  progress: number;
  total_files?: number;
  processed_files?: number;
  current_file?: string;
  custom_rules?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface AnalysisCreate {
  repo_url?: string;
  branch?: string;
  commit_sha?: string;
  language: SupportedLanguage;
  analysis_type: AnalysisType;
  custom_rules?: Record<string, any>;
}

export interface AnalysisListResponse {
  items: Analysis[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Finding Types
export interface Finding {
  id: number;
  analysis_id: number;
  title: string;
  description: string;
  severity: FindingSeverity;
  finding_type: FindingType;
  file_path: string;
  line_number: number;
  column_number?: number;
  code_snippet?: string;
  suggestion?: string;
  confidence_score: number;
  auto_fix_available: boolean;
  auto_fix_code?: string;
  created_at: string;
}

export interface FindingListResponse {
  items: Finding[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// File Upload Types
export interface FileUpload {
  filename: string;
  content_type: string;
  file_size: number;
}

export interface PresignedUrlResponse {
  upload_url: string;
  file_url: string;
  fields: Record<string, string>;
}

export interface FileAnalysis {
  file_url: string;
  language: SupportedLanguage;
  analysis_type: AnalysisType;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'status' | 'progress' | 'finding' | 'done' | 'error';
  status?: AnalysisStatus;
  progress?: number;
  processed_files?: number;
  total_files?: number;
  current_file?: string;
  finding?: Finding;
  summary?: string;
  total_findings?: number;
  error?: string;
  details?: any;
}

// Enums
export enum SupportedLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  JAVA = 'java',
  CSHARP = 'csharp',
  GO = 'go',
  RUST = 'rust',
  PHP = 'php',
  RUBY = 'ruby',
  SWIFT = 'swift',
  KOTLIN = 'kotlin',
  SCALA = 'scala',
}

export enum AnalysisType {
  FULL = 'full',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  CODE_STYLE = 'code_style',
  CUSTOM = 'custom',
}

export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum FindingSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum FindingType {
  BUG = 'bug',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  CODE_STYLE = 'code_style',
  MAINTAINABILITY = 'maintainability',
  ACCESSIBILITY = 'accessibility',
  DOCUMENTATION = 'documentation',
}

// UI Types
export interface Theme {
  name: string;
  value: 'light' | 'dark' | 'system';
}

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

export interface SidebarItem extends NavItem {
  items?: NavItem[];
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: any;
  options?: { label: string; value: string }[];
}

// Chart Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface AnalysisMetrics {
  total_analyses: number;
  completed_analyses: number;
  failed_analyses: number;
  total_findings: number;
  findings_by_severity: Record<FindingSeverity, number>;
  findings_by_type: Record<FindingType, number>;
  average_analysis_time: number;
  success_rate: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Settings Types
export interface UserSettings {
  theme: Theme;
  language: SupportedLanguage;
  notifications: {
    email: boolean;
    webhook: boolean;
    browser: boolean;
  };
  analysis: {
    auto_analyze: boolean;
    default_language: SupportedLanguage;
    default_analysis_type: AnalysisType;
  };
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  status?: number;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Filter Types
export interface AnalysisFilters {
  status?: AnalysisStatus;
  language?: SupportedLanguage;
  analysis_type?: AnalysisType;
  date_from?: string;
  date_to?: string;
}

export interface FindingFilters {
  severity?: FindingSeverity;
  finding_type?: FindingType;
  file_path?: string;
  date_from?: string;
  date_to?: string;
}
