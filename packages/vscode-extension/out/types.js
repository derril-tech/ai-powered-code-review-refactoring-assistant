"use strict";
/**
 * Type definitions for RefactorIQ VS Code extension.
 *
 * These types match the backend API schemas for consistent communication.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalType = exports.ProposalStatus = exports.FindingType = exports.FindingSeverity = exports.AnalysisStatus = void 0;
// Enums
var AnalysisStatus;
(function (AnalysisStatus) {
    AnalysisStatus["PENDING"] = "pending";
    AnalysisStatus["PROCESSING"] = "processing";
    AnalysisStatus["COMPLETED"] = "completed";
    AnalysisStatus["FAILED"] = "failed";
    AnalysisStatus["CANCELLED"] = "cancelled";
})(AnalysisStatus = exports.AnalysisStatus || (exports.AnalysisStatus = {}));
var FindingSeverity;
(function (FindingSeverity) {
    FindingSeverity["LOW"] = "low";
    FindingSeverity["MEDIUM"] = "medium";
    FindingSeverity["HIGH"] = "high";
    FindingSeverity["CRITICAL"] = "critical";
})(FindingSeverity = exports.FindingSeverity || (exports.FindingSeverity = {}));
var FindingType;
(function (FindingType) {
    FindingType["BUG"] = "bug";
    FindingType["SECURITY"] = "security";
    FindingType["PERFORMANCE"] = "performance";
    FindingType["CODE_SMELL"] = "code_smell";
    FindingType["REFACTORING"] = "refactoring";
    FindingType["STYLE"] = "style";
    FindingType["DOCUMENTATION"] = "documentation";
})(FindingType = exports.FindingType || (exports.FindingType = {}));
var ProposalStatus;
(function (ProposalStatus) {
    ProposalStatus["PENDING"] = "pending";
    ProposalStatus["VALIDATING"] = "validating";
    ProposalStatus["APPLYING"] = "applying";
    ProposalStatus["APPLIED"] = "applied";
    ProposalStatus["REJECTED"] = "rejected";
    ProposalStatus["FAILED"] = "failed";
    ProposalStatus["PR_CREATED"] = "pr_created";
})(ProposalStatus = exports.ProposalStatus || (exports.ProposalStatus = {}));
var ProposalType;
(function (ProposalType) {
    ProposalType["BUG_FIX"] = "bug_fix";
    ProposalType["SECURITY_FIX"] = "security_fix";
    ProposalType["PERFORMANCE_IMPROVEMENT"] = "performance_improvement";
    ProposalType["CODE_QUALITY"] = "code_quality";
    ProposalType["REFACTORING"] = "refactoring";
    ProposalType["DOCUMENTATION"] = "documentation";
})(ProposalType = exports.ProposalType || (exports.ProposalType = {}));
//# sourceMappingURL=types.js.map