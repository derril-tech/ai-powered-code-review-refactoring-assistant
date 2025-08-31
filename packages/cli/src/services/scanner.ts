import axios from 'axios';
import { glob } from 'glob';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface ScanOptions {
  include: string[];
  exclude: string[];
  severity: string;
  maxFindings: number;
  api?: {
    baseUrl: string;
    apiKey: string;
    timeout: number;
  };
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  file_path: string;
  line_number: number;
  column_number: number;
  code_snippet: string;
  suggestion: string;
  confidence_score: number;
  tags: string[];
}

export async function scanCode(scanPath: string, options: ScanOptions): Promise<Finding[]> {
  // Find files to scan
  const files = await findFiles(scanPath, options.include, options.exclude);
  
  if (files.length === 0) {
    throw new Error('No files found matching the include patterns');
  }
  
  // Read file contents
  const fileContents = await Promise.all(
    files.map(async (file) => ({
      path: file,
      content: await fs.readFile(file, 'utf-8')
    }))
  );
  
  // If API is configured, send to backend for analysis
  if (options.api?.baseUrl) {
    return await scanWithAPI(fileContents, options);
  }
  
  // Otherwise, perform local analysis
  return await performLocalScan(fileContents, options);
}

async function findFiles(scanPath: string, include: string[], exclude: string[]): Promise<string[]> {
  const patterns = include.map(pattern => path.join(scanPath, pattern));
  const ignorePatterns = exclude.map(pattern => path.join(scanPath, pattern));
  
  const files: string[] = [];
  
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      ignore: ignorePatterns,
      nodir: true,
      absolute: true
    });
    files.push(...matches);
  }
  
  return [...new Set(files)]; // Remove duplicates
}

async function scanWithAPI(fileContents: Array<{path: string, content: string}>, options: ScanOptions): Promise<Finding[]> {
  try {
    const response = await axios.post(
      `${options.api!.baseUrl}/api/v1/analyses/scan`,
      {
        files: fileContents.map(fc => ({
          path: fc.path,
          content: fc.content
        })),
        options: {
          severity: options.severity,
          max_findings: options.maxFindings
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${options.api!.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: options.api!.timeout
      }
    );
    
    return response.data.findings || [];
  } catch (error) {
    console.warn('API scan failed, falling back to local scan');
    return await performLocalScan(fileContents, options);
  }
}

async function performLocalScan(fileContents: Array<{path: string, content: string}>, options: ScanOptions): Promise<Finding[]> {
  const findings: Finding[] = [];
  
  for (const file of fileContents) {
    const fileFindings = await analyzeFile(file, options);
    findings.push(...fileFindings);
  }
  
  // Filter by severity and limit results
  const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
  const minSeverity = severityOrder[options.severity as keyof typeof severityOrder];
  
  return findings
    .filter(finding => severityOrder[finding.severity] >= minSeverity)
    .sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])
    .slice(0, options.maxFindings);
}

async function analyzeFile(file: {path: string, content: string}, options: ScanOptions): Promise<Finding[]> {
  const findings: Finding[] = [];
  const lines = file.content.split('\n');
  const extension = path.extname(file.path).toLowerCase();
  
  // Basic static analysis patterns
  const patterns = getAnalysisPatterns(extension);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        findings.push({
          id: `finding-${Date.now()}-${i}-${pattern.category}`,
          title: pattern.title,
          description: pattern.description,
          severity: pattern.severity,
          category: pattern.category,
          file_path: file.path,
          line_number: lineNumber,
          column_number: line.indexOf(pattern.regex.exec(line)![0]) + 1,
          code_snippet: line.trim(),
          suggestion: pattern.suggestion,
          confidence_score: pattern.confidence,
          tags: pattern.tags
        });
      }
    }
  }
  
  return findings;
}

function getAnalysisPatterns(extension: string) {
  const commonPatterns = [
    {
      regex: /TODO|FIXME|HACK|XXX/,
      title: 'Code comment indicating technical debt',
      description: 'This line contains a comment indicating incomplete work or technical debt',
      severity: 'low' as const,
      category: 'code-quality',
      suggestion: 'Address the TODO/FIXME comment or remove it if no longer needed',
      confidence: 90,
      tags: ['technical-debt', 'documentation']
    },
    {
      regex: /console\.log\(/,
      title: 'Debug code left in production',
      description: 'Console.log statements should be removed from production code',
      severity: 'medium' as const,
      category: 'security',
      suggestion: 'Remove console.log statement or replace with proper logging',
      confidence: 95,
      tags: ['debug', 'logging']
    }
  ];
  
  const languageSpecificPatterns: Record<string, any[]> = {
    '.js': [
      {
        regex: /eval\(/,
        title: 'Use of eval() function',
        description: 'eval() can be dangerous and should be avoided',
        severity: 'high' as const,
        category: 'security',
        suggestion: 'Replace eval() with safer alternatives',
        confidence: 100,
        tags: ['security', 'dangerous']
      }
    ],
    '.py': [
      {
        regex: /exec\(/,
        title: 'Use of exec() function',
        description: 'exec() can be dangerous and should be avoided',
        severity: 'high' as const,
        category: 'security',
        suggestion: 'Replace exec() with safer alternatives',
        confidence: 100,
        tags: ['security', 'dangerous']
      }
    ]
  };
  
  return [...commonPatterns, ...(languageSpecificPatterns[extension] || [])];
}


