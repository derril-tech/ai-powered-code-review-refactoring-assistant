'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  GitBranch, 
  Github, 
  Gitlab, 
  Plus,
  Settings,
  Trash2,
  ExternalLink,
  Activity
} from 'lucide-react';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  provider: 'github' | 'gitlab' | 'bitbucket';
  status: 'active' | 'inactive' | 'error' | 'pending';
  private: boolean;
  last_analysis_at: string;
  created_at: string;
}

export default function RepositoriesPage() {
  const router = useRouter();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [connectForm, setConnectForm] = useState({
    provider: 'github',
    repository_url: '',
    access_token: '',
    webhook_enabled: true
  });

  useEffect(() => {
    // TODO: Fetch user's repositories
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      // TODO: Implement API call
      const mockRepositories: Repository[] = [
        {
          id: 1,
          name: 'example-repo',
          full_name: 'user/example-repo',
          description: 'An example repository for testing',
          provider: 'github',
          status: 'active',
          private: false,
          last_analysis_at: '2024-01-15T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];
      setRepositories(mockRepositories);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    }
  };

  const handleConnectRepository = async () => {
    setIsConnecting(true);
    try {
      // TODO: Implement repository connection
      console.log('Connecting repository:', connectForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form and hide
      setConnectForm({
        provider: 'github',
        repository_url: '',
        access_token: '',
        webhook_enabled: true
      });
      setShowConnectForm(false);
      
      // Refresh repositories
      fetchRepositories();
    } catch (error) {
      console.error('Failed to connect repository:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectRepository = async (repoId: number) => {
    try {
      // TODO: Implement repository disconnection
      console.log('Disconnecting repository:', repoId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh repositories
      fetchRepositories();
    } catch (error) {
      console.error('Failed to disconnect repository:', error);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'gitlab':
        return <Gitlab className="w-4 h-4" />;
      default:
        return <GitBranch className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive',
      pending: 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Repositories
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your connected Git repositories for automated code analysis
            </p>
          </div>
          <Button onClick={() => setShowConnectForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Connect Repository
          </Button>
        </div>

        {/* Connect Repository Form */}
        {showConnectForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Connect New Repository</CardTitle>
              <CardDescription>
                Connect a Git repository to enable automated code analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select 
                    value={connectForm.provider} 
                    onValueChange={(value) => setConnectForm({...connectForm, provider: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="gitlab">GitLab</SelectItem>
                      <SelectItem value="bitbucket">Bitbucket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="repository_url">Repository URL</Label>
                  <Input
                    id="repository_url"
                    type="url"
                    placeholder="https://github.com/user/repo"
                    value={connectForm.repository_url}
                    onChange={(e) => setConnectForm({...connectForm, repository_url: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="access_token">Access Token (Optional)</Label>
                <Input
                  id="access_token"
                  type="password"
                  placeholder="Personal access token"
                  value={connectForm.access_token}
                  onChange={(e) => setConnectForm({...connectForm, access_token: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="webhook_enabled"
                  checked={connectForm.webhook_enabled}
                  onChange={(e) => setConnectForm({...connectForm, webhook_enabled: e.target.checked})}
                />
                <Label htmlFor="webhook_enabled">Enable webhooks for automatic analysis</Label>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleConnectRepository} 
                  disabled={isConnecting || !connectForm.repository_url}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Repository'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowConnectForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Repositories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo) => (
            <Card key={repo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getProviderIcon(repo.provider)}
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                  </div>
                  {getStatusBadge(repo.status)}
                </div>
                <CardDescription className="line-clamp-2">
                  {repo.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Full Name:</span>
                    <span className="font-mono">{repo.full_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Visibility:</span>
                    <Badge variant={repo.private ? "secondary" : "outline"}>
                      {repo.private ? 'Private' : 'Public'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Analysis:</span>
                    <span>{new Date(repo.last_analysis_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => router.push(`/analysis/new?repo=${repo.id}`)}
                    >
                      <Activity className="w-4 h-4 mr-1" />
                      Analyze
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement repository settings
                        alert('Repository settings coming soon!');
                      }}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Settings
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDisconnectRepository(repo.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {repositories.length === 0 && !showConnectForm && (
          <Card className="text-center py-12">
            <CardContent>
              <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No repositories connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your first repository to start automated code analysis
              </p>
              <Button onClick={() => setShowConnectForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Connect Repository
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


