import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { generateDiff } from '../services/differ';
import { loadConfig } from '../utils/config';

export function diffCommand(program: Command) {
  program
    .command('diff')
    .description('Show differences between code versions and proposed changes')
    .argument('<source>', 'Source file or directory')
    .argument('[target]', 'Target file or directory (default: current state)')
    .option('-o, --output <format>', 'Output format (unified, side-by-side, json)', 'unified')
    .option('-c, --config <path>', 'Path to config file', '.riqrc')
    .option('--context <lines>', 'Number of context lines', '3')
    .option('--ignore-whitespace', 'Ignore whitespace changes')
    .option('--ignore-case', 'Ignore case changes')
    .option('--proposal <id>', 'Show diff for specific proposal ID')
    .action(async (source, target, options) => {
      try {
        const spinner = ora('Loading configuration...').start();
        
        // Load configuration
        const config = await loadConfig(options.config);
        spinner.text = 'Generating diff...';
        
        // Generate diff
        const diff = await generateDiff(source, target || '.', {
          ...config,
          format: options.output,
          contextLines: parseInt(options.context),
          ignoreWhitespace: options.ignoreWhitespace,
          ignoreCase: options.ignoreCase,
          proposalId: options.proposal
        });
        
        spinner.succeed('Diff generated successfully');
        
        // Display diff
        if (options.output === 'json') {
          console.log(JSON.stringify(diff, null, 2));
        } else {
          console.log(diff);
        }
        
      } catch (error) {
        console.error(chalk.red('Diff failed:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}



