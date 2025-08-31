'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Play,
  Download,
  Copy,
  Eye
} from 'lucide-react';

export default function DemoPage() {
  const router = useRouter();
  
  // Sample code for demo
  const sampleCode = `def calculate_fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

def process_user_data(user_input):
    # TODO: Add input validation
    result = user_input.strip()
    return result.upper()

def connect_database():
    password = "hardcoded_password_123"  # Security issue
    connection_string = f"postgresql://user:{password}@localhost/db"
    return connection_string

class UserManager:
    def __init__(self):
        self.users = []
    
    def add_user(self, user):
        # Missing validation
        self.users.append(user)
        return True`;

  const analysisResults = [
    {
      type: 'security',
      severity: 'high',
      message: 'Hardcoded password detected',
      line: 12,
      suggestion: 'Use environment variables for sensitive data',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
    {
      type: 'performance',
      severity: 'medium',
      message: 'Recursive function may cause stack overflow',
      line: 1,
      suggestion: 'Consider using iterative approach for large numbers',
      icon: Info,
      color: 'text-yellow-500',
    },
    {
      type: 'quality',
      severity: 'low',
      message: 'Missing input validation',
      line: 8,
      suggestion: 'Add proper input validation and error handling',
      icon: Info,
      color: 'text-blue-500',
    },
    {
      type: 'best_practice',
      severity: 'medium',
      message: 'TODO comment found',
      line: 7,
      suggestion: 'Implement input validation or remove TODO',
      icon: Info,
      color: 'text-orange-500',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Code className="w-4 h-4 mr-2" />
            Interactive Demo
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            Try AI Code Review
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the power of AI-powered code analysis with our interactive demo. 
            See how our system detects issues and provides actionable recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Code Editor */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Sample Code</CardTitle>
                  <CardDescription>Python code with various issues</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(sampleCode);
                      alert('Code copied to clipboard!');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([sampleCode], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'sample-code.py';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 overflow-x-auto">
                <pre>{sampleCode}</pre>
              </div>
              <div className="mt-4 flex justify-center">
                <Button 
                  className="w-full"
                  onClick={() => {
                    // TODO: Implement demo analysis
                    alert('Demo analysis coming soon! Try the real analysis in New Analysis.');
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Analyze This Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>AI-detected issues and recommendations</CardDescription>
                </div>
                <Badge variant="outline">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  4 Issues Found
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisResults.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-muted`}>
                        <issue.icon className={`w-4 h-4 ${issue.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className={`${getSeverityColor(issue.severity)} text-white border-0`}
                          >
                            {issue.severity}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Line {issue.line}
                          </span>
                        </div>
                        <h4 className="font-semibold mb-1">{issue.message}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {issue.suggestion}
                        </p>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Highlight */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">What Our AI Detects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="font-semibold mb-2">Security Issues</h3>
                <p className="text-sm text-muted-foreground">
                  Hardcoded secrets, SQL injection, XSS vulnerabilities
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Info className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="font-semibold mb-2">Performance Issues</h3>
                <p className="text-sm text-muted-foreground">
                  Inefficient algorithms, memory leaks, slow queries
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Code Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Code smells, anti-patterns, maintainability issues
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Best Practices</h3>
                <p className="text-sm text-muted-foreground">
                  Coding standards, documentation, naming conventions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of developers who are already using AI Code Review Assistant 
                to write better, safer code.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => router.push('/auth/register')}
                >
                  Start Free Trial
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/about')}
                >
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
