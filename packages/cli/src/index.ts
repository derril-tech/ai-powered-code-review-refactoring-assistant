#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { scanCommand } from './commands/scan';
import { diffCommand } from './commands/diff';
import { applyCommand } from './commands/apply';
import { configCommand } from './commands/config';
import { version } from '../package.json';

const program = new Command();

program
  .name('riq')
  .description('RefactorIQ CLI - AI-powered code analysis and refactoring tools')
  .version(version);

// Add commands
scanCommand(program);
diffCommand(program);
applyCommand(program);
configCommand(program);

// Global error handler
program.exitOverride();

try {
  program.parse();
} catch (err) {
  console.error(chalk.red('Error:'), err instanceof Error ? err.message : 'Unknown error occurred');
  process.exit(1);
}



