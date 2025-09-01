import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { applyChanges } from '../services/applier';
import { loadConfig } from '../utils/config';
import { backupFiles } from '../utils/backup';

export function applyCommand(program: Command) {
  program
    .command('apply')
    .description('Apply proposed refactoring changes to the codebase')
    .argument('[proposal-id]', 'Proposal ID to apply (if not specified, will show interactive selection)')
    .option('-c, --config <path>', 'Path to config file', '.riqrc')
    .option('--dry-run', 'Show what would be changed without applying')
    .option('--force', 'Apply changes without confirmation')
    .option('--backup', 'Create backup before applying changes', true)
    .option('--create-pr', 'Create pull request instead of direct application')
    .option('--branch <name>', 'Branch name for pull request', 'refactor-iq/auto-fix')
    .action(async (proposalId, options) => {
      try {
        const spinner = ora('Loading configuration...').start();
        
        // Load configuration
        const config = await loadConfig(options.config);
        spinner.text = 'Loading proposals...';
        
        // Get proposal ID if not provided
        let targetProposalId = proposalId;
        if (!targetProposalId) {
          const proposals = await loadProposals(config);
          if (proposals.length === 0) {
            spinner.fail('No proposals available to apply');
            return;
          }
          
          const { selectedProposal } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedProposal',
              message: 'Select a proposal to apply:',
              choices: proposals.map(p => ({
                name: `${p.title} (${p.confidence_score}% confidence)`,
                value: p.id
              }))
            }
          ]);
          targetProposalId = selectedProposal;
        }
        
        spinner.text = 'Preparing to apply changes...';
        
        // Create backup if requested
        if (options.backup && !options.dryRun) {
          await backupFiles(config);
        }
        
        // Apply changes
        const result = await applyChanges(targetProposalId, {
          ...config,
          dryRun: options.dryRun,
          createPr: options.createPr,
          branchName: options.branch
        });
        
        if (options.dryRun) {
          spinner.succeed('Dry run completed');
          console.log(chalk.yellow('Changes that would be applied:'));
          console.log(result.changes);
        } else {
          spinner.succeed('Changes applied successfully');
          
          if (result.prUrl) {
            console.log(chalk.green(`Pull request created: ${result.prUrl}`));
          } else {
            console.log(chalk.green('Changes applied directly to files'));
          }
          
          console.log(chalk.blue(`Modified ${result.filesChanged} files`));
        }
        
      } catch (error) {
        console.error(chalk.red('Apply failed:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}

async function loadProposals(config: any) {
  // This would typically call the RefactorIQ API to get available proposals
  // For now, return mock data
  return [
    {
      id: 'prop-001',
      title: 'Fix potential null pointer dereference',
      confidence_score: 95,
      severity: 'high'
    },
    {
      id: 'prop-002', 
      title: 'Optimize database query',
      confidence_score: 87,
      severity: 'medium'
    }
  ];
}



