/**
 * RefactorIQ data providers and tree view management.
 * 
 * Handles tree data providers for proposals and findings,
 * integrates with commands, and manages UI state.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { RefactorIQService } from './service';
import { RefactorIQCommands } from './commands';
import {
  AnalysisFinding,
  ProposalResponse,
  ProposalTreeItem,
  FindingTreeItem,
  FindingSeverity,
  ProposalStatus
} from './types';
import {
  getSeverityIcon,
  getProposalStatusIcon,
  formatConfidence,
  getConfidenceColor,
  createCommand,
  isSupportedFile
} from './utils';

export class RefactorIQProvider {
  private service: RefactorIQService;
  private commands: RefactorIQCommands;
  private proposalsProvider: ProposalsTreeDataProvider;
  private findingsProvider: FindingsTreeDataProvider;
  private statusBar: vscode.StatusBarItem;

  constructor(service: RefactorIQService) {
    this.service = service;
    this.commands = new RefactorIQCommands(service);
    
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
  private setupEventHandlers(): void {
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
      if (config.get('autoScan') && isSupportedFile(document.fileName)) {
        await this.scanDocument(document);
      }
    });
  }

  /**
   * Update status bar based on authentication and scan state.
   */
  private updateStatusBar(): void {
    if (this.service.isAuthenticated()) {
      this.statusBar.text = '$(lightbulb) RefactorIQ Ready';
      this.statusBar.tooltip = 'RefactorIQ: Ready for analysis';
      this.statusBar.backgroundColor = undefined;
    } else {
      this.statusBar.text = '$(warning) RefactorIQ';
      this.statusBar.tooltip = 'RefactorIQ: Not authenticated';
      this.statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
  }

  /**
   * Scan current file.
   */
  async scanCurrentFile(): Promise<void> {
    await this.commands.scanCurrentFile();
    this.refreshProviders();
  }

  /**
   * Scan workspace.
   */
  async scanWorkspace(): Promise<void> {
    await this.commands.scanWorkspace();
    this.refreshProviders();
  }

  /**
   * Scan specific document.
   */
  async scanDocument(document: vscode.TextDocument): Promise<void> {
    if (!isSupportedFile(document.fileName)) {
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
          vscode.window.showInformationMessage(
            `RefactorIQ found ${result.findings.length} issue(s) in ${path.basename(document.fileName)}`
          );
        }
      }
    } catch (error) {
      console.error('Auto-scan failed:', error);
    }
  }

  /**
   * Show proposals.
   */
  async showProposals(): Promise<void> {
    await this.commands.showProposals();
  }

  /**
   * Apply proposal.
   */
  async applyProposal(proposalId: string, createPr: boolean = false): Promise<void> {
    await this.commands.applyProposal(proposalId, createPr);
    this.refreshProviders();
  }

  /**
   * Show diff for proposal.
   */
  async showDiff(proposalId: string): Promise<void> {
    await this.commands.showDiff(proposalId);
  }

  /**
   * Refresh all data providers.
   */
  private refreshProviders(): void {
    this.proposalsProvider.refresh();
    this.findingsProvider.refresh();
  }

  /**
   * Get proposals tree data provider.
   */
  getProposalsProvider(): ProposalsTreeDataProvider {
    return this.proposalsProvider;
  }

  /**
   * Get findings tree data provider.
   */
  getFindingsProvider(): FindingsTreeDataProvider {
    return this.findingsProvider;
  }

  /**
   * Dispose resources.
   */
  dispose(): void {
    this.commands.dispose();
    this.statusBar.dispose();
  }
}

/**
 * Tree data provider for proposals.
 */
export class ProposalsTreeDataProvider implements vscode.TreeDataProvider<ProposalTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ProposalTreeItem | undefined | null | void> = new vscode.EventEmitter<ProposalTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ProposalTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private proposals: ProposalResponse[] = [];

  constructor(private service: RefactorIQService) {
    this.loadProposals();
  }

  /**
   * Refresh the tree view.
   */
  refresh(): void {
    this.loadProposals();
    this._onDidChangeTreeData.fire();
  }

  /**
   * Load proposals from API.
   */
  private async loadProposals(): Promise<void> {
    if (!this.service.isAuthenticated()) {
      this.proposals = [];
      return;
    }

    try {
      this.proposals = await this.service.getProposals();
    } catch (error) {
      console.error('Failed to load proposals:', error);
      this.proposals = [];
    }
  }

  /**
   * Get tree item for element.
   */
  getTreeItem(element: ProposalTreeItem): vscode.TreeItem {
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
  getChildren(element?: ProposalTreeItem): Thenable<ProposalTreeItem[]> {
    if (!this.service.isAuthenticated()) {
      return Promise.resolve([{
        id: 'not-authenticated',
        label: 'Not authenticated',
        description: 'Click to authenticate',
        tooltip: 'Authenticate with RefactorIQ to view proposals',
        command: createCommand('refactor-iq.scan', 'Authenticate'),
        iconPath: new vscode.ThemeIcon('account'),
        contextValue: 'auth',
        proposal: {} as ProposalResponse,
        severity: FindingSeverity.LOW
      }]);
    }

    if (this.proposals.length === 0) {
      return Promise.resolve([{
        id: 'no-proposals',
        label: 'No proposals available',
        description: 'Run a scan to generate proposals',
        tooltip: 'Scan your code to find improvement opportunities',
        command: createCommand('refactor-iq.scan', 'Scan Current File'),
        iconPath: new vscode.ThemeIcon('search'),
        contextValue: 'empty',
        proposal: {} as ProposalResponse,
        severity: FindingSeverity.LOW
      }]);
    }

    if (!element) {
      // Root level - show proposal groups by status
      const grouped = this.groupProposalsByStatus();
      const items: ProposalTreeItem[] = [];

      for (const [status, proposals] of grouped) {
        if (proposals.length > 0) {
          items.push({
            id: `status-${status}`,
            label: this.getStatusLabel(status),
            description: `${proposals.length} proposal(s)`,
            tooltip: `${proposals.length} proposals with status: ${status}`,
            collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
            contextValue: 'status-group',
            iconPath: getProposalStatusIcon(status),
            proposal: {} as ProposalResponse,
            severity: FindingSeverity.LOW
          });
        }
      }

      return Promise.resolve(items);
    }

    // Show proposals under status group
    if (element.contextValue === 'status-group') {
      const status = element.id.replace('status-', '') as ProposalStatus;
      const statusProposals = this.proposals.filter(p => p.status === status);
      
      return Promise.resolve(statusProposals.map(proposal => ({
        id: `proposal-${proposal.id}`,
        label: proposal.title,
        description: formatConfidence(proposal.confidence_score),
        tooltip: `${proposal.description}\nConfidence: ${formatConfidence(proposal.confidence_score)}\nType: ${proposal.proposal_type}`,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        contextValue: 'proposal',
        command: createCommand('refactor-iq.diff', 'Show Diff', undefined, [proposal.id.toString()]),
        iconPath: new vscode.ThemeIcon('lightbulb', new vscode.ThemeColor(getConfidenceColor(proposal.confidence_score))),
        proposal,
        severity: this.getProposalSeverity(proposal)
      })));
    }

    return Promise.resolve([]);
  }

  /**
   * Group proposals by status.
   */
  private groupProposalsByStatus(): Map<ProposalStatus, ProposalResponse[]> {
    const grouped = new Map<ProposalStatus, ProposalResponse[]>();
    
    for (const proposal of this.proposals) {
      if (!grouped.has(proposal.status)) {
        grouped.set(proposal.status, []);
      }
      grouped.get(proposal.status)!.push(proposal);
    }

    return grouped;
  }

  /**
   * Get display label for status.
   */
  private getStatusLabel(status: ProposalStatus): string {
    switch (status) {
      case ProposalStatus.PENDING:
        return 'Pending Review';
      case ProposalStatus.VALIDATING:
        return 'Validating';
      case ProposalStatus.APPLYING:
        return 'Applying';
      case ProposalStatus.APPLIED:
        return 'Applied';
      case ProposalStatus.PR_CREATED:
        return 'Pull Requests';
      case ProposalStatus.REJECTED:
        return 'Rejected';
      case ProposalStatus.FAILED:
        return 'Failed';
      default:
        return status;
    }
  }

  /**
   * Get severity for proposal based on type and confidence.
   */
  private getProposalSeverity(proposal: ProposalResponse): FindingSeverity {
    if (proposal.confidence_score >= 0.8) {
      return FindingSeverity.HIGH;
    } else if (proposal.confidence_score >= 0.6) {
      return FindingSeverity.MEDIUM;
    } else {
      return FindingSeverity.LOW;
    }
  }
}

/**
 * Tree data provider for findings.
 */
export class FindingsTreeDataProvider implements vscode.TreeDataProvider<FindingTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<FindingTreeItem | undefined | null | void> = new vscode.EventEmitter<FindingTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<FindingTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private findings: AnalysisFinding[] = [];

  constructor(private service: RefactorIQService) {
    // Findings are typically loaded after scan operations
  }

  /**
   * Refresh the tree view.
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Update findings data.
   */
  updateFindings(findings: AnalysisFinding[]): void {
    this.findings = findings;
    this.refresh();
  }

  /**
   * Get tree item for element.
   */
  getTreeItem(element: FindingTreeItem): vscode.TreeItem {
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
  getChildren(element?: FindingTreeItem): Thenable<FindingTreeItem[]> {
    if (!this.service.isAuthenticated()) {
      return Promise.resolve([{
        id: 'not-authenticated',
        label: 'Not authenticated',
        description: 'Click to authenticate',
        tooltip: 'Authenticate with RefactorIQ to view findings',
        command: createCommand('refactor-iq.scan', 'Authenticate'),
        iconPath: new vscode.ThemeIcon('account'),
        contextValue: 'auth',
        finding: {} as AnalysisFinding,
        severity: FindingSeverity.LOW
      }]);
    }

    if (this.findings.length === 0) {
      return Promise.resolve([{
        id: 'no-findings',
        label: 'No findings',
        description: 'Run a scan to find issues',
        tooltip: 'Scan your code to identify issues and improvements',
        command: createCommand('refactor-iq.scan', 'Scan Current File'),
        iconPath: new vscode.ThemeIcon('search'),
        contextValue: 'empty',
        finding: {} as AnalysisFinding,
        severity: FindingSeverity.LOW
      }]);
    }

    if (!element) {
      // Root level - show findings grouped by severity
      const grouped = this.groupFindingsBySeverity();
      const items: FindingTreeItem[] = [];

      for (const [severity, findings] of grouped) {
        if (findings.length > 0) {
          items.push({
            id: `severity-${severity}`,
            label: this.getSeverityLabel(severity),
            description: `${findings.length} finding(s)`,
            tooltip: `${findings.length} findings with ${severity} severity`,
            collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
            contextValue: 'severity-group',
            iconPath: getSeverityIcon(severity),
            finding: {} as AnalysisFinding,
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
        command: createCommand('refactor-iq.goToFinding', 'Go to Finding', undefined, [finding]),
        iconPath: getSeverityIcon(finding.severity),
        finding,
        severity: finding.severity
      })));
    }

    return Promise.resolve([]);
  }

  /**
   * Group findings by severity.
   */
  private groupFindingsBySeverity(): Map<FindingSeverity, AnalysisFinding[]> {
    const grouped = new Map<FindingSeverity, AnalysisFinding[]>();
    
    // Initialize with all severity levels to maintain consistent order
    grouped.set(FindingSeverity.CRITICAL, []);
    grouped.set(FindingSeverity.HIGH, []);
    grouped.set(FindingSeverity.MEDIUM, []);
    grouped.set(FindingSeverity.LOW, []);

    for (const finding of this.findings) {
      grouped.get(finding.severity)!.push(finding);
    }

    return grouped;
  }

  /**
   * Get display label for severity.
   */
  private getSeverityLabel(severity: FindingSeverity): string {
    switch (severity) {
      case FindingSeverity.CRITICAL:
        return 'Critical Issues';
      case FindingSeverity.HIGH:
        return 'High Priority';
      case FindingSeverity.MEDIUM:
        return 'Medium Priority';
      case FindingSeverity.LOW:
        return 'Low Priority';
      default:
        return severity;
    }
  }
}