import * as diff from 'diff';
import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';

export interface DiffOptions {
  format: 'unified' | 'side-by-side' | 'json';
  contextLines: number;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  proposalId?: string;
  api?: {
    baseUrl: string;
    apiKey: string;
    timeout: number;
  };
}

export interface DiffResult {
  files: DiffFile[];
  summary: {
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
  };
}

export interface DiffFile {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  diff: string;
  changes: DiffChange[];
}

export interface DiffChange {
  type: 'add' | 'remove' | 'context';
  lineNumber: number;
  content: string;
}

export async function generateDiff(source: string, target: string, options: DiffOptions): Promise<DiffResult | string> {
  // If proposal ID is provided, get diff from API
  if (options.proposalId && options.api?.baseUrl) {
    return await getProposalDiff(options.proposalId, options);
  }
  
  // Otherwise, generate diff between files/directories
  const diffResult = await generateFileDiff(source, target, options);
  
  if (options.format === 'json') {
    return diffResult;
  }
  
  return formatDiffOutput(diffResult, options);
}

async function getProposalDiff(proposalId: string, options: DiffOptions): Promise<string> {
  try {
    const response = await axios.get(
      `${options.api!.baseUrl}/api/v1/proposals/${proposalId}/preview`,
      {
        headers: {
          'Authorization': `Bearer ${options.api!.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: options.api!.timeout
      }
    );
    
    return response.data.diff || 'No diff available';
  } catch (error) {
    throw new Error(`Failed to get proposal diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateFileDiff(source: string, target: string, options: DiffOptions): Promise<DiffResult> {
  const sourcePath = path.resolve(source);
  const targetPath = path.resolve(target);
  
  const sourceStats = await fs.stat(sourcePath);
  const targetStats = await fs.stat(targetPath);
  
  const files: DiffFile[] = [];
  let totalLinesAdded = 0;
  let totalLinesRemoved = 0;
  
  if (sourceStats.isFile() && targetStats.isFile()) {
    // Single file diff
    const fileDiff = await diffSingleFile(sourcePath, targetPath, options);
    if (fileDiff) {
      files.push(fileDiff);
      totalLinesAdded += fileDiff.changes.filter(c => c.type === 'add').length;
      totalLinesRemoved += fileDiff.changes.filter(c => c.type === 'remove').length;
    }
  } else if (sourceStats.isDirectory() && targetStats.isDirectory()) {
    // Directory diff
    const dirDiff = await diffDirectory(sourcePath, targetPath, options);
    files.push(...dirDiff);
    totalLinesAdded = dirDiff.reduce((sum, f) => sum + f.changes.filter(c => c.type === 'add').length, 0);
    totalLinesRemoved = dirDiff.reduce((sum, f) => sum + f.changes.filter(c => c.type === 'remove').length, 0);
  } else {
    throw new Error('Source and target must both be files or both be directories');
  }
  
  return {
    files,
    summary: {
      filesChanged: files.length,
      linesAdded: totalLinesAdded,
      linesRemoved: totalLinesRemoved
    }
  };
}

async function diffSingleFile(sourcePath: string, targetPath: string, options: DiffOptions): Promise<DiffFile | null> {
  const sourceContent = await fs.readFile(sourcePath, 'utf-8');
  const targetContent = await fs.readFile(targetPath, 'utf-8');
  
  if (sourceContent === targetContent) {
    return null;
  }
  
  const diffOptions: diff.Options = {
    context: options.contextLines,
    ignoreWhitespace: options.ignoreWhitespace,
    ignoreCase: options.ignoreCase
  };
  
  const diffResult = diff.createPatch(
    path.basename(sourcePath),
    sourceContent,
    targetContent,
    'original',
    'modified',
    diffOptions
  );
  
  const changes = parseDiffChanges(diffResult);
  
  return {
    path: sourcePath,
    status: 'modified',
    diff: diffResult,
    changes
  };
}

async function diffDirectory(sourcePath: string, targetPath: string, options: DiffOptions): Promise<DiffFile[]> {
  const sourceFiles = await getAllFiles(sourcePath);
  const targetFiles = await getAllFiles(targetPath);
  
  const allFiles = new Set([...sourceFiles, ...targetFiles]);
  const files: DiffFile[] = [];
  
  for (const file of allFiles) {
    const relativePath = path.relative(sourcePath, file);
    const sourceFile = path.join(sourcePath, relativePath);
    const targetFile = path.join(targetPath, relativePath);
    
    const sourceExists = await fs.pathExists(sourceFile);
    const targetExists = await fs.pathExists(targetFile);
    
    if (!sourceExists && targetExists) {
      // File was added
      const content = await fs.readFile(targetFile, 'utf-8');
      files.push({
        path: targetFile,
        status: 'added',
        diff: `+ ${relativePath}\n${content.split('\n').map(line => `+ ${line}`).join('\n')}`,
        changes: content.split('\n').map((line, i) => ({
          type: 'add' as const,
          lineNumber: i + 1,
          content: line
        }))
      });
    } else if (sourceExists && !targetExists) {
      // File was deleted
      const content = await fs.readFile(sourceFile, 'utf-8');
      files.push({
        path: sourceFile,
        status: 'deleted',
        diff: `- ${relativePath}\n${content.split('\n').map(line => `- ${line}`).join('\n')}`,
        changes: content.split('\n').map((line, i) => ({
          type: 'remove' as const,
          lineNumber: i + 1,
          content: line
        }))
      });
    } else if (sourceExists && targetExists) {
      // File was modified
      const fileDiff = await diffSingleFile(sourceFile, targetFile, options);
      if (fileDiff) {
        files.push(fileDiff);
      }
    }
  }
  
  return files;
}

async function getAllFiles(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  
  async function walkDir(currentPath: string) {
    const items = await fs.readdir(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await walkDir(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  
  await walkDir(dirPath);
  return files;
}

function parseDiffChanges(diffText: string): DiffChange[] {
  const changes: DiffChange[] = [];
  const lines = diffText.split('\n');
  let lineNumber = 0;
  
  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      changes.push({
        type: 'add',
        lineNumber: ++lineNumber,
        content: line.substring(1)
      });
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      changes.push({
        type: 'remove',
        lineNumber: ++lineNumber,
        content: line.substring(1)
      });
    } else if (!line.startsWith('@') && !line.startsWith('+++') && !line.startsWith('---') && !line.startsWith('diff')) {
      changes.push({
        type: 'context',
        lineNumber: ++lineNumber,
        content: line
      });
    }
  }
  
  return changes;
}

function formatDiffOutput(diffResult: DiffResult, options: DiffOptions): string {
  if (options.format === 'side-by-side') {
    return formatSideBySideDiff(diffResult);
  }
  
  // Unified format (default)
  let output = `Summary: ${diffResult.summary.filesChanged} files changed, ${diffResult.summary.linesAdded} additions, ${diffResult.summary.linesRemoved} deletions\n\n`;
  
  for (const file of diffResult.files) {
    output += `File: ${file.path} (${file.status})\n`;
    output += file.diff;
    output += '\n\n';
  }
  
  return output;
}

function formatSideBySideDiff(diffResult: DiffResult): string {
  let output = `Summary: ${diffResult.summary.filesChanged} files changed, ${diffResult.summary.linesAdded} additions, ${diffResult.summary.linesRemoved} deletions\n\n`;
  
  for (const file of diffResult.files) {
    output += `File: ${file.path} (${file.status})\n`;
    output += '='.repeat(80) + '\n';
    
    const leftLines: string[] = [];
    const rightLines: string[] = [];
    
    for (const change of file.changes) {
      if (change.type === 'add') {
        leftLines.push('');
        rightLines.push(change.content);
      } else if (change.type === 'remove') {
        leftLines.push(change.content);
        rightLines.push('');
      } else {
        leftLines.push(change.content);
        rightLines.push(change.content);
      }
    }
    
    const maxLength = Math.max(...leftLines.map(l => l.length), ...rightLines.map(l => l.length));
    const leftWidth = Math.floor((maxLength + 10) / 2);
    const rightWidth = maxLength + 10 - leftWidth;
    
    for (let i = 0; i < Math.max(leftLines.length, rightLines.length); i++) {
      const left = leftLines[i] || '';
      const right = rightLines[i] || '';
      const leftPadded = left.padEnd(leftWidth);
      const rightPadded = right.padEnd(rightWidth);
      
      if (left !== right) {
        output += chalk.red(`${leftPadded} | ${rightPadded}\n`);
      } else {
        output += `${leftPadded} | ${rightPadded}\n`;
      }
    }
    
    output += '\n';
  }
  
  return output;
}


