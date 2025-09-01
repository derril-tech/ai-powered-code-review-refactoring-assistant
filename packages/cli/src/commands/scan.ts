import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { scanCode } from '../services/scanner';
import { loadConfig } from '../utils/config';
import { formatFindings } from '../utils/formatters';

export function scanCommand(program: Command) {
  program
    .command('scan')
    .description('Scan code for issues and generate analysis findings')
    .argument('[path]', 'Path to scan (default: current directory)', '.')
    .option('-o, --output <format>', 'Output format (json, table, summary)', 'table')
    .option('-c, --config <path>', 'Path to config file', '.riqrc')
    .option('--include <patterns>', 'Glob patterns to include', '**/*.{js,ts,jsx,tsx,py,java,cpp,c,go,rs}')
    .option('--exclude <patterns>', 'Glob patterns to exclude', 'node_modules/**,dist/**,build/**,.git/**')
    .option('--severity <level>', 'Minimum severity level (low, medium, high, critical)', 'low')
    .option('--max-findings <number>', 'Maximum number of findings to return', '100')
    .action(async (path, options) => {
      try {
        const spinner = ora('Loading configuration...').start();
        
        // Load configuration
        const config = await loadConfig(options.config);
        spinner.text = 'Scanning code...';
        
        // Perform scan
        const findings = await scanCode(path, {
          ...config,
          include: options.include.split(','),
          exclude: options.exclude.split(','),
          severity: options.severity,
          maxFindings: parseInt(options.maxFindings)
        });
        
        spinner.succeed(`Scan completed! Found ${findings.length} issues`);
        
        // Format and display results
        const formatted = formatFindings(findings, options.output);
        console.log(formatted);
        
        // Exit with error code if critical findings
        const criticalCount = findings.filter(f => f.severity === 'critical').length;
        if (criticalCount > 0) {
          console.log(chalk.red(`\n⚠️  ${criticalCount} critical issues found!`));
          process.exit(1);
        }
        
      } catch (error) {
        console.error(chalk.red('Scan failed:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}



