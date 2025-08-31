import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { saveConfig, loadConfig } from '../utils/config';
import { validateConfig } from '../utils/validator';

export function configCommand(program: Command) {
  program
    .command('config')
    .description('Manage RefactorIQ CLI configuration')
    .option('-c, --config <path>', 'Path to config file', '.riqrc')
    .option('--init', 'Initialize configuration file')
    .option('--show', 'Show current configuration')
    .option('--validate', 'Validate current configuration')
    .action(async (options) => {
      try {
        if (options.init) {
          await initializeConfig(options.config);
        } else if (options.show) {
          await showConfig(options.config);
        } else if (options.validate) {
          await validateCurrentConfig(options.config);
        } else {
          await interactiveConfig(options.config);
        }
      } catch (error) {
        console.error(chalk.red('Config failed:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });
}

async function initializeConfig(configPath: string) {
  console.log(chalk.blue('Initializing RefactorIQ configuration...'));
  
  const config = {
    api: {
      baseUrl: 'http://localhost:8000',
      apiKey: '',
      timeout: 30000
    },
    scan: {
      defaultSeverity: 'low',
      maxFindings: 100,
      includePatterns: ['**/*.{js,ts,jsx,tsx,py,java,cpp,c,go,rs}'],
      excludePatterns: ['node_modules/**', 'dist/**', 'build/**', '.git/**']
    },
    apply: {
      createBackup: true,
      defaultBranch: 'refactor-iq/auto-fix',
      createPr: false
    },
    output: {
      format: 'table',
      colors: true,
      verbose: false
    }
  };
  
  await saveConfig(configPath, config);
  console.log(chalk.green(`Configuration initialized at ${configPath}`));
}

async function showConfig(configPath: string) {
  const config = await loadConfig(configPath);
  console.log(chalk.blue('Current configuration:'));
  console.log(JSON.stringify(config, null, 2));
}

async function validateCurrentConfig(configPath: string) {
  const config = await loadConfig(configPath);
  const validation = validateConfig(config);
  
  if (validation.isValid) {
    console.log(chalk.green('✓ Configuration is valid'));
  } else {
    console.log(chalk.red('✗ Configuration has errors:'));
    validation.errors.forEach(error => {
      console.log(chalk.red(`  - ${error}`));
    });
  }
}

async function interactiveConfig(configPath: string) {
  console.log(chalk.blue('Interactive configuration setup...'));
  
  const questions = [
    {
      type: 'input',
      name: 'apiBaseUrl',
      message: 'RefactorIQ API base URL:',
      default: 'http://localhost:8000'
    },
    {
      type: 'password',
      name: 'apiKey',
      message: 'API Key (leave empty if not required):'
    },
    {
      type: 'number',
      name: 'timeout',
      message: 'API timeout (ms):',
      default: 30000
    },
    {
      type: 'list',
      name: 'defaultSeverity',
      message: 'Default scan severity:',
      choices: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    {
      type: 'confirm',
      name: 'createBackup',
      message: 'Create backup before applying changes?',
      default: true
    },
    {
      type: 'confirm',
      name: 'createPr',
      message: 'Create pull requests instead of direct application?',
      default: false
    }
  ];
  
  const answers = await inquirer.prompt(questions);
  
  const config = {
    api: {
      baseUrl: answers.apiBaseUrl,
      apiKey: answers.apiKey,
      timeout: answers.timeout
    },
    scan: {
      defaultSeverity: answers.defaultSeverity,
      maxFindings: 100,
      includePatterns: ['**/*.{js,ts,jsx,tsx,py,java,cpp,c,go,rs}'],
      excludePatterns: ['node_modules/**', 'dist/**', 'build/**', '.git/**']
    },
    apply: {
      createBackup: answers.createBackup,
      defaultBranch: 'refactor-iq/auto-fix',
      createPr: answers.createPr
    },
    output: {
      format: 'table',
      colors: true,
      verbose: false
    }
  };
  
  await saveConfig(configPath, config);
  console.log(chalk.green(`Configuration saved to ${configPath}`));
}


