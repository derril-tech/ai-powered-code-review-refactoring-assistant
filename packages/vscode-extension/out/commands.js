"use strict";
/**
 * Command implementations for RefactorIQ VS Code extension.
 *
 * Implements all extension commands including scanning, applying proposals,
 * and showing diffs.
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
exports.RefactorIQCommands = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
class RefactorIQCommands {
    constructor(service) {
        this.service = service;
        this.outputChannel = vscode.window.createOutputChannel('RefactorIQ');
    }
    /**
     * Scan the currently active file.
     */
    async scanCurrentFile() {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active file to scan');
                return;
            }
            const document = editor.document;
            const filePath = document.fileName;
            if (!(0, utils_1.isSupportedFile)(filePath)) {
                const supportedExts = (0, utils_1.getSupportedExtensions)().join(', ');
                vscode.window.showWarningMessage(`File type not supported. Supported extensions: ${supportedExts}`);
                return;
            }
            // Check authentication
            if (!this.service.isAuthenticated()) {
                await this.promptAuthentication();
                return;
            }
            await (0, utils_1.withProgress)('Scanning current file...', async (progress, token) => {
                try {
                    progress.report({ message: 'Reading file content...' });
                    const content = document.getText();
                    const language = (0, utils_1.getLanguageFromExtension)(filePath);
                    const relativePath = (0, utils_1.getRelativePath)(filePath);
                    progress.report({ message: 'Sending to RefactorIQ API...', increment: 30 });
                    const result = await this.service.scanFile(relativePath, content, language);
                    if (token.isCancellationRequested) {
                        return;
                    }
                    progress.report({ message: 'Processing results...', increment: 70 });
                    if (result.success && result.findings) {
                        this.outputChannel.appendLine(`Scan completed for ${relativePath}`);
                        this.outputChannel.appendLine(`Found ${result.findings.length} issues`);
                        if (result.findings.length > 0) {
                            await this.showScanResults(result.findings);
                        }
                        else {
                            vscode.window.showInformationMessage('No issues found in current file! 🎉');
                        }
                    }
                    else {
                        throw new Error(result.error || 'Scan failed');
                    }
                }
                catch (error) {
                    throw error;
                }
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Scan failed';
            this.outputChannel.appendLine(`Scan error: ${message}`);
            await (0, utils_1.showErrorWithRetry)(`Scan failed: ${message}`, () => this.scanCurrentFile());
        }
    }
    /**
     * Scan the entire workspace.
     */
    async scanWorkspace() {
        try {
            const workspaceRoot = (0, utils_1.getWorkspaceRoot)();
            if (!workspaceRoot) {
                vscode.window.showWarningMessage('No workspace folder is open');
                return;
            }
            // Check authentication
            if (!this.service.isAuthenticated()) {
                await this.promptAuthentication();
                return;
            }
            await (0, utils_1.withProgress)('Scanning workspace...', async (progress, token) => {
                try {
                    progress.report({ message: 'Finding files to scan...' });
                    // Get all supported files in workspace
                    const patterns = (0, utils_1.getSupportedExtensions)().map(ext => `**/*${ext}`);
                    const fileUris = await (0, utils_1.getWorkspaceFiles)(patterns);
                    if (fileUris.length === 0) {
                        vscode.window.showInformationMessage('No supported files found in workspace');
                        return;
                    }
                    progress.report({
                        message: `Reading ${fileUris.length} files...`,
                        increment: 20
                    });
                    // Read file contents
                    const files = [];
                    for (const uri of fileUris.slice(0, 50)) { // Limit to 50 files for now
                        if (token.isCancellationRequested) {
                            return;
                        }
                        const content = await (0, utils_1.getFileContent)(uri.fsPath);
                        if (content) {
                            files.push({
                                path: (0, utils_1.getRelativePath)(uri.fsPath),
                                content,
                                language: (0, utils_1.getLanguageFromExtension)(uri.fsPath)
                            });
                        }
                    }
                    progress.report({
                        message: 'Sending to RefactorIQ API...',
                        increment: 50
                    });
                    const result = await this.service.scanWorkspace(files);
                    if (token.isCancellationRequested) {
                        return;
                    }
                    progress.report({ message: 'Processing results...', increment: 80 });
                    if (result.success && result.findings) {
                        this.outputChannel.appendLine(`Workspace scan completed`);
                        this.outputChannel.appendLine(`Scanned ${files.length} files`);
                        this.outputChannel.appendLine(`Found ${result.findings.length} issues`);
                        if (result.findings.length > 0) {
                            await this.showScanResults(result.findings);
                        }
                        else {
                            vscode.window.showInformationMessage(`Workspace scan complete! No issues found in ${files.length} files 🎉`);
                        }
                    }
                    else {
                        throw new Error(result.error || 'Workspace scan failed');
                    }
                }
                catch (error) {
                    throw error;
                }
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Workspace scan failed';
            this.outputChannel.appendLine(`Workspace scan error: ${message}`);
            await (0, utils_1.showErrorWithRetry)(`Workspace scan failed: ${message}`, () => this.scanWorkspace());
        }
    }
    /**
     * Show available proposals.
     */
    async showProposals() {
        try {
            if (!this.service.isAuthenticated()) {
                await this.promptAuthentication();
                return;
            }
            const proposals = await this.service.getProposals();
            if (proposals.length === 0) {
                vscode.window.showInformationMessage('No proposals available. Run a scan first.');
                return;
            }
            // Show proposals in quick pick
            const items = proposals.map(proposal => ({
                label: `$(lightbulb) ${proposal.title}`,
                description: `Confidence: ${Math.round(proposal.confidence_score * 100)}%`,
                detail: proposal.description,
                proposal
            }));
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select a proposal to view or apply',
                matchOnDescription: true,
                matchOnDetail: true
            });
            if (selected) {
                await this.showProposalActions(selected.proposal);
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to show proposals';
            await (0, utils_1.showErrorWithRetry)(`Failed to show proposals: ${message}`);
        }
    }
    /**
     * Apply a specific proposal.
     */
    async applyProposal(proposalId, createPr = false) {
        try {
            if (!this.service.isAuthenticated()) {
                await this.promptAuthentication();
                return;
            }
            const proposal = await this.getProposalById(parseInt(proposalId));
            if (!proposal) {
                vscode.window.showErrorMessage('Proposal not found');
                return;
            }
            // Show confirmation dialog
            const action = createPr ? 'create a pull request' : 'apply directly';
            const confirm = await vscode.window.showWarningMessage(`Are you sure you want to ${action} for "${proposal.title}"?`, { modal: true }, 'Yes', 'Preview First');
            if (confirm === 'Preview First') {
                await this.showDiff(proposalId);
                return;
            }
            if (confirm !== 'Yes') {
                return;
            }
            await (0, utils_1.withProgress)(`Applying proposal...`, async (progress) => {
                progress.report({ message: 'Validating proposal...' });
                const request = {
                    proposal_id: parseInt(proposalId),
                    auto_apply: !createPr,
                    create_pr: createPr
                };
                progress.report({ message: 'Applying changes...', increment: 50 });
                const result = await this.service.applyProposal(request);
                if (result.success) {
                    this.outputChannel.appendLine(`Proposal ${proposalId} applied successfully`);
                    if (result.pr_url) {
                        const openPr = await vscode.window.showInformationMessage(`Pull request created successfully!`, 'Open PR');
                        if (openPr === 'Open PR') {
                            vscode.env.openExternal(vscode.Uri.parse(result.pr_url));
                        }
                    }
                    else {
                        vscode.window.showInformationMessage('Proposal applied successfully! 🎉');
                    }
                }
                else {
                    throw new Error(result.message);
                }
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to apply proposal';
            this.outputChannel.appendLine(`Apply error: ${message}`);
            vscode.window.showErrorMessage(`Failed to apply proposal: ${message}`);
        }
    }
    /**
     * Show diff for a proposal.
     */
    async showDiff(proposalId) {
        try {
            if (!this.service.isAuthenticated()) {
                await this.promptAuthentication();
                return;
            }
            const preview = await this.service.getProposalPreview(parseInt(proposalId));
            if (!preview) {
                vscode.window.showErrorMessage('Failed to get proposal preview');
                return;
            }
            // Create diff document
            const diffContent = this.formatDiffContent(preview);
            const doc = await vscode.workspace.openTextDocument({
                content: diffContent,
                language: 'diff'
            });
            await vscode.window.showTextDocument(doc, {
                preview: true,
                viewColumn: vscode.ViewColumn.Beside
            });
            // Show proposal info
            vscode.window.showInformationMessage(`Proposal: ${preview.summary.files_changed} files, +${preview.summary.additions} -${preview.summary.deletions} lines (Confidence: ${Math.round(preview.confidence_score * 100)}%)`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to show diff';
            vscode.window.showErrorMessage(`Failed to show diff: ${message}`);
        }
    }
    /**
     * Prompt user for authentication.
     */
    async promptAuthentication() {
        const authMethod = await vscode.window.showQuickPick([
            { label: 'API Key', description: 'Use API key for authentication' },
            { label: 'Email/Password', description: 'Use email and password' }
        ], {
            placeHolder: 'Select authentication method'
        });
        if (!authMethod) {
            return;
        }
        if (authMethod.label === 'API Key') {
            const apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your RefactorIQ API key',
                password: true,
                placeHolder: 'API key'
            });
            if (apiKey) {
                const result = await this.service.authenticateWithApiKey(apiKey);
                if (result.success) {
                    vscode.window.showInformationMessage('Authentication successful!');
                }
                else {
                    vscode.window.showErrorMessage(`Authentication failed: ${result.error}`);
                }
            }
        }
        else {
            const email = await vscode.window.showInputBox({
                prompt: 'Enter your email',
                placeHolder: 'email@example.com'
            });
            if (!email)
                return;
            const password = await vscode.window.showInputBox({
                prompt: 'Enter your password',
                password: true,
                placeHolder: 'Password'
            });
            if (!password)
                return;
            const result = await this.service.authenticate(email, password);
            if (result.success) {
                vscode.window.showInformationMessage('Authentication successful!');
            }
            else {
                vscode.window.showErrorMessage(`Authentication failed: ${result.error}`);
            }
        }
    }
    /**
     * Show scan results in various formats.
     */
    async showScanResults(findings) {
        const action = await vscode.window.showInformationMessage(`Found ${findings.length} issues`, 'View in Problems', 'Show Details');
        if (action === 'View in Problems') {
            // Add findings to VS Code problems panel
            this.addFindingsToProblems(findings);
        }
        else if (action === 'Show Details') {
            // Show detailed findings view
            await this.showFindingsQuickPick(findings);
        }
    }
    /**
     * Add findings to VS Code problems panel.
     */
    addFindingsToProblems(findings) {
        const diagnosticCollection = vscode.languages.createDiagnosticCollection('refactor-iq');
        const diagnosticMap = new Map();
        for (const finding of findings) {
            const workspaceRoot = (0, utils_1.getWorkspaceRoot)();
            const fullPath = workspaceRoot ? path.join(workspaceRoot, finding.file_path) : finding.file_path;
            const diagnostic = new vscode.Diagnostic(new vscode.Range(Math.max(0, finding.line_number - 1), finding.column_number || 0, Math.max(0, finding.line_number - 1), (finding.column_number || 0) + 10), `${finding.title}: ${finding.description}`, this.getSeverityDiagnostic(finding.severity));
            diagnostic.source = 'RefactorIQ';
            diagnostic.code = finding.rule_id || finding.finding_type;
            if (!diagnosticMap.has(fullPath)) {
                diagnosticMap.set(fullPath, []);
            }
            diagnosticMap.get(fullPath).push(diagnostic);
        }
        // Set diagnostics for all files
        for (const [filePath, diagnostics] of diagnosticMap) {
            diagnosticCollection.set(vscode.Uri.file(filePath), diagnostics);
        }
    }
    /**
     * Show findings in quick pick format.
     */
    async showFindingsQuickPick(findings) {
        const items = findings.map(finding => ({
            label: `$(${this.getSeverityIcon(finding.severity)}) ${finding.title}`,
            description: `${finding.file_path}:${finding.line_number}`,
            detail: finding.description,
            finding
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a finding to view details',
            matchOnDescription: true,
            matchOnDetail: true
        });
        if (selected) {
            await this.showFindingDetails(selected.finding);
        }
    }
    /**
     * Show detailed finding information.
     */
    async showFindingDetails(finding) {
        const actions = ['Go to Location'];
        if (finding.is_auto_fixable) {
            actions.unshift('Apply Auto-fix');
        }
        const action = await vscode.window.showInformationMessage(`${finding.title}\n\n${finding.description}`, ...actions);
        if (action === 'Go to Location') {
            await (0, utils_1.openFileAtLocation)(finding.file_path, finding.line_number, finding.column_number || 0);
        }
        else if (action === 'Apply Auto-fix') {
            // Get proposals for this finding and apply
            await this.applyAutoFix(finding);
        }
    }
    /**
     * Apply auto-fix for a finding.
     */
    async applyAutoFix(finding) {
        try {
            const proposals = await this.service.getProposals();
            const findingProposals = proposals.filter(p => p.finding_id === finding.id);
            if (findingProposals.length === 0) {
                vscode.window.showWarningMessage('No auto-fix proposals available for this finding');
                return;
            }
            const proposal = findingProposals[0]; // Use the first/best proposal
            await this.applyProposal(proposal.id.toString());
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to apply auto-fix');
        }
    }
    /**
     * Show proposal action menu.
     */
    async showProposalActions(proposal) {
        const actions = [
            'Show Diff',
            'Apply Directly',
            'Create Pull Request',
            'Reject'
        ];
        const action = await vscode.window.showQuickPick(actions, {
            placeHolder: `What would you like to do with "${proposal.title}"?`
        });
        switch (action) {
            case 'Show Diff':
                await this.showDiff(proposal.id.toString());
                break;
            case 'Apply Directly':
                await this.applyProposal(proposal.id.toString(), false);
                break;
            case 'Create Pull Request':
                await this.applyProposal(proposal.id.toString(), true);
                break;
            case 'Reject':
                await this.rejectProposal(proposal.id);
                break;
        }
    }
    /**
     * Reject a proposal.
     */
    async rejectProposal(proposalId) {
        const confirm = await vscode.window.showWarningMessage('Are you sure you want to reject this proposal?', 'Yes', 'No');
        if (confirm === 'Yes') {
            const result = await this.service.rejectProposal(proposalId);
            if (result.success) {
                vscode.window.showInformationMessage('Proposal rejected');
            }
            else {
                vscode.window.showErrorMessage(`Failed to reject proposal: ${result.error}`);
            }
        }
    }
    /**
     * Get proposal by ID.
     */
    async getProposalById(proposalId) {
        const proposals = await this.service.getProposals();
        return proposals.find(p => p.id === proposalId) || null;
    }
    /**
     * Format diff content for display.
     */
    formatDiffContent(preview) {
        let content = `RefactorIQ Proposal Preview\n`;
        content += `==============================\n\n`;
        content += `Confidence: ${Math.round(preview.confidence_score * 100)}%\n`;
        content += `Impact: ${preview.estimated_impact || 'Unknown'}\n`;
        content += `Files Changed: ${preview.summary.files_changed}\n`;
        content += `Lines: +${preview.summary.additions} -${preview.summary.deletions}\n\n`;
        if (preview.files && preview.files.length > 0) {
            for (const file of preview.files) {
                content += `--- a/${file.old_path}\n`;
                content += `+++ b/${file.new_path}\n`;
                for (const chunk of file.chunks) {
                    content += `${chunk.header}\n`;
                    for (const line of chunk.lines) {
                        const prefix = line.type === 'addition' ? '+' :
                            line.type === 'deletion' ? '-' : ' ';
                        content += `${prefix}${line.content}\n`;
                    }
                }
                content += '\n';
            }
        }
        return content;
    }
    /**
     * Get VS Code diagnostic severity from finding severity.
     */
    getSeverityDiagnostic(severity) {
        switch (severity.toLowerCase()) {
            case 'critical':
            case 'high':
                return vscode.DiagnosticSeverity.Error;
            case 'medium':
                return vscode.DiagnosticSeverity.Warning;
            case 'low':
                return vscode.DiagnosticSeverity.Information;
            default:
                return vscode.DiagnosticSeverity.Hint;
        }
    }
    /**
     * Get icon name for severity.
     */
    getSeverityIcon(severity) {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'error';
            case 'high':
                return 'warning';
            case 'medium':
                return 'info';
            case 'low':
                return 'lightbulb';
            default:
                return 'circle-outline';
        }
    }
    /**
     * Dispose resources.
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.RefactorIQCommands = RefactorIQCommands;
//# sourceMappingURL=commands.js.map