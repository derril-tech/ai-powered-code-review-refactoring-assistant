"use strict";
/**
 * RefactorIQ data providers and tree view management.
 *
 * Handles tree data providers for proposals and findings,
 * integrates with commands, and manages UI state.
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
exports.FindingsTreeDataProvider = exports.ProposalsTreeDataProvider = exports.RefactorIQProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const commands_1 = require("./commands");
const types_1 = require("./types");
const utils_1 = require("./utils");
class RefactorIQProvider {
    constructor(service) {
        this.service = service;
        this.commands = new commands_1.RefactorIQCommands(service);
        this.proposalsProvider = new ProposalsTreeDataProvider(service);
        this.findingsProvider = new FindingsTreeDataProvider(service);
        // Create status bar item
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBar.text = '$(lightbulb) RefactorIQ';
        this.statusBar.tooltip = 'RefactorIQ Code Analysis';
        this.statusBar.command = 'refactor-iq.scan';
        this.statusBar.show();
        // Setup auto-refresh on authentication changes
        this.setupEventHandlers();
    }
    /**
     * Set up event handlers for the extension.
     */
    setupEventHandlers() {
        // Refresh providers when authentication state changes
        const refreshProviders = () => {
            this.proposalsProvider.refresh();
            this.findingsProvider.refresh();
            this.updateStatusBar();
        };
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('refactorIq')) {
                this.service.updateConfig();
                refreshProviders();
            }
        });
        // Auto-scan on file save if enabled
        vscode.workspace.onDidSaveTextDocument(async (document) => {
            const config = vscode.workspace.getConfiguration('refactorIq');
            if (config.get('autoScan') && (0, utils_1.isSupportedFile)(document.fileName)) {
                await this.scanDocument(document);
            }
        });
    }
    /**
     * Update status bar based on authentication and scan state.
     */
    updateStatusBar() {
        if (this.service.isAuthenticated()) {
            this.statusBar.text = '$(lightbulb) RefactorIQ Ready';
            this.statusBar.tooltip = 'RefactorIQ: Ready for analysis';
            this.statusBar.backgroundColor = undefined;
        }
        else {
            this.statusBar.text = '$(warning) RefactorIQ';
            this.statusBar.tooltip = 'RefactorIQ: Not authenticated';
            this.statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
    }
    /**
     * Scan current file.
     */
    async scanCurrentFile() {
        await this.commands.scanCurrentFile();
        this.refreshProviders();
    }
    /**
     * Scan workspace.
     */
    async scanWorkspace() {
        await this.commands.scanWorkspace();
        this.refreshProviders();
    }
    /**
     * Scan specific document.
     */
    async scanDocument(document) {
        if (!(0, utils_1.isSupportedFile)(document.fileName)) {
            return;
        }
        try {
            const content = document.getText();
            const language = document.languageId;
            const relativePath = vscode.workspace.asRelativePath(document.fileName);
            const result = await this.service.scanFile(relativePath, content, language);
            if (result.success) {
                this.refreshProviders();
                const config = vscode.workspace.getConfiguration('refactorIq');
                if (config.get('showNotifications') && result.findings && result.findings.length > 0) {
                    vscode.window.showInformationMessage(`RefactorIQ found ${result.findings.length} issue(s) in ${path.basename(document.fileName)}`);
                }
            }
        }
        catch (error) {
            console.error('Auto-scan failed:', error);
        }
    }
    /**
     * Show proposals.
     */
    async showProposals() {
        await this.commands.showProposals();
    }
    /**
     * Apply proposal.
     */
    async applyProposal(proposalId, createPr = false) {
        await this.commands.applyProposal(proposalId, createPr);
        this.refreshProviders();
    }
    /**
     * Show diff for proposal.
     */
    async showDiff(proposalId) {
        await this.commands.showDiff(proposalId);
    }
    /**
     * Refresh all data providers.
     */
    refreshProviders() {
        this.proposalsProvider.refresh();
        this.findingsProvider.refresh();
    }
    /**
     * Get proposals tree data provider.
     */
    getProposalsProvider() {
        return this.proposalsProvider;
    }
    /**
     * Get findings tree data provider.
     */
    getFindingsProvider() {
        return this.findingsProvider;
    }
    /**
     * Dispose resources.
     */
    dispose() {
        this.commands.dispose();
        this.statusBar.dispose();
    }
}
exports.RefactorIQProvider = RefactorIQProvider;
/**
 * Tree data provider for proposals.
 */
class ProposalsTreeDataProvider {
    constructor(service) {
        this.service = service;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.proposals = [];
        this.loadProposals();
    }
    /**
     * Refresh the tree view.
     */
    refresh() {
        this.loadProposals();
        this._onDidChangeTreeData.fire();
    }
    /**
     * Load proposals from API.
     */
    async loadProposals() {
        if (!this.service.isAuthenticated()) {
            this.proposals = [];
            return;
        }
        try {
            this.proposals = await this.service.getProposals();
        }
        catch (error) {
            console.error('Failed to load proposals:', error);
            this.proposals = [];
        }
    }
    /**
     * Get tree item for element.
     */
    getTreeItem(element) {
        return {
            id: element.id,
            label: element.label,
            description: element.description,
            tooltip: element.tooltip,
            collapsibleState: element.collapsibleState,
            contextValue: element.contextValue,
            command: element.command,
            iconPath: element.iconPath
        };
    }
    /**
     * Get children for tree element.
     */
    getChildren(element) {
        if (!this.service.isAuthenticated()) {
            return Promise.resolve([{
                    id: 'not-authenticated',
                    label: 'Not authenticated',
                    description: 'Click to authenticate',
                    tooltip: 'Authenticate with RefactorIQ to view proposals',
                    command: (0, utils_1.createCommand)('refactor-iq.scan', 'Authenticate'),
                    iconPath: new vscode.ThemeIcon('account'),
                    contextValue: 'auth',
                    proposal: {},
                    severity: types_1.FindingSeverity.LOW
                }]);
        }
        if (this.proposals.length === 0) {
            return Promise.resolve([{
                    id: 'no-proposals',
                    label: 'No proposals available',
                    description: 'Run a scan to generate proposals',
                    tooltip: 'Scan your code to find improvement opportunities',
                    command: (0, utils_1.createCommand)('refactor-iq.scan', 'Scan Current File'),
                    iconPath: new vscode.ThemeIcon('search'),
                    contextValue: 'empty',
                    proposal: {},
                    severity: types_1.FindingSeverity.LOW
                }]);
        }
        if (!element) {
            // Root level - show proposal groups by status
            const grouped = this.groupProposalsByStatus();
            const items = [];
            for (const [status, proposals] of grouped) {
                if (proposals.length > 0) {
                    items.push({
                        id: `status-${status}`,
                        label: this.getStatusLabel(status),
                        description: `${proposals.length} proposal(s)`,
                        tooltip: `${proposals.length} proposals with status: ${status}`,
                        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                        contextValue: 'status-group',
                        iconPath: (0, utils_1.getProposalStatusIcon)(status),
                        proposal: {},
                        severity: types_1.FindingSeverity.LOW
                    });
                }
            }
            return Promise.resolve(items);
        }
        // Show proposals under status group
        if (element.contextValue === 'status-group') {
            const status = element.id.replace('status-', '');
            const statusProposals = this.proposals.filter(p => p.status === status);
            return Promise.resolve(statusProposals.map(proposal => ({
                id: `proposal-${proposal.id}`,
                label: proposal.title,
                description: (0, utils_1.formatConfidence)(proposal.confidence_score),
                tooltip: `${proposal.description}\nConfidence: ${(0, utils_1.formatConfidence)(proposal.confidence_score)}\nType: ${proposal.proposal_type}`,
                collapsibleState: vscode.TreeItemCollapsibleState.None,
                contextValue: 'proposal',
                command: (0, utils_1.createCommand)('refactor-iq.diff', 'Show Diff', undefined, [proposal.id.toString()]),
                iconPath: new vscode.ThemeIcon('lightbulb', new vscode.ThemeColor((0, utils_1.getConfidenceColor)(proposal.confidence_score))),
                proposal,
                severity: this.getProposalSeverity(proposal)
            })));
        }
        return Promise.resolve([]);
    }
    /**
     * Group proposals by status.
     */
    groupProposalsByStatus() {
        const grouped = new Map();
        for (const proposal of this.proposals) {
            if (!grouped.has(proposal.status)) {
                grouped.set(proposal.status, []);
            }
            grouped.get(proposal.status).push(proposal);
        }
        return grouped;
    }
    /**
     * Get display label for status.
     */
    getStatusLabel(status) {
        switch (status) {
            case types_1.ProposalStatus.PENDING:
                return 'Pending Review';
            case types_1.ProposalStatus.VALIDATING:
                return 'Validating';
            case types_1.ProposalStatus.APPLYING:
                return 'Applying';
            case types_1.ProposalStatus.APPLIED:
                return 'Applied';
            case types_1.ProposalStatus.PR_CREATED:
                return 'Pull Requests';
            case types_1.ProposalStatus.REJECTED:
                return 'Rejected';
            case types_1.ProposalStatus.FAILED:
                return 'Failed';
            default:
                return status;
        }
    }
    /**
     * Get severity for proposal based on type and confidence.
     */
    getProposalSeverity(proposal) {
        if (proposal.confidence_score >= 0.8) {
            return types_1.FindingSeverity.HIGH;
        }
        else if (proposal.confidence_score >= 0.6) {
            return types_1.FindingSeverity.MEDIUM;
        }
        else {
            return types_1.FindingSeverity.LOW;
        }
    }
}
exports.ProposalsTreeDataProvider = ProposalsTreeDataProvider;
/**
 * Tree data provider for findings.
 */
class FindingsTreeDataProvider {
    constructor(service) {
        this.service = service;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.findings = [];
        // Findings are typically loaded after scan operations
    }
    /**
     * Refresh the tree view.
     */
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    /**
     * Update findings data.
     */
    updateFindings(findings) {
        this.findings = findings;
        this.refresh();
    }
    /**
     * Get tree item for element.
     */
    getTreeItem(element) {
        return {
            id: element.id,
            label: element.label,
            description: element.description,
            tooltip: element.tooltip,
            collapsibleState: element.collapsibleState,
            contextValue: element.contextValue,
            command: element.command,
            iconPath: element.iconPath
        };
    }
    /**
     * Get children for tree element.
     */
    getChildren(element) {
        if (!this.service.isAuthenticated()) {
            return Promise.resolve([{
                    id: 'not-authenticated',
                    label: 'Not authenticated',
                    description: 'Click to authenticate',
                    tooltip: 'Authenticate with RefactorIQ to view findings',
                    command: (0, utils_1.createCommand)('refactor-iq.scan', 'Authenticate'),
                    iconPath: new vscode.ThemeIcon('account'),
                    contextValue: 'auth',
                    finding: {},
                    severity: types_1.FindingSeverity.LOW
                }]);
        }
        if (this.findings.length === 0) {
            return Promise.resolve([{
                    id: 'no-findings',
                    label: 'No findings',
                    description: 'Run a scan to find issues',
                    tooltip: 'Scan your code to identify issues and improvements',
                    command: (0, utils_1.createCommand)('refactor-iq.scan', 'Scan Current File'),
                    iconPath: new vscode.ThemeIcon('search'),
                    contextValue: 'empty',
                    finding: {},
                    severity: types_1.FindingSeverity.LOW
                }]);
        }
        if (!element) {
            // Root level - show findings grouped by severity
            const grouped = this.groupFindingsBySeverity();
            const items = [];
            for (const [severity, findings] of grouped) {
                if (findings.length > 0) {
                    items.push({
                        id: `severity-${severity}`,
                        label: this.getSeverityLabel(severity),
                        description: `${findings.length} finding(s)`,
                        tooltip: `${findings.length} findings with ${severity} severity`,
                        collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                        contextValue: 'severity-group',
                        iconPath: (0, utils_1.getSeverityIcon)(severity),
                        finding: {},
                        severity
                    });
                }
            }
            return Promise.resolve(items);
        }
        // Show findings under severity group
        if (element.contextValue === 'severity-group') {
            const severity = element.severity;
            const severityFindings = this.findings.filter(f => f.severity === severity);
            return Promise.resolve(severityFindings.map(finding => ({
                id: `finding-${finding.id}`,
                label: finding.title,
                description: `${finding.file_path}:${finding.line_number}`,
                tooltip: `${finding.description}\nFile: ${finding.file_path}\nLine: ${finding.line_number}${finding.is_auto_fixable ? '\n✨ Auto-fixable' : ''}`,
                collapsibleState: vscode.TreeItemCollapsibleState.None,
                contextValue: finding.is_auto_fixable ? 'finding-fixable' : 'finding',
                command: (0, utils_1.createCommand)('refactor-iq.goToFinding', 'Go to Finding', undefined, [finding]),
                iconPath: (0, utils_1.getSeverityIcon)(finding.severity),
                finding,
                severity: finding.severity
            })));
        }
        return Promise.resolve([]);
    }
    /**
     * Group findings by severity.
     */
    groupFindingsBySeverity() {
        const grouped = new Map();
        // Initialize with all severity levels to maintain consistent order
        grouped.set(types_1.FindingSeverity.CRITICAL, []);
        grouped.set(types_1.FindingSeverity.HIGH, []);
        grouped.set(types_1.FindingSeverity.MEDIUM, []);
        grouped.set(types_1.FindingSeverity.LOW, []);
        for (const finding of this.findings) {
            grouped.get(finding.severity).push(finding);
        }
        return grouped;
    }
    /**
     * Get display label for severity.
     */
    getSeverityLabel(severity) {
        switch (severity) {
            case types_1.FindingSeverity.CRITICAL:
                return 'Critical Issues';
            case types_1.FindingSeverity.HIGH:
                return 'High Priority';
            case types_1.FindingSeverity.MEDIUM:
                return 'Medium Priority';
            case types_1.FindingSeverity.LOW:
                return 'Low Priority';
            default:
                return severity;
        }
    }
}
exports.FindingsTreeDataProvider = FindingsTreeDataProvider;
//# sourceMappingURL=provider.js.map