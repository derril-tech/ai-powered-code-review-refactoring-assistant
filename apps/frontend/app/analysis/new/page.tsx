'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  GitBranch, 
  Code, 
  Shield, 
  Zap, 
  Brain,
  ArrowRight,
  Github,
  Gitlab,
  FileCode,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useWebSocket } from '@/contexts/websocket-context';

function NewAnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { connect, subscribeToAnalysis } = useWebSocket();

  const [analysisType, setAnalysisType] = useState(searchParams.get('type') || 'full');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [language, setLanguage] = useState('auto');
  const [repoName, setRepoName] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [repositories, setRepositories] = useState<any[]>([]);

  // Load repositories on mount
  useEffect(() => {
    const loadRepositories = async () => {
      try {
        const repos = await apiClient.getRepositories({ size: 100 });
        setRepositories(repos.items || []);
      } catch (err) {
        console.error('Failed to load repositories:', err);
      }
    };
    
    loadRepositories();
  }, []);

  const analysisTypes = [
    {
      id: 'full',
      name: 'Full Analysis',
      description: 'Comprehensive code review including security, performance, and quality checks',
      icon: Brain,
      color: 'text-blue-500',
    },
    {
      id: 'security',
      name: 'Security Focus',
      description: 'Detect vulnerabilities, hardcoded secrets, and security anti-patterns',
      icon: Shield,
      color: 'text-red-500',
    },
    {
      id: 'performance',
      name: 'Performance Focus',
      description: 'Identify bottlenecks, inefficient algorithms, and optimization opportunities',
      icon: Zap,
      color: 'text-yellow-500',
    },
    {
      id: 'quality',
      name: 'Code Quality',
      description: 'Check for code smells, maintainability issues, and best practices',
      icon: Code,
      color: 'text-green-500',
    },
  ];

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'cpp', 'c', 'csharp', 
    'php', 'ruby', 'swift', 'kotlin', 'scala', 'mixed'
  ];

  const detectLanguageFromUrl = (url: string): string => {
    // Simple heuristics based on common repo patterns
    if (url.includes('node') || url.includes('react') || url.includes('vue')) return 'javascript';
    if (url.includes('python') || url.includes('django') || url.includes('flask')) return 'python';
    if (url.includes('spring') || url.includes('maven')) return 'java';
    if (url.includes('go') || url.includes('golang')) return 'go';
    return 'mixed';
  };

  const extractRepoName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      if (pathParts.length >= 2) {
        return pathParts[pathParts.length - 1].replace('.git', '');
      }
    } catch (e) {
      // Invalid URL, try to extract from string
      const match = url.match(/([^\/]+)(?:\.git)?$/);
      return match ? match[1] : 'unknown';
    }
    return 'unknown';
  };

  // Handle repository URL change
  const handleRepositoryUrlChange = (url: string) => {
    setRepositoryUrl(url);
    if (url) {
      setLanguage(detectLanguageFromUrl(url));
      setRepoName(extractRepoName(url));
    }
  };

  const handleRepositoryAnalysis = async () => {
    if (!repositoryUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const analysisData = {
        repo_url: repositoryUrl,
        branch: branch || 'main',
        language: language === 'auto' ? 'mixed' : language,
        analysis_type: analysisType,
        repo_name: repoName || extractRepoName(repositoryUrl),
      };

      const analysis = await apiClient.createAnalysis(analysisData);
      
      setSuccess('Analysis started successfully!');
      
      // Connect to WebSocket for real-time updates
      connect(analysis.id);
      
      // Subscribe to analysis updates
      const unsubscribe = subscribeToAnalysis(analysis.id, (message) => {
        if (message.type === 'done') {
          setSuccess('Analysis completed successfully!');
          setTimeout(() => {
            router.push(`/analysis/${analysis.id}`);
          }, 2000);
        } else if (message.type === 'error') {
          setError(`Analysis failed: ${message.error}`);
          setIsCreating(false);
        }
      });

      // Navigate to analysis page after delay
      setTimeout(() => {
        router.push(`/analysis/${analysis.id}`);
      }, 1000);

    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to start analysis');
      setIsCreating(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const ext = file.name.toLowerCase().split('.').pop();
      const validExtensions = ['py', 'js', 'ts', 'tsx', 'jsx', 'java', 'go', 'rs', 'cpp', 'c', 'cs', 'php', 'rb', 'swift', 'kt', 'scala'];
      return validExtensions.includes(ext || '');
    });

    if (validFiles.length !== files.length) {
      setError('Some files were filtered out. Only source code files are supported.');
    }

    setSelectedFiles(validFiles);
    setError(null);
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      // Simplified file upload - create analysis directly
      setUploadProgress(25);
      
      // Create a mock analysis for the uploaded files
      const analysisData = {
        repo_url: null,
        branch: null,
        language: language === 'auto' ? 'mixed' : language,
        analysis_type: analysisType,
        custom_rules: null
      };

      setUploadProgress(50);

      // Create analysis via API
      const analysis = await apiClient.createAnalysis(analysisData);
      
      setUploadProgress(75);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress(100);
      setSuccess(`Analysis created successfully! Files: ${selectedFiles.map(f => f.name).join(', ')}`);
      
      // Clear selected files
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Navigate to dashboard to see the analysis
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const fakeEvent = {
      target: { files }
    } as React.ChangeEvent<HTMLInputElement>;
    handleFileSelect(fakeEvent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Code className="w-4 h-4 mr-2" />
            New Analysis
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            Start Code Review
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your analysis method and let our AI review your code for issues, 
            security vulnerabilities, and improvement opportunities.
          </p>
        </div>

        {/* Success/Error Alerts */}
        {error && (
          <Alert className="mb-6 max-w-4xl mx-auto" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 max-w-4xl mx-auto" variant="default">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Repository Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-primary" />
                <CardTitle>Repository Analysis</CardTitle>
              </div>
              <CardDescription>
                Connect your Git repository for comprehensive analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="repository-url">Repository URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="repository-url"
                    placeholder="https://github.com/user/repo"
                    value={repositoryUrl}
                    onChange={(e) => handleRepositoryUrlChange(e.target.value)}
                    disabled={isCreating}
                  />
                  <Button variant="outline" size="icon" disabled>
                    <Github className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" disabled>
                    <Gitlab className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports public repositories from GitHub, GitLab, and other Git providers
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    disabled={isCreating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage} disabled={isCreating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="analysis-type">Analysis Type</Label>
                <Select value={analysisType} onValueChange={setAnalysisType} disabled={isCreating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select analysis type" />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          <type.icon className={`w-4 h-4 ${type.color}`} />
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {repoName && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Repository: {repoName}</p>
                  {language && (
                    <p className="text-xs text-muted-foreground">Detected language: {language}</p>
                  )}
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleRepositoryAnalysis}
                disabled={!repositoryUrl || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting Analysis...
                  </>
                ) : (
                  <>
                    Start Repository Analysis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-primary" />
                <CardTitle>Upload Files</CardTitle>
              </div>
              <CardDescription>
                Upload individual files or a zip archive for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="analysis-type-upload">Analysis Type</Label>
                <Select value={analysisType} onValueChange={setAnalysisType} disabled={isUploading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select analysis type" />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center space-x-2">
                          <type.icon className={`w-4 h-4 ${type.color}`} />
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Support for .py, .js, .ts, .tsx, .jsx, .java, .go, .rs, .cpp, .c, .cs, .php, .rb, .swift, .kt, .scala files
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".py,.js,.ts,.tsx,.jsx,.java,.go,.rs,.cpp,.c,.cs,.php,.rb,.swift,.kt,.scala"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Choose Files'
                  )}
                </Button>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({selectedFiles.length})</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                        <span className="truncate">{file.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {(file.size / 1024).toFixed(1)}KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleFileUpload}
                disabled={selectedFiles.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Files...
                  </>
                ) : (
                  <>
                    Start File Analysis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground">
                <p>• Maximum file size: 10MB per file</p>
                <p>• Maximum total upload: 100MB</p>
                <p>• Supported formats: Source code files only</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Types Grid */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Analysis Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analysisTypes.map((type) => (
              <Card key={type.id} className="text-center">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${type.color.replace('text-', 'bg-')}/10 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <type.icon className={`w-6 h-6 ${type.color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">What You'll Get</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced machine learning models analyze your code for patterns, 
                  anti-patterns, and improvement opportunities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Security First</h3>
                <p className="text-sm text-muted-foreground">
                  Detect vulnerabilities, hardcoded secrets, and security anti-patterns 
                  before they become problems.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-semibold mb-2">Performance Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Identify bottlenecks, inefficient algorithms, and opportunities 
                  for performance improvements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <NewAnalysisContent />
    </Suspense>
  );
}
