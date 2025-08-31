'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  GitBranch, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Code,
  Shield,
  Zap,
  Plus,
  RefreshCw,
  Users,
  FileText,
  Wifi
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useWebSocket } from '@/contexts/websocket-context';
import { ConnectionTest } from '@/components/connection-test';

interface DashboardStats {
  total_analyses: number;
  active_analyses: number;
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  total_proposals: number;
  applied_proposals: number;
  total_repositories: number;
  recent_analyses: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { subscribeToNotifications } = useWebSocket();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setError(null);
      const dashboardStats = await apiClient.getDashboardStats();
      setStats(dashboardStats);
      setRecentAnalyses(dashboardStats.recent_analyses || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load dashboard data');
      console.error('Dashboard data loading error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((message) => {
      // Refresh stats when analyses complete or proposals are applied
      if (message.type === 'done' || message.type === 'proposal_applied') {
        handleRefresh();
      }
    });

    return unsubscribe;
  }, []);

  // Format stats for display
  const formatStatsCards = () => {
    if (!stats) return [];
    
    return [
      { 
        label: 'Total Analyses', 
        value: stats.total_analyses.toString(), 
        icon: Activity, 
        color: 'text-blue-500',
        subtitle: `${stats.active_analyses} active`
      },
      { 
        label: 'Repositories', 
        value: stats.total_repositories.toString(), 
        icon: GitBranch, 
        color: 'text-green-500' 
      },
      { 
        label: 'Critical Issues', 
        value: stats.critical_findings.toString(), 
        icon: AlertTriangle, 
        color: 'text-red-500',
        subtitle: `${stats.high_findings} high priority`
      },
      { 
        label: 'Applied Proposals', 
        value: `${stats.applied_proposals}/${stats.total_proposals}`, 
        icon: CheckCircle, 
        color: 'text-purple-500',
        subtitle: `${Math.round((stats.applied_proposals / Math.max(stats.total_proposals, 1)) * 100)}% applied`
      },
    ];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateAnalysisScore = (analysis: any) => {
    if (!analysis.total_findings) return null;
    const severityWeights = { critical: 10, high: 5, medium: 2, low: 1 };
    const totalWeight = analysis.critical_findings * severityWeights.critical +
                       analysis.high_findings * severityWeights.high +
                       analysis.medium_findings * severityWeights.medium +
                       analysis.low_findings * severityWeights.low;
    return Math.max(0, Math.min(100, 100 - (totalWeight * 2)));
  };

  // Show error if authentication fails
  if (error && error.includes('401')) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your code analysis activities</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => router.push('/analysis/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="connection-test">
              <Wifi className="mr-2 h-4 w-4" />
              Connection Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            formatStatsCards().map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.subtitle && (
                        <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                      )}
                    </div>
                    <div className={`p-2 rounded-lg bg-muted`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Analyses */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
                <CardDescription>Your latest code review activities</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-10 h-10 rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentAnalyses.length === 0 ? (
                  <div className="text-center py-8">
                    <Code className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No analyses yet</h3>
                    <p className="text-muted-foreground mb-4">Start by creating your first analysis</p>
                    <Button onClick={() => router.push('/analysis/new')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Analysis
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAnalyses.map((analysis) => {
                      const score = calculateAnalysisScore(analysis);
                      return (
                        <div 
                          key={analysis.id} 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/analysis/${analysis.id}`)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-lg bg-muted">
                              <Code className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{analysis.repo_name || 'Unknown Repository'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {analysis.branch || 'main'} • {new Date(analysis.created_at).toLocaleDateString()}
                              </p>
                              {analysis.language && (
                                <Badge variant="outline" className="text-xs mt-1">{analysis.language}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {score !== null && (
                              <div className="text-right">
                                <p className="text-sm font-medium">{Math.round(score)}%</p>
                                <p className="text-xs text-muted-foreground">Score</p>
                              </div>
                            )}
                            {analysis.total_findings > 0 && (
                              <div className="text-right">
                                <p className="text-sm font-medium">{analysis.total_findings}</p>
                                <p className="text-xs text-muted-foreground">Issues</p>
                              </div>
                            )}
                            <div className="text-right">
                              <p className="text-sm font-medium">{analysis.progress || 0}%</p>
                              <p className="text-xs text-muted-foreground">Complete</p>
                            </div>
                            {getStatusBadge(analysis.status)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/repositories')}
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Connect Repository
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/analysis/new')}
                >
                  <Code className="w-4 h-4 mr-2" />
                  Upload Code
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/analysis/new?type=security')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security Scan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/proposals')}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  View Proposals
                </Button>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Stats Summary</CardTitle>
                <CardDescription>Current overview</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Analyses completed</span>
                      <span className="font-semibold">{stats?.total_analyses || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total findings</span>
                      <span className="font-semibold">{stats?.total_findings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Critical issues</span>
                      <span className="font-semibold text-red-600">{stats?.critical_findings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Applied proposals</span>
                      <span className="font-semibold text-green-600">{stats?.applied_proposals || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Repositories</span>
                      <span className="font-semibold">{stats?.total_repositories || 0}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          <TabsContent value="connection-test">
            <ConnectionTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
