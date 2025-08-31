/**
 * Type definitions for RefactorIQ VS Code extension.
 * 
 * These types match the backend API schemas for consistent communication.
 */

import * as vscode from 'vscode';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  display_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AnalysisResponse {
  id: number;
  user_id: number;
  repo_url: string;
  repo_name: string;
  branch: string;
  commit_sha: string;
  language: string;
  analysis_type: string;
  status: AnalysisStatus;
  progress: number;
  total_files: number;
  processed_files: number;
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  created_at: string;
  updated_at: string;
}

export interface AnalysisFinding {
  id: number;
  analysis_id: number;
  title: string;
  description: string;
  severity: FindingSeverity;
  finding_type: FindingType;
  file_path: string;
  line_number: number;
  column_number?: number;
  code_snippet: string;
  ai_explanation?: string;
  suggested_fix?: string;
  confidence_score?: number;
  rule_id?: string;
  tags?: string[];
  is_auto_fixable: boolean;
}

export interface ProposalResponse {
  id: number;
  finding_id: number;
  title: string;
  description: string;
  proposal_type: ProposalType;
  patch_diff: string;
  test_patch_diff?: string;
  confidence_score: number;
  estimated_impact?: string;
  risk_score?: number;
  status: ProposalStatus;
  applied_at?: string;
  applied_by?: number;
  pr_url?: string;
  pr_number?: number;
  commit_sha?: string;
  ai_model_used?: string;
  processing_time?: number;
  tags?: any;
  validation_errors?: any;
  application_log?: string;
  rollback_info?: any;
  created_at: string;
  updated_at: string;
}

export interface ProposalPreviewResponse {
  proposal_id: number;
  files: PatchFile[];
  summary: PatchSummary;
  confidence_score: number;
  estimated_impact?: string;
  risk_score?: number;
  safety_validation: SafetyValidation;
  test_patch?: string;
  can_apply: boolean;
}

export interface PatchFile {
  old_path: string;
  new_path: string;
  chunks: PatchChunk[];
  additions: number;
  deletions: number;
}

export interface PatchChunk {
  header: string;
  old_start: number;
  old_count: number;
  new_start: number;
  new_count: number;
  lines: PatchLine[];
}

export interface PatchLine {
  type: 'addition' | 'deletion' | 'context';
  content: string;
}

export interface PatchSummary {
  files_changed: number;
  additions: number;
  deletions: number;
  net_change: number;
}

export interface SafetyValidation {
  is_safe: boolean;
  confidence_score: number;
  safety_score: number;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ValidationIssue {
  type: string;
  pattern?: string;
  description: string;
}

export interface ProposalApplyRequest {
  proposal_id: number;
  auto_apply: boolean;
  create_pr: boolean;
  pr_title?: string;
  pr_description?: string;
}

export interface ProposalApplyResponse {
  success: boolean;
  proposal?: ProposalResponse;
  pr_url?: string;
  message: string;
}

// Enums
export enum AnalysisStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum FindingSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum FindingType {
  BUG = 'bug',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  CODE_SMELL = 'code_smell',
  REFACTORING = 'refactoring',
  STYLE = 'style',
  DOCUMENTATION = 'documentation'
}

export enum ProposalStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  APPLYING = 'applying',
  APPLIED = 'applied',
  REJECTED = 'rejected',
  FAILED = 'failed',
  PR_CREATED = 'pr_created'
}

export enum ProposalType {
  BUG_FIX = 'bug_fix',
  SECURITY_FIX = 'security_fix',
  PERFORMANCE_IMPROVEMENT = 'performance_improvement',
  CODE_QUALITY = 'code_quality',
  REFACTORING = 'refactoring',
  DOCUMENTATION = 'documentation'
}

// Extension-specific types
export interface ExtensionConfig {
  apiUrl: string;
  apiKey?: string;
  autoScan: boolean;
  showNotifications: boolean;
  autoApply: boolean;
}

export interface ScanProgress {
  message: string;
  increment: number;
  total?: number;
}

export interface TreeItem {
  id: string;
  label: string;
  description?: string;
  tooltip?: string;
  collapsibleState?: vscode.TreeItemCollapsibleState;
  contextValue?: string;
  command?: vscode.Command;
  iconPath?: vscode.ThemeIcon | string;
}

export interface ProposalTreeItem extends TreeItem {
  proposal: ProposalResponse;
  severity: FindingSeverity;
}

export interface FindingTreeItem extends TreeItem {
  finding: AnalysisFinding;
  severity: FindingSeverity;
}

export interface ScanResult {
  success: boolean;
  analysis?: AnalysisResponse;
  findings?: AnalysisFinding[];
  error?: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}