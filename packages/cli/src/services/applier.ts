import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ApplyOptions {
  dryRun: boolean;
  createPr: boolean;
  branchName: string;
  api?: {
    baseUrl: string;
    apiKey: string;
    timeout: number;
  };
}

export interface ApplyResult {
  success: boolean;
  filesChanged: number;
  changes: string[];
  prUrl?: string;
  error?: string;
}

export async function applyChanges(proposalId: string, options: ApplyOptions): Promise<ApplyResult> {
  try {
    // Get proposal details from API
    const proposal = await getProposal(proposalId, options);
    
    if (options.dryRun) {
      return {
        success: true,
        filesChanged: proposal.files.length,
        changes: proposal.files.map(f => `${f.path}: ${f.changes.length} changes`)
      };
    }
    
    if (options.createPr) {
      return await createPullRequest(proposalId, options);
    }
    
    return await applyDirectly(proposal, options);
    
  } catch (error) {
    return {
      success: false,
      filesChanged: 0,
      changes: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function getProposal(proposalId: string, options: ApplyOptions) {
  if (!options.api?.baseUrl) {
    throw new Error('API configuration required to get proposal details');
  }
  
  const response = await axios.get(
    `${options.api.baseUrl}/api/v1/proposals/${proposalId}`,
    {
      headers: {
        'Authorization': `Bearer ${options.api.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: options.api.timeout
    }
  );
  
  return response.data;
}

async function applyDirectly(proposal: any, options: ApplyOptions): Promise<ApplyResult> {
  const changes: string[] = [];
  let filesChanged = 0;
  
  for (const file of proposal.files) {
    try {
      const filePath = path.resolve(file.path);
      const originalContent = await fs.readFile(filePath, 'utf-8');
      
      // Apply patches to the file
      const newContent = applyPatches(originalContent, file.patches);
      
      if (newContent !== originalContent) {
        await fs.writeFile(filePath, newContent, 'utf-8');
        changes.push(`Modified ${file.path}`);
        filesChanged++;
      }
    } catch (error) {
      changes.push(`Failed to modify ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return {
    success: filesChanged > 0,
    filesChanged,
    changes
  };
}

async function createPullRequest(proposalId: string, options: ApplyOptions): Promise<ApplyResult> {
  if (!options.api?.baseUrl) {
    throw new Error('API configuration required to create pull request');
  }
  
  try {
    // Create new branch
    await createBranch(options.branchName);
    
    // Apply changes to the new branch
    const proposal = await getProposal(proposalId, options);
    await applyDirectly(proposal, options);
    
    // Commit changes
    await commitChanges(proposal.title || 'Apply RefactorIQ proposal');
    
    // Push branch
    await pushBranch(options.branchName);
    
    // Create pull request via API
    const response = await axios.post(
      `${options.api.baseUrl}/api/v1/proposals/${proposalId}/apply`,
      {
        create_pr: true,
        branch_name: options.branchName
      },
      {
        headers: {
          'Authorization': `Bearer ${options.api.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: options.api.timeout
      }
    );
    
    return {
      success: true,
      filesChanged: proposal.files.length,
      changes: [`Created pull request: ${response.data.pr_url}`],
      prUrl: response.data.pr_url
    };
    
  } catch (error) {
    return {
      success: false,
      filesChanged: 0,
      changes: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function createBranch(branchName: string): Promise<void> {
  try {
    await execAsync(`git checkout -b ${branchName}`);
  } catch (error) {
    throw new Error(`Failed to create branch ${branchName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function commitChanges(message: string): Promise<void> {
  try {
    await execAsync('git add .');
    await execAsync(`git commit -m "${message}"`);
  } catch (error) {
    throw new Error(`Failed to commit changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function pushBranch(branchName: string): Promise<void> {
  try {
    await execAsync(`git push origin ${branchName}`);
  } catch (error) {
    throw new Error(`Failed to push branch ${branchName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function applyPatches(content: string, patches: any[]): string {
  let result = content;
  const lines = content.split('\n');
  
  // Sort patches by line number in descending order to avoid offset issues
  const sortedPatches = [...patches].sort((a, b) => b.line_number - a.line_number);
  
  for (const patch of sortedPatches) {
    const lineIndex = patch.line_number - 1; // Convert to 0-based index
    
    if (patch.type === 'replace') {
      // Replace the line
      if (lineIndex < lines.length) {
        lines[lineIndex] = patch.new_content;
      }
    } else if (patch.type === 'insert') {
      // Insert new line after the specified line
      lines.splice(lineIndex + 1, 0, patch.new_content);
    } else if (patch.type === 'delete') {
      // Delete the line
      if (lineIndex < lines.length) {
        lines.splice(lineIndex, 1);
      }
    } else if (patch.type === 'multi_line') {
      // Handle multi-line patches
      const startLine = patch.start_line - 1;
      const endLine = patch.end_line - 1;
      
      if (patch.operation === 'replace') {
        // Replace lines from start_line to end_line
        lines.splice(startLine, endLine - startLine + 1, ...patch.new_lines);
      } else if (patch.operation === 'insert') {
        // Insert new lines after end_line
        lines.splice(endLine + 1, 0, ...patch.new_lines);
      } else if (patch.operation === 'delete') {
        // Delete lines from start_line to end_line
        lines.splice(startLine, endLine - startLine + 1);
      }
    }
  }
  
  return lines.join('\n');
}


