import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface Config {
  api: {
    baseUrl: string;
    apiKey: string;
    timeout: number;
  };
  scan: {
    defaultSeverity: string;
    maxFindings: number;
    includePatterns: string[];
    excludePatterns: string[];
  };
  apply: {
    createBackup: boolean;
    defaultBranch: string;
    createPr: boolean;
  };
  output: {
    format: string;
    colors: boolean;
    verbose: boolean;
  };
}

const DEFAULT_CONFIG: Config = {
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

export async function loadConfig(configPath: string): Promise<Config> {
  try {
    // Try to load from specified path
    if (await fs.pathExists(configPath)) {
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);
      return mergeConfig(DEFAULT_CONFIG, config);
    }
    
    // Try to load from current directory
    const localConfigPath = path.join(process.cwd(), '.riqrc');
    if (await fs.pathExists(localConfigPath)) {
      const content = await fs.readFile(localConfigPath, 'utf-8');
      const config = JSON.parse(content);
      return mergeConfig(DEFAULT_CONFIG, config);
    }
    
    // Try to load from home directory
    const homeConfigPath = path.join(os.homedir(), '.riqrc');
    if (await fs.pathExists(homeConfigPath)) {
      const content = await fs.readFile(homeConfigPath, 'utf-8');
      const config = JSON.parse(content);
      return mergeConfig(DEFAULT_CONFIG, config);
    }
    
    // Return default config if no config file found
    return DEFAULT_CONFIG;
    
  } catch (error) {
    console.warn(`Failed to load config from ${configPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return DEFAULT_CONFIG;
  }
}

export async function saveConfig(configPath: string, config: Config): Promise<void> {
  try {
    const dir = path.dirname(configPath);
    if (!(await fs.pathExists(dir))) {
      await fs.mkdirp(dir);
    }
    
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save config to ${configPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function mergeConfig(defaultConfig: Config, userConfig: any): Config {
  return {
    api: { ...defaultConfig.api, ...userConfig.api },
    scan: { ...defaultConfig.scan, ...userConfig.scan },
    apply: { ...defaultConfig.apply, ...userConfig.apply },
    output: { ...defaultConfig.output, ...userConfig.output }
  };
}


