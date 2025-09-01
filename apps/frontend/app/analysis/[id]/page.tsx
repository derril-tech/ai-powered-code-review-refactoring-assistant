'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Code,
  Shield,
  Zap,
  FileCode,
  GitBranch,
  Calendar,
  User,
  Download,
  RefreshCw,
  Eye,
  ExternalLink
} from 'lucide-react';
import apiClient from '@/lib/api';

interface Analysis {
  id: number;
  repo_name: string;
  repo_url?: string;
  branch: string;
  language: string;
  analysis_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  created_at: string;
  completed_at?: string;
  processing_time?: number;
}

interface Finding {
  id: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file_path: string;
  line_number: number;
  rule_id: string;
  confidence: number;
  category: string;
}

export default function AnalysisDetailPage() {
  const router = useRouter();
  const params = useParams();
  const analysisId = parseInt(params.id as string);

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (analysisId) {
      loadAnalysisData();
    }
  }, [analysisId]);

  const loadAnalysisData = async () => {
    try {
      setError(null);
      
      // Load analysis details using direct fetch
      const response = await fetch(`https://refactoriq-backend.fly.dev/api/v1/analyses/${analysisId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const analysisData = await response.json();
      setAnalysis(analysisData);
      
      // If backend returns findings in future, set them here. No mock data.
      if (Array.isArray(analysisData.findings)) {
        setFindings(analysisData.findings);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to load analysis');
      console.error('Failed to load analysis:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalysisData();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Code className="w-4 h-4" />;
      default: return <FileCode className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500 dark:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Activity className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAnalysisTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Analysis not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{analysis.repo_name}</h1>
              <p className="text-muted-foreground">Analysis #{analysis.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {getStatusBadge(analysis.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            {analysis.status === 'processing' && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Progress</CardTitle>
                  <CardDescription>
                    Your code is being analyzed...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{analysis.progress}%</span>
                    </div>
                    <Progress value={analysis.progress} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Findings */}
            <Card>
              <CardHeader>
                <CardTitle>Findings ({findings.length})</CardTitle>
                <CardDescription>
                  Issues and suggestions found in your code
                </CardDescription>
              </CardHeader>
              <CardContent>
                {findings.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 dark:text-green-400" />
                    <h3 className="font-semibold mb-2">No issues found!</h3>
                    <p className="text-muted-foreground">
                      Your code looks great. No critical issues were detected.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {findings.map((finding) => (
                      <div 
                        key={finding.id}
                        className={`p-4 rounded-lg border ${getSeverityColor(finding.severity)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getSeverityIcon(finding.severity)}
                            <div className="flex-1">
                              <h3 className="font-semibold">{finding.title}</h3>
                              <p className="text-sm mt-1">{finding.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                <span>{finding.file_path}:{finding.line_number}</span>
                                <span>Rule: {finding.rule_id}</span>
                                <span>Confidence: {(finding.confidence * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {finding.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Analysis Info */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <div className="flex items-center space-x-1">
                    {getAnalysisTypeIcon(analysis.analysis_type)}
                    <span className="capitalize">{analysis.analysis_type}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Language:</span>
                  <Badge variant="outline">{analysis.language}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Branch:</span>
                  <div className="flex items-center space-x-1">
                    <GitBranch className="w-3 h-3" />
                    <span>{analysis.branch}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {analysis.completed_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed:</span>
                    <span>{new Date(analysis.completed_at).toLocaleDateString()}</span>
                  </div>
                )}
                {analysis.processing_time && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{analysis.processing_time}s</span>
                  </div>
                )}
                {analysis.repo_url && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(analysis.repo_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Repository
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Findings:</span>
                  <span className="font-semibold">{analysis.total_findings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Critical:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{analysis.critical_findings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">High:</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{analysis.high_findings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium:</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">{analysis.medium_findings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{analysis.low_findings}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    // TODO: Implement export functionality
                    alert('Export functionality coming soon!');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => router.push('/proposals')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Proposals
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
