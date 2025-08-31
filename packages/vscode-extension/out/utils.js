"use strict";
/**
 * Utility functions for RefactorIQ VS Code extension.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidApiUrl = exports.getConfidenceColor = exports.formatConfidence = exports.getWorkspaceFiles = exports.createCommand = exports.throttle = exports.debounce = exports.writeFileContent = exports.getFileContent = exports.openFileAtLocation = exports.withProgress = exports.showErrorWithRetry = exports.sanitizeFilename = exports.formatDuration = exports.formatFileSize = exports.getProposalStatusIcon = exports.getSeverityIcon = exports.isSupportedFile = exports.getSupportedExtensions = exports.getLanguageFromExtension = exports.getRelativePath = exports.getWorkspaceRoot = exports.getConfig = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const types_1 = require("./types");
/**
 * Get extension configuration.
 */
function getConfig() {
    const config = vscode.workspace.getConfiguration('refactorIq');
    return {
        apiUrl: config.get('apiUrl', 'http://localhost:8000'),
        apiKey: config.get('apiKey'),
        autoScan: config.get('autoScan', false),
        showNotifications: config.get('showNotifications', true),
        autoApply: config.get('autoApply', false)
    };
}
exports.getConfig = getConfig;
/**
 * Get workspace root path.
 */
function getWorkspaceRoot() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    return workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;
}
exports.getWorkspaceRoot = getWorkspaceRoot;
/**
 * Get relative path from workspace root.
 */
function getRelativePath(filePath) {
    const workspaceRoot = getWorkspaceRoot();
    if (workspaceRoot) {
        return path.relative(workspaceRoot, filePath);
    }
    return filePath;
}
exports.getRelativePath = getRelativePath;
/**
 * Get language ID from file extension.
 */
function getLanguageFromExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap = {
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
exports.getLanguageFromExtension = getLanguageFromExtension;
/**
 * Get supported file extensions.
 */
function getSupportedExtensions() {
    return ['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cs', '.go', '.rs', '.php', '.rb'];
}
exports.getSupportedExtensions = getSupportedExtensions;
/**
 * Check if file is supported for analysis.
 */
function isSupportedFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return getSupportedExtensions().includes(ext);
}
exports.isSupportedFile = isSupportedFile;
/**
 * Get severity icon for tree items.
 */
function getSeverityIcon(severity) {
    switch (severity) {
        case types_1.FindingSeverity.CRITICAL:
            return new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
        case types_1.FindingSeverity.HIGH:
            return new vscode.ThemeIcon('warning', new vscode.ThemeColor('warningForeground'));
        case types_1.FindingSeverity.MEDIUM:
            return new vscode.ThemeIcon('info', new vscode.ThemeColor('notificationsWarningIcon.foreground'));
        case types_1.FindingSeverity.LOW:
            return new vscode.ThemeIcon('lightbulb', new vscode.ThemeColor('notificationsInfoIcon.foreground'));
        default:
            return new vscode.ThemeIcon('circle-outline');
    }
}
exports.getSeverityIcon = getSeverityIcon;
/**
 * Get status icon for proposals.
 */
function getProposalStatusIcon(status) {
    switch (status) {
        case types_1.ProposalStatus.PENDING:
            return new vscode.ThemeIcon('clock');
        case types_1.ProposalStatus.VALIDATING:
            return new vscode.ThemeIcon('loading', new vscode.ThemeColor('notificationsInfoIcon.foreground'));
        case types_1.ProposalStatus.APPLYING:
            return new vscode.ThemeIcon('loading', new vscode.ThemeColor('notificationsWarningIcon.foreground'));
        case types_1.ProposalStatus.APPLIED:
            return new vscode.ThemeIcon('check', new vscode.ThemeColor('notificationsSuccessIcon.foreground'));
        case types_1.ProposalStatus.PR_CREATED:
            return new vscode.ThemeIcon('git-pull-request', new vscode.ThemeColor('notificationsSuccessIcon.foreground'));
        case types_1.ProposalStatus.REJECTED:
            return new vscode.ThemeIcon('x', new vscode.ThemeColor('errorForeground'));
        case types_1.ProposalStatus.FAILED:
            return new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
        default:
            return new vscode.ThemeIcon('circle-outline');
    }
}
exports.getProposalStatusIcon = getProposalStatusIcon;
/**
 * Format file size for display.
 */
function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}
exports.formatFileSize = formatFileSize;
/**
 * Format duration for display.
 */
function formatDuration(seconds) {
    if (seconds < 60) {
        return `${seconds.toFixed(1)}s`;
    }
    else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
    }
    else {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }
}
exports.formatDuration = formatDuration;
/**
 * Sanitize filename for safe usage.
 */
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9\-_.]/gi, '_');
}
exports.sanitizeFilename = sanitizeFilename;
/**
 * Show error message with retry option.
 */
async function showErrorWithRetry(message, retryCallback) {
    const actions = retryCallback ? ['Retry'] : [];
    const result = await vscode.window.showErrorMessage(message, ...actions);
    if (result === 'Retry' && retryCallback) {
        await retryCallback();
    }
}
exports.showErrorWithRetry = showErrorWithRetry;
/**
 * Show progress with cancellation support.
 */
async function withProgress(title, task) {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: true
    }, task);
}
exports.withProgress = withProgress;
/**
 * Open file at specific line and column.
 */
async function openFileAtLocation(filePath, line, column = 0) {
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
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to open file: ${error}`);
    }
}
exports.openFileAtLocation = openFileAtLocation;
/**
 * Get file content as string.
 */
async function getFileContent(filePath) {
    try {
        const uri = vscode.Uri.file(filePath);
        const document = await vscode.workspace.openTextDocument(uri);
        return document.getText();
    }
    catch (error) {
        console.error('Failed to read file:', error);
        return undefined;
    }
}
exports.getFileContent = getFileContent;
/**
 * Write content to file.
 */
async function writeFileContent(filePath, content) {
    try {
        const uri = vscode.Uri.file(filePath);
        const encoder = new TextEncoder();
        await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
        return true;
    }
    catch (error) {
        console.error('Failed to write file:', error);
        return false;
    }
}
exports.writeFileContent = writeFileContent;
/**
 * Debounce function execution.
 */
function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}
exports.debounce = debounce;
/**
 * Throttle function execution.
 */
function throttle(func, delay) {
    let lastExecution = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastExecution >= delay) {
            lastExecution = now;
            func(...args);
        }
    };
}
exports.throttle = throttle;
/**
 * Create VS Code command.
 */
function createCommand(command, title, tooltip, args) {
    return {
        command,
        title,
        tooltip,
        arguments: args
    };
}
exports.createCommand = createCommand;
/**
 * Get workspace files matching patterns.
 */
async function getWorkspaceFiles(patterns) {
    const files = [];
    for (const pattern of patterns) {
        const found = await vscode.workspace.findFiles(pattern);
        files.push(...found);
    }
    return files;
}
exports.getWorkspaceFiles = getWorkspaceFiles;
/**
 * Format confidence score for display.
 */
function formatConfidence(score) {
    const percentage = Math.round(score * 100);
    return `${percentage}%`;
}
exports.formatConfidence = formatConfidence;
/**
 * Get confidence color based on score.
 */
function getConfidenceColor(score) {
    if (score >= 0.8)
        return 'notificationsSuccessIcon.foreground';
    if (score >= 0.6)
        return 'notificationsWarningIcon.foreground';
    return 'errorForeground';
}
exports.getConfidenceColor = getConfidenceColor;
/**
 * Validate API URL format.
 */
function isValidApiUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    }
    catch {
        return false;
    }
}
exports.isValidApiUrl = isValidApiUrl;
//# sourceMappingURL=utils.js.map