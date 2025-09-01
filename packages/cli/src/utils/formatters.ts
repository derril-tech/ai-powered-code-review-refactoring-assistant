import chalk from 'chalk';
import { Finding } from '../services/scanner';
import path from 'path';

export function formatFindings(findings: Finding[], format: string): string {
  switch (format.toLowerCase()) {
    case 'json':
      return formatJson(findings);
    case 'table':
      return formatTable(findings);
    case 'summary':
      return formatSummary(findings);
    default:
      return formatTable(findings);
  }
}

function formatJson(findings: Finding[]): string {
  return JSON.stringify(findings, null, 2);
}

function formatTable(findings: Finding[]): string {
  if (findings.length === 0) {
    return chalk.yellow('No findings detected.');
  }
  
  const severityColors = {
    low: chalk.blue,
    medium: chalk.yellow,
    high: chalk.red,
    critical: chalk.red.bold
  };
  
  let output = '\n';
  output += chalk.bold('RefactorIQ Analysis Results\n');
  output += '='.repeat(80) + '\n\n';
  
  // Summary
  const summary = getSummary(findings);
  output += chalk.bold('Summary:\n');
  output += `  Total findings: ${findings.length}\n`;
  output += `  Critical: ${summary.critical} | High: ${summary.high} | Medium: ${summary.medium} | Low: ${summary.low}\n\n`;
  
  // Table header
  output += chalk.bold('Findings:\n');
  output += '─'.repeat(120) + '\n';
  output += `${chalk.bold('Severity'.padEnd(10))} ${chalk.bold('File'.padEnd(30))} ${chalk.bold('Line'.padEnd(6))} ${chalk.bold('Title'.padEnd(40))} ${chalk.bold('Confidence')}\n`;
  output += '─'.repeat(120) + '\n';
  
  // Table rows
  for (const finding of findings) {
    const severityColor = severityColors[finding.severity];
    const severity = severityColor(finding.severity.toUpperCase().padEnd(10));
    const file = chalk.gray(path.basename(finding.file_path).padEnd(30));
    const line = chalk.gray(finding.line_number.toString().padEnd(6));
    const title = finding.title.padEnd(40);
    const confidence = chalk.gray(`${finding.confidence_score}%`);
    
    output += `${severity} ${file} ${line} ${title} ${confidence}\n`;
  }
  
  output += '─'.repeat(120) + '\n\n';
  
  // Detailed findings
  output += chalk.bold('Detailed Findings:\n');
  output += '='.repeat(80) + '\n\n';
  
  for (let i = 0; i < findings.length; i++) {
    const finding = findings[i];
    const severityColor = severityColors[finding.severity];
    
    output += chalk.bold(`${i + 1}. ${finding.title}\n`);
    output += `${severityColor(`[${finding.severity.toUpperCase()}]`)} ${chalk.gray(`Confidence: ${finding.confidence_score}%`)}\n`;
    output += chalk.gray(`File: ${finding.file_path}:${finding.line_number}:${finding.column_number}\n`);
    output += chalk.gray(`Category: ${finding.category}\n`);
    output += `\n${finding.description}\n\n`;
    
    if (finding.code_snippet) {
      output += chalk.bold('Code:\n');
      output += chalk.gray('```\n');
      output += finding.code_snippet + '\n';
      output += chalk.gray('```\n\n');
    }
    
    if (finding.suggestion) {
      output += chalk.bold('Suggestion:\n');
      output += finding.suggestion + '\n\n';
    }
    
    if (finding.tags && finding.tags.length > 0) {
      output += chalk.gray(`Tags: ${finding.tags.join(', ')}\n\n`);
    }
    
    output += '─'.repeat(80) + '\n\n';
  }
  
  return output;
}

function formatSummary(findings: Finding[]): string {
  if (findings.length === 0) {
    return chalk.yellow('No findings detected.');
  }
  
  const summary = getSummary(findings);
  
  let output = '\n';
  output += chalk.bold('RefactorIQ Analysis Summary\n');
  output += '='.repeat(40) + '\n\n';
  
  output += `Total findings: ${chalk.bold(findings.length.toString())}\n\n`;
  
  if (summary.critical > 0) {
    output += chalk.red.bold(`Critical: ${summary.critical}\n`);
  }
  if (summary.high > 0) {
    output += chalk.red(`High: ${summary.high}\n`);
  }
  if (summary.medium > 0) {
    output += chalk.yellow(`Medium: ${summary.medium}\n`);
  }
  if (summary.low > 0) {
    output += chalk.blue(`Low: ${summary.low}\n`);
  }
  
  output += '\n';
  
  // Top categories
  const categories = getTopCategories(findings);
  if (categories.length > 0) {
    output += chalk.bold('Top Categories:\n');
    for (const category of categories.slice(0, 5)) {
      output += `  ${category.name}: ${category.count}\n`;
    }
    output += '\n';
  }
  
  // Top files
  const files = getTopFiles(findings);
  if (files.length > 0) {
    output += chalk.bold('Files with Most Issues:\n');
    for (const file of files.slice(0, 5)) {
      output += `  ${file.name}: ${file.count} issues\n`;
    }
  }
  
  return output;
}

function getSummary(findings: Finding[]) {
  return findings.reduce((acc, finding) => {
    acc[finding.severity]++;
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0 });
}

function getTopCategories(findings: Finding[]) {
  const categories: Record<string, number> = {};
  
  for (const finding of findings) {
    categories[finding.category] = (categories[finding.category] || 0) + 1;
  }
  
  return Object.entries(categories)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function getTopFiles(findings: Finding[]) {
  const files: Record<string, number> = {};
  
  for (const finding of findings) {
    const fileName = path.basename(finding.file_path);
    files[fileName] = (files[fileName] || 0) + 1;
  }
  
  return Object.entries(files)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}



