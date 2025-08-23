'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  FileCode
} from 'lucide-react';

export default function NewAnalysisPage() {
  const [analysisType, setAnalysisType] = useState('full');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleRepositoryAnalysis = () => {
    // TODO: Implement repository analysis
    console.log('Starting repository analysis:', { repositoryUrl, branch, analysisType });
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 2000);
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
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Github className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Gitlab className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  placeholder="main"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="analysis-type">Analysis Type</Label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
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

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleRepositoryAnalysis}
                disabled={!repositoryUrl}
              >
                Start Repository Analysis
                <ArrowRight className="w-4 h-4 ml-2" />
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
                <Select value={analysisType} onValueChange={setAnalysisType}>
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

              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <FileCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Support for .py, .js, .ts, .java, .go, .cpp, .c, .cs, .php, .rb files
                </p>
                <Button variant="outline" onClick={handleFileUpload} disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Choose Files'}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>• Maximum file size: 10MB per file</p>
                <p>• Maximum total size: 100MB</p>
                <p>• Supported formats: Source code files and archives</p>
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
