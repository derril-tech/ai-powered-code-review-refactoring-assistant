// Application Constants
export const APP_NAME = 'AI Code Review Assistant';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Intelligent, automated code review and refactoring powered by AI';

// API Constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
export const API_TIMEOUT = 30000;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Pagination Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;

// Authentication Constants
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// File Upload Constants
export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/x-python',
  'text/javascript',
  'text/typescript',
  'text/x-java-source',
  'text/x-c++src',
  'text/x-csrc',
  'text/x-php',
  'text/x-ruby',
  'text/x-go',
  'text/x-rust',
  'text/x-swift',
  'text/x-kotlin',
  'text/x-scala',
  'text/html',
  'text/css',
  'text/xml',
  'application/json',
  'application/x-yaml',
  'text/markdown',
];

export const ALLOWED_FILE_EXTENSIONS = [
  '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.cs', '.php',
  '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.html', '.css', '.scss',
  '.sass', '.less', '.json', '.xml', '.yaml', '.yml', '.md', '.txt'
];

// Analysis Constants
export const MAX_ANALYSIS_DURATION = 30 * 60 * 1000; // 30 minutes
export const ANALYSIS_PROGRESS_UPDATE_INTERVAL = 1000; // 1 second
export const MAX_FINDINGS_PER_ANALYSIS = 1000;

// WebSocket Constants
export const WS_RECONNECT_ATTEMPTS = 5;
export const WS_RECONNECT_DELAY = 1000; // 1 second
export const WS_HEARTBEAT_INTERVAL = 30000; // 30 seconds

// UI Constants
export const TOAST_DURATION = 5000; // 5 seconds
export const DEBOUNCE_DELAY = 300; // 300ms
export const THROTTLE_DELAY = 100; // 100ms
export const ANIMATION_DURATION = 200; // 200ms

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 10MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported file.',
  ANALYSIS_FAILED: 'Analysis failed. Please try again.',
  WEBSOCKET_CONNECTION_FAILED: 'Failed to connect to server.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ANALYSIS_STARTED: 'Analysis started successfully.',
  ANALYSIS_COMPLETED: 'Analysis completed successfully.',
  FILE_UPLOADED: 'File uploaded successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  ANALYSES: '/analyses',
  ANALYSIS_DETAILS: '/analyses/[id]',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HELP: '/help',
  ABOUT: '/about',
} as const;

// Feature Flags
export const FEATURES = {
  DEMO_MODE: process.env.NEXT_PUBLIC_ENABLE_DEMO === 'true',
  ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  SENTRY: process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true',
  WEBHOOKS: true,
  REAL_TIME_UPDATES: true,
  AUTO_FIX: true,
  TEAM_COLLABORATION: false, // Future feature
} as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'javascript', label: 'JavaScript', icon: '⚡' },
  { value: 'typescript', label: 'TypeScript', icon: '📘' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'csharp', label: 'C#', icon: '🔷' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'swift', label: 'Swift', icon: '🍎' },
  { value: 'kotlin', label: 'Kotlin', icon: '📱' },
  { value: 'scala', label: 'Scala', icon: '⚡' },
] as const;

// Analysis Types
export const ANALYSIS_TYPES = [
  { value: 'full', label: 'Full Analysis', description: 'Comprehensive code review' },
  { value: 'security', label: 'Security', description: 'Security vulnerability scan' },
  { value: 'performance', label: 'Performance', description: 'Performance optimization' },
  { value: 'code_style', label: 'Code Style', description: 'Code style and formatting' },
  { value: 'custom', label: 'Custom', description: 'Custom analysis rules' },
] as const;

// Finding Severities
export const FINDING_SEVERITIES = [
  { value: 'critical', label: 'Critical', color: 'error' },
  { value: 'high', label: 'High', color: 'error' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'low', label: 'Low', color: 'info' },
] as const;

// Finding Types
export const FINDING_TYPES = [
  { value: 'bug', label: 'Bug', icon: '🐛' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'performance', label: 'Performance', icon: '⚡' },
  { value: 'code_style', label: 'Code Style', icon: '🎨' },
  { value: 'maintainability', label: 'Maintainability', icon: '🔧' },
  { value: 'accessibility', label: 'Accessibility', icon: '♿' },
  { value: 'documentation', label: 'Documentation', icon: '📚' },
] as const;
