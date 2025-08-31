import { Config } from './config';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateConfig(config: Config): ValidationResult {
  const errors: string[] = [];
  
  // Validate API configuration
  if (config.api.baseUrl && !isValidUrl(config.api.baseUrl)) {
    errors.push('Invalid API base URL format');
  }
  
  if (config.api.timeout < 1000 || config.api.timeout > 300000) {
    errors.push('API timeout must be between 1000ms and 300000ms');
  }
  
  // Validate scan configuration
  if (config.scan.maxFindings < 1 || config.scan.maxFindings > 10000) {
    errors.push('Max findings must be between 1 and 10000');
  }
  
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!validSeverities.includes(config.scan.defaultSeverity)) {
    errors.push(`Invalid severity level. Must be one of: ${validSeverities.join(', ')}`);
  }
  
  // Validate apply configuration
  if (config.apply.defaultBranch.length === 0) {
    errors.push('Default branch name cannot be empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}


