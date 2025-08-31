#!/usr/bin/env node

/**
 * Environment variable validation script
 * Checks for required environment variables and provides helpful error messages
 */

interface EnvCheck {
  name: string;
  required: boolean;
  description: string;
  validate?: (value: string) => boolean;
}

const envChecks: EnvCheck[] = [
  // Database
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL database connection string',
    validate: (value) => value.startsWith('postgresql'),
  },
  
  // Redis
  {
    name: 'REDIS_URL',
    required: true,
    description: 'Redis connection URL',
    validate: (value) => value.startsWith('redis://'),
  },
  
  // Security
  {
    name: 'SECRET_KEY',
    required: true,
    description: 'Secret key for JWT token signing',
    validate: (value) => value.length >= 32,
  },
  
  // AI Services
  {
    name: 'OPENAI_API_KEY',
    required: true,
    description: 'OpenAI API key for code analysis',
    validate: (value) => value.startsWith('sk-'),
  },
  
  {
    name: 'ANTHROPIC_API_KEY',
    required: true,
    description: 'Anthropic API key for Claude integration',
    validate: (value) => value.startsWith('sk-ant-'),
  },
  
  // Optional but recommended
  {
    name: 'S3_ACCESS_KEY_ID',
    required: false,
    description: 'S3 access key for file storage',
  },
  
  {
    name: 'S3_SECRET_ACCESS_KEY',
    required: false,
    description: 'S3 secret key for file storage',
  },
  
  {
    name: 'S3_BUCKET_NAME',
    required: false,
    description: 'S3 bucket name for file storage',
  },
  
  // Email (optional)
  {
    name: 'SMTP_HOST',
    required: false,
    description: 'SMTP host for email notifications',
  },
  
  {
    name: 'SMTP_USERNAME',
    required: false,
    description: 'SMTP username for email notifications',
  },
  
  {
    name: 'SMTP_PASSWORD',
    required: false,
    description: 'SMTP password for email notifications',
  },
];

function checkEnvironment(): void {
  console.log('🔍 Checking environment variables...\n');
  
  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];
  
  for (const check of envChecks) {
    const value = process.env[check.name];
    
    if (!value) {
      if (check.required) {
        missing.push(check.name);
        console.log(`❌ Missing required: ${check.name} - ${check.description}`);
      } else {
        warnings.push(check.name);
        console.log(`⚠️  Missing optional: ${check.name} - ${check.description}`);
      }
    } else if (check.validate && !check.validate(value)) {
      invalid.push(check.name);
      console.log(`❌ Invalid format: ${check.name} - ${check.description}`);
    } else {
      console.log(`✅ ${check.name}`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Valid: ${envChecks.length - missing.length - invalid.length - warnings.length}`);
  console.log(`⚠️  Optional missing: ${warnings.length}`);
  console.log(`❌ Required missing: ${missing.length}`);
  console.log(`❌ Invalid format: ${invalid.length}`);
  
  if (missing.length > 0 || invalid.length > 0) {
    console.log('\n🚨 Environment check failed!');
    console.log('Please set the required environment variables before starting the application.');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Some optional environment variables are missing.');
    console.log('The application will work but some features may be limited.');
  }
  
  console.log('\n✅ Environment check passed!');
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkEnvironment();
}

export { checkEnvironment, envChecks };


