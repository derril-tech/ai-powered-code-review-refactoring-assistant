import * as fs from 'fs-extra';
import * as path from 'path';
import { Config } from './config';

export async function backupFiles(config: Config): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), '.riq-backup', timestamp);
  
  try {
    await fs.mkdirp(backupDir);
    
    // Get all files that match the scan patterns
    const files = await getAllFiles(process.cwd(), config.scan.includePatterns, config.scan.excludePatterns);
    
    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file);
      const backupPath = path.join(backupDir, relativePath);
      
      // Create directory structure
      await fs.mkdirp(path.dirname(backupPath));
      
      // Copy file
      await fs.copyFile(file, backupPath);
    }
    
    console.log(`Backup created at: ${backupDir}`);
  } catch (error) {
    throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getAllFiles(dirPath: string, include: string[], exclude: string[]): Promise<string[]> {
  const files: string[] = [];
  
  async function walkDir(currentPath: string) {
    const items = await fs.readdir(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        await walkDir(fullPath);
      } else {
        // Check if file matches include patterns and doesn't match exclude patterns
        const relativePath = path.relative(dirPath, fullPath);
        const shouldInclude = include.some(pattern => 
          pattern.includes('**') || relativePath.includes(path.basename(pattern))
        );
        const shouldExclude = exclude.some(pattern => 
          pattern.includes('**') || relativePath.includes(path.basename(pattern))
        );
        
        if (shouldInclude && !shouldExclude) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await walkDir(dirPath);
  return files;
}


