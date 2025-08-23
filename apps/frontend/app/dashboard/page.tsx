import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  // Mock data for demonstration
  const recentAnalyses = [
    {
      id: '1',
      repository: 'my-app',
      branch: 'main',
      status: 'completed',
      score: 85,
      issues: 12,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      repository: 'api-service',
      branch: 'feature/auth',
      status: 'processing',
      score: null,
      issues: null,
      createdAt: '2024-01-15T09:15:00Z',
    },
    {
      id: '3',
      repository: 'frontend-components',
      branch: 'main',
      status: 'completed',
      score: 92,
      issues: 8,
      createdAt: '2024-01-14T16:45:00Z',
    },
  ];

  const stats = [
    { label: 'Total Analyses', value: '24', icon: Activity, color: 'text-blue-500' },
    { label: 'Repositories', value: '8', icon: GitBranch, color: 'text-green-500' },
    { label: 'Issues Found', value: '156', icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Avg Score', value: '87%', icon: TrendingUp, color: 'text-purple-500' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your code analysis activities</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-muted`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Code className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{analysis.repository}</h3>
                          <p className="text-sm text-muted-foreground">
                            {analysis.branch} • {new Date(analysis.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {analysis.score && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{analysis.score}%</p>
                            <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                        )}
                        {analysis.issues && (
                          <div className="text-right">
                            <p className="text-sm font-medium">{analysis.issues}</p>
                            <p className="text-xs text-muted-foreground">Issues</p>
                          </div>
                        )}
                        {getStatusBadge(analysis.status)}
                      </div>
                    </div>
                  ))}
                </div>
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
                <Button variant="outline" className="w-full justify-start">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Connect Repository
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Code className="w-4 h-4 mr-2" />
                  Upload Code
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Scan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Performance Check
                </Button>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
                <CardDescription>This week's activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Analyses completed</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Issues resolved</span>
                    <span className="font-semibold">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Security fixes</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Performance improvements</span>
                    <span className="font-semibold">15</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
