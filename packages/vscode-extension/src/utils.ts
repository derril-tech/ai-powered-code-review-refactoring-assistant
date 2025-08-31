/**
 * Utility functions for RefactorIQ VS Code extension.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { FindingSeverity, ProposalStatus, ExtensionConfig } from './types';

/**
 * Get extension configuration.
 */
export function getConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration('refactorIq');
  
  return {
    apiUrl: config.get('apiUrl', 'http://localhost:8000'),
    apiKey: config.get('apiKey'),
    autoScan: config.get('autoScan', false),
    showNotifications: config.get('showNotifications', true),
    autoApply: config.get('autoApply', false)
  };
}

/**
 * Get workspace root path.
 */
export function getWorkspaceRoot(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  return workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;
}

/**
 * Get relative path from workspace root.
 */
export function getRelativePath(filePath: string): string {
  const workspaceRoot = getWorkspaceRoot();
  if (workspaceRoot) {
    return path.relative(workspaceRoot, filePath);
  }
  return filePath;
}

/**
 * Get language ID from file extension.
 */
export function getLanguageFromExtension(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
  const languageMap: Record<string, string> = {
    '.py': 'python',
    '.js': 'javascript',
    '.ts': 'typescript',
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    '.java': 'java',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.php': 'php',
    '.rb': 'ruby',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.cpp': 'cpp',
    '.c': 'c',
    '.h': 'c',
    '.hpp': 'cpp'
  };
  
  return languageMap[ext] || 'unknown';
}

/**
 * Get supported file extensions.
 */
export function getSupportedExtensions(): string[] {
  return ['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cs', '.go', '.rs', '.php', '.rb'];
}

/**
 * Check if file is supported for analysis.
 */
export function isSupportedFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return getSupportedExtensions().includes(ext);
}

/**
 * Get severity icon for tree items.
 */
export function getSeverityIcon(severity: FindingSeverity): vscode.ThemeIcon {
  switch (severity) {
    case FindingSeverity.CRITICAL:
      return new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
    case FindingSeverity.HIGH:
      return new vscode.ThemeIcon('warning', new vscode.ThemeColor('warningForeground'));
    case FindingSeverity.MEDIUM:
      return new vscode.ThemeIcon('info', new vscode.ThemeColor('notificationsWarningIcon.foreground'));
    case FindingSeverity.LOW:
      return new vscode.ThemeIcon('lightbulb', new vscode.ThemeColor('notificationsInfoIcon.foreground'));
    default:
      return new vscode.ThemeIcon('circle-outline');
  }
}

/**
 * Get status icon for proposals.
 */
export function getProposalStatusIcon(status: ProposalStatus): vscode.ThemeIcon {
  switch (status) {
    case ProposalStatus.PENDING:
      return new vscode.ThemeIcon('clock');
    case ProposalStatus.VALIDATING:
      return new vscode.ThemeIcon('loading', new vscode.ThemeColor('notificationsInfoIcon.foreground'));
    case ProposalStatus.APPLYING:
      return new vscode.ThemeIcon('loading', new vscode.ThemeColor('notificationsWarningIcon.foreground'));
    case ProposalStatus.APPLIED:
      return new vscode.ThemeIcon('check', new vscode.ThemeColor('notificationsSuccessIcon.foreground'));
    case ProposalStatus.PR_CREATED:
      return new vscode.ThemeIcon('git-pull-request', new vscode.ThemeColor('notificationsSuccessIcon.foreground'));
    case ProposalStatus.REJECTED:
      return new vscode.ThemeIcon('x', new vscode.ThemeColor('errorForeground'));
    case ProposalStatus.FAILED:
      return new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
    default:
      return new vscode.ThemeIcon('circle-outline');
  }
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format duration for display.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

/**
 * Sanitize filename for safe usage.
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9\-_.]/gi, '_');
}

/**
 * Show error message with retry option.
 */
export async function showErrorWithRetry(
  message: string,
  retryCallback?: () => Promise<void>
): Promise<void> {
  const actions = retryCallback ? ['Retry'] : [];
  const result = await vscode.window.showErrorMessage(message, ...actions);
  
  if (result === 'Retry' && retryCallback) {
    await retryCallback();
  }
}

/**
 * Show progress with cancellation support.
 */
export async function withProgress<T>(
  title: string,
  task: (progress: vscode.Progress<{ message?: string; increment?: number }>, token: vscode.CancellationToken) => Promise<T>
): Promise<T> {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title,
      cancellable: true
    },
    task
  );
}

/**
 * Open file at specific line and column.
 */
export async function openFileAtLocation(
  filePath: string,
  line: number,
  column: number = 0
): Promise<void> {
  try {
    const workspaceRoot = getWorkspaceRoot();
    const fullPath = workspaceRoot ? path.join(workspaceRoot, filePath) : filePath;
    
    const uri = vscode.Uri.file(fullPath);
    const document = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(document);
    
    // Move cursor to specific location
    const position = new vscode.Position(Math.max(0, line - 1), Math.max(0, column));
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to open file: ${error}`);
  }
}

/**
 * Get file content as string.
 */
export async function getFileContent(filePath: string): Promise<string | undefined> {
  try {
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    return document.getText();
  } catch (error) {
    console.error('Failed to read file:', error);
    return undefined;
  }
}

/**
 * Write content to file.
 */
export async function writeFileContent(filePath: string, content: string): Promise<boolean> {
  try {
    const uri = vscode.Uri.file(filePath);
    const encoder = new TextEncoder();
    await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
    return true;
  } catch (error) {
    console.error('Failed to write file:', error);
    return false;
  }
}

/**
 * Debounce function execution.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function execution.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastExecution = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastExecution >= delay) {
      lastExecution = now;
      func(...args);
    }
  };
}

/**
 * Create VS Code command.
 */
export function createCommand(
  command: string,
  title: string,
  tooltip?: string,
  args?: any[]
): vscode.Command {
  return {
    command,
    title,
    tooltip,
    arguments: args
  };
}

/**
 * Get workspace files matching patterns.
 */
export async function getWorkspaceFiles(patterns: string[]): Promise<vscode.Uri[]> {
  const files: vscode.Uri[] = [];
  
  for (const pattern of patterns) {
    const found = await vscode.workspace.findFiles(pattern);
    files.push(...found);
  }
  
  return files;
}

/**
 * Format confidence score for display.
 */
export function formatConfidence(score: number): string {
  const percentage = Math.round(score * 100);
  return `${percentage}%`;
}

/**
 * Get confidence color based on score.
 */
export function getConfidenceColor(score: number): string {
  if (score >= 0.8) return 'notificationsSuccessIcon.foreground';
  if (score >= 0.6) return 'notificationsWarningIcon.foreground';
  return 'errorForeground';
}

/**
 * Validate API URL format.
 */
export function isValidApiUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}