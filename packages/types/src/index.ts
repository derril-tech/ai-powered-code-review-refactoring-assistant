import { z } from 'zod';

// User related types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  created_at: z.date(),
  updated_at: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Analysis related types
export const AnalysisStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);
export type AnalysisStatus = z.infer<typeof AnalysisStatusSchema>;

export const AnalysisSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  repository_url: z.string().url(),
  branch: z.string().default('main'),
  status: AnalysisStatusSchema,
  results: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

// API Response types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// WebSocket message types
export const WebSocketMessageSchema = z.object({
  type: z.enum(['analysis_update', 'error', 'status']),
  payload: z.any(),
  timestamp: z.date(),
});

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// File analysis types
export const FileAnalysisSchema = z.object({
  file_path: z.string(),
  issues: z.array(z.object({
    line: z.number(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string(),
    suggestion: z.string().optional(),
  })),
  score: z.number().min(0).max(100),
});

export type FileAnalysis = z.infer<typeof FileAnalysisSchema>;

// Repository analysis types
export const RepositoryAnalysisSchema = z.object({
  repository_url: z.string().url(),
  branch: z.string(),
  files: z.array(FileAnalysisSchema),
  overall_score: z.number().min(0).max(100),
  summary: z.string(),
  recommendations: z.array(z.string()),
});

export type RepositoryAnalysis = z.infer<typeof RepositoryAnalysisSchema>;
