"use strict";
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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const provider_1 = require("./provider");
const service_1 = require("./service");
const utils_1 = require("./utils");
function activate(context) {
    const service = new service_1.RefactorIQService(context);
    const provider = new provider_1.RefactorIQProvider(service);
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
    const applyProposalCommand = vscode.commands.registerCommand('refactor-iq.applyProposal', (proposalId, createPr = false) => {
        provider.applyProposal(proposalId, createPr);
    });
    const diffCommand = vscode.commands.registerCommand('refactor-iq.diff', (proposalId) => {
        provider.showDiff(proposalId);
    });
    const goToFindingCommand = vscode.commands.registerCommand('refactor-iq.goToFinding', (finding) => {
        (0, utils_1.openFileAtLocation)(finding.file_path, finding.line_number, finding.column_number || 0);
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
    const createPrCommand = vscode.commands.registerCommand('refactor-iq.createPr', (proposalId) => {
        provider.applyProposal(proposalId, true);
    });
    const applyDirectCommand = vscode.commands.registerCommand('refactor-iq.applyDirect', (proposalId) => {
        provider.applyProposal(proposalId, false);
    });
    context.subscriptions.push(scanCommand, scanWorkspaceCommand, showProposalsCommand, applyProposalCommand, diffCommand, goToFindingCommand, refreshCommand, signOutCommand, createPrCommand, applyDirectCommand, proposalsTreeProvider, findingsTreeProvider, provider);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map