import * as vscode from 'vscode';
import { RefactorIQProvider } from './provider';
import { RefactorIQService } from './service';
import { AnalysisFinding } from './types';
import { openFileAtLocation } from './utils';

export function activate(context: vscode.ExtensionContext) {
  const service = new RefactorIQService(context);
  const provider = new RefactorIQProvider(service);

  // Load stored authentication tokens
  service.loadTokens();

  // Register commands
  const scanCommand = vscode.commands.registerCommand('refactor-iq.scan', () => {
    provider.scanCurrentFile();
  });

  const scanWorkspaceCommand = vscode.commands.registerCommand('refactor-iq.scanWorkspace', () => {
    provider.scanWorkspace();
  });

  const showProposalsCommand = vscode.commands.registerCommand('refactor-iq.showProposals', () => {
    provider.showProposals();
  });

  const applyProposalCommand = vscode.commands.registerCommand('refactor-iq.applyProposal', (proposalId: string, createPr: boolean = false) => {
    provider.applyProposal(proposalId, createPr);
  });

  const diffCommand = vscode.commands.registerCommand('refactor-iq.diff', (proposalId: string) => {
    provider.showDiff(proposalId);
  });

  const goToFindingCommand = vscode.commands.registerCommand('refactor-iq.goToFinding', (finding: AnalysisFinding) => {
    openFileAtLocation(finding.file_path, finding.line_number, finding.column_number || 0);
  });

  const refreshCommand = vscode.commands.registerCommand('refactor-iq.refresh', () => {
    provider.getProposalsProvider().refresh();
    provider.getFindingsProvider().refresh();
  });

  const signOutCommand = vscode.commands.registerCommand('refactor-iq.signOut', async () => {
    await service.signOut();
    provider.getProposalsProvider().refresh();
    provider.getFindingsProvider().refresh();
    vscode.window.showInformationMessage('Signed out from RefactorIQ');
  });

  // Register tree data providers
  const proposalsTreeProvider = vscode.window.registerTreeDataProvider('refactor-iq-proposals', provider.getProposalsProvider());
  const findingsTreeProvider = vscode.window.registerTreeDataProvider('refactor-iq-findings', provider.getFindingsProvider());

  // Register tree view commands
  const createPrCommand = vscode.commands.registerCommand('refactor-iq.createPr', (proposalId: string) => {
    provider.applyProposal(proposalId, true);
  });

  const applyDirectCommand = vscode.commands.registerCommand('refactor-iq.applyDirect', (proposalId: string) => {
    provider.applyProposal(proposalId, false);
  });

  context.subscriptions.push(
    scanCommand,
    scanWorkspaceCommand,
    showProposalsCommand,
    applyProposalCommand,
    diffCommand,
    goToFindingCommand,
    refreshCommand,
    signOutCommand,
    createPrCommand,
    applyDirectCommand,
    proposalsTreeProvider,
    findingsTreeProvider,
    provider
  );
}

export function deactivate() {}


