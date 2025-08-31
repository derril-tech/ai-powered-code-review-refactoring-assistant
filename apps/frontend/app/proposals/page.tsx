'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Wrench, 
  CheckCircle, 
  XCircle, 
  Eye,
  GitPullRequest,
  Zap,
  Shield,
  Code,
  FileCode,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Search
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useWebSocket } from '@/contexts/websocket-context';

interface Proposal {
  id: number;
  finding_id: number;
  title: string;
  description: string;
  proposal_type: 'bug_fix' | 'security_fix' | 'performance_improvement' | 'code_quality' | 'refactoring' | 'documentation';
  patch_diff: string;
  test_patch_diff?: string;
  confidence_score: number;
  estimated_impact?: string;
  risk_score?: number;
  status: 'pending' | 'validating' | 'applying' | 'applied' | 'rejected' | 'failed' | 'pr_created';
  applied_at?: string;
  applied_by?: number;
  pr_url?: string;
  pr_number?: number;
  commit_sha?: string;
  ai_model_used?: string;
  processing_time?: number;
  tags?: any;
  validation_errors?: any;
  application_log?: string;
  rollback_info?: any;
  created_at: string;
  updated_at: string;
}

export default function ProposalsPage() {
  const router = useRouter();
  const { subscribeToNotifications } = useWebSocket();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [refreshing, setRefreshing] = useState(false);
  
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    confidence_min: 0,
    page: 1,
    size: 20
  });
  
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current: 1
  });

  // Load proposals on mount and when filters change
  useEffect(() => {
    fetchProposals();
  }, [filters.page, filters.size]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((message) => {
      if (message.type === 'proposal_applied' || message.type === 'proposal_created') {
        handleRefresh();
      }
    });

    return unsubscribe;
  }, []);

  const fetchProposals = async () => {
    try {
      setError(null);
      
      const params = {
        page: filters.page,
        size: filters.size,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { proposal_type: filters.type }),
      };

      const response = await apiClient.getProposals(params);
      setProposals(response.items);
      setPagination({
        total: response.total,
        pages: response.pages,
        current: response.page
      });

    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch proposals');
      console.error('Failed to fetch proposals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProposals();
  };

  const handleApplyProposal = async (proposalId: number, createPr: boolean = true) => {
    try {
      setActionLoading(prev => ({ ...prev, [proposalId]: createPr ? 'creating_pr' : 'applying' }));
      
      const result = await apiClient.applyProposal(proposalId, {
        auto_apply: !createPr,
        create_pr: createPr,
        pr_title: `Fix: ${proposals.find(p => p.id === proposalId)?.title}`,
        pr_description: proposals.find(p => p.id === proposalId)?.description
      });

      if (result.success) {
        // Update proposal status
        setProposals(prev => prev.map(p => 
          p.id === proposalId ? { 
            ...p, 
            status: createPr ? 'pr_created' : 'applied',
            pr_url: result.pr_url,
            applied_at: new Date().toISOString()
          } : p
        ));

        if (result.pr_url) {
          // Show success with PR link
          setError(null);
        }
      } else {
        throw new Error(result.message);
      }
      
    } catch (error: any) {
      setError(error.response?.data?.detail || error.message || 'Failed to apply proposal');
      console.error('Failed to apply proposal:', error);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[proposalId];
        return newState;
      });
    }
  };

  const handleRejectProposal = async (proposalId: number, reason?: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [proposalId]: 'rejecting' }));
      
      const result = await apiClient.rejectProposal(proposalId, reason);
      
      if (result.success) {
        // Update proposal status
        setProposals(prev => prev.map(p => 
          p.id === proposalId ? { ...p, status: 'rejected' } : p
        ));
      }
      
    } catch (error: any) {
      setError(error.response?.data?.detail || error.message || 'Failed to reject proposal');
      console.error('Failed to reject proposal:', error);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[proposalId];
        return newState;
      });
    }
  };

  const handlePreviewProposal = async (proposal: Proposal) => {
    try {
      setSelectedProposal(proposal);
      setShowPreview(true);
      
      // Fetch preview data
      const preview = await apiClient.getProposalPreview(proposal.id);
      setPreviewData(preview);
      
    } catch (error: any) {
      setError(error.response?.data?.detail || error.message || 'Failed to load preview');
      console.error('Failed to load preview:', error);
    }
  };

  const getProposalTypeIcon = (type: string) => {
    switch (type) {
      case 'security_fix':
        return <Shield className="w-4 h-4" />;
      case 'performance_improvement':
        return <Zap className="w-4 h-4" />;
      case 'bug_fix':
        return <Wrench className="w-4 h-4" />;
      case 'code_quality':
        return <Code className="w-4 h-4" />;
      case 'refactoring':
        return <FileCode className="w-4 h-4" />;
      default:
        return <Wrench className="w-4 h-4" />;
    }
  };

  const getProposalTypeColor = (type: string) => {
    switch (type) {
      case 'security_fix':
        return 'text-red-500';
      case 'performance_improvement':
        return 'text-yellow-500';
      case 'bug_fix':
        return 'text-blue-500';
      case 'code_quality':
        return 'text-green-500';
      case 'refactoring':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      applied: 'default',
      rejected: 'destructive',
      failed: 'secondary'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Filter proposals by confidence score (client-side filtering for confidence)
  const filteredProposals = proposals.filter(proposal => {
    if (proposal.confidence_score < filters.confidence_min) return false;
    return true;
  });

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Auto-Fix Proposals
            </h1>
            <p className="text-muted-foreground mt-2">
              Review and apply AI-generated code fixes with confidence scoring
            </p>
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
              Start Analysis
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters({...filters, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type-filter">Type</Label>
                <Select 
                  value={filters.type} 
                  onValueChange={(value) => setFilters({...filters, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="bug_fix">Bug Fix</SelectItem>
                    <SelectItem value="security_fix">Security Fix</SelectItem>
                    <SelectItem value="performance_improvement">Performance</SelectItem>
                    <SelectItem value="code_quality">Code Quality</SelectItem>
                    <SelectItem value="refactoring">Refactoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="confidence-filter">Min Confidence</Label>
                <Input
                  id="confidence-filter"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={filters.confidence_min}
                  onChange={(e) => setFilters({...filters, confidence_min: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposals List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-5 h-5" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                    <div className="flex space-x-2 pt-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={getProposalTypeColor(proposal.proposal_type)}>
                        {getProposalTypeIcon(proposal.proposal_type)}
                      </div>
                      <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    </div>
                    {getStatusBadge(proposal.status)}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {proposal.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Finding ID:</span>
                      <span className="font-mono">#{proposal.finding_id}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className={`font-semibold ${getConfidenceColor(proposal.confidence_score)}`}>
                        {(proposal.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    {proposal.estimated_impact && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Impact:</span>
                        <Badge variant="outline" className="capitalize">
                          {proposal.estimated_impact}
                        </Badge>
                      </div>
                    )}
                    {proposal.risk_score !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Risk:</span>
                        <span className="font-semibold">
                          {(proposal.risk_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                    {proposal.pr_url && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">PR:</span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto"
                          onClick={() => window.open(proposal.pr_url, '_blank')}
                        >
                          #{proposal.pr_number} <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePreviewProposal(proposal)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      {proposal.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApplyProposal(proposal.id, true)}
                            disabled={!!actionLoading[proposal.id]}
                          >
                            {actionLoading[proposal.id] === 'creating_pr' ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <GitPullRequest className="w-4 h-4 mr-1" />
                            )}
                            Create PR
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApplyProposal(proposal.id, false)}
                            disabled={!!actionLoading[proposal.id]}
                          >
                            {actionLoading[proposal.id] === 'applying' ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-1" />
                            )}
                            Apply
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectProposal(proposal.id)}
                            disabled={!!actionLoading[proposal.id]}
                          >
                            {actionLoading[proposal.id] === 'rejecting' ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-1" />
                            )}
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredProposals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
              <p className="text-muted-foreground">
                Run an analysis to generate auto-fix proposals
              </p>
            </CardContent>
          </Card>
        )}

        {/* Proposal Preview Modal */}
        {showPreview && selectedProposal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Proposal Preview</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPreview(false)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Changes Preview</h3>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      <pre className="whitespace-pre-wrap">
                        {/* TODO: Show actual diff */}
                        + // Fixed SQL injection vulnerability
                        + query = "SELECT * FROM users WHERE id = %s"
                        - query = "SELECT * FROM users WHERE id = " + user_id
                      </pre>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {(selectedProposal.confidence_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {selectedProposal.estimated_impact}
                      </div>
                      <div className="text-sm text-muted-foreground">Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">
                        {(selectedProposal.risk_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Risk</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


