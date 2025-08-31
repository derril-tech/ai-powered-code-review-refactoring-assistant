import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Shield, 
  Zap, 
  GitBranch, 
  Eye, 
  Brain, 
  CheckCircle, 
  ArrowRight,
  PlayCircle,
  Github,
  Gitlab,
  Terminal
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Brain className="w-4 h-4 mr-2" />
              AI-Powered
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
              Code Review Assistant
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
              Intelligent, automated code review and refactoring powered by advanced AI. 
              Detect bugs, security vulnerabilities, and performance issues in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-lg mx-auto">
              <div className="flex-1">
                <Button asChild size="lg" className="w-full text-lg px-8 py-6 h-16 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 bg-gradient-to-r from-primary to-primary/90">
                  <Link href="/auth/register" className="flex items-center justify-center">
                    <span>Get Started Free</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">No credit card required</p>
              </div>
              
              <div className="flex-1">
                <Button asChild variant="outline" size="lg" className="w-full text-lg px-8 py-6 h-16 font-semibold border-2 hover:bg-muted/50 hover:scale-105 transition-all duration-200">
                  <Link href="/demo" className="flex items-center justify-center">
                    <span>Try Demo</span>
                    <PlayCircle className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">See it in action</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose AI Code Review Assistant?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Leverage the power of AI to catch issues that traditional tools miss
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Intelligent Analysis</CardTitle>
                <CardDescription>
                  AI-powered detection of code smells, anti-patterns, and potential bugs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Security First</CardTitle>
                <CardDescription>
                  Proactive scanning for security vulnerabilities and insecure coding practices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-warning" />
                </div>
                <CardTitle>Performance Optimization</CardTitle>
                <CardDescription>
                  Identify performance bottlenecks and recommend optimizations
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                  <GitBranch className="w-6 h-6 text-info" />
                </div>
                <CardTitle>Git Integration</CardTitle>
                <CardDescription>
                  Seamless integration with GitHub, GitLab, and other version control systems
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Real-time Feedback</CardTitle>
                <CardDescription>
                  Get instant feedback with live progress updates and detailed reports
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Auto-fix Suggestions</CardTitle>
                <CardDescription>
                  AI-generated refactoring suggestions with automatic application
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Multi-Language Support
            </h2>
            <p className="text-xl text-muted-foreground">
              Supporting all major programming languages and frameworks
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'Python', icon: '🐍' },
              { name: 'JavaScript', icon: '⚡' },
              { name: 'TypeScript', icon: '📘' },
              { name: 'Java', icon: '☕' },
              { name: 'C#', icon: '🔷' },
              { name: 'Go', icon: '🐹' },
              { name: 'Rust', icon: '🦀' },
              { name: 'PHP', icon: '🐘' },
              { name: 'Ruby', icon: '💎' },
              { name: 'Swift', icon: '🍎' },
              { name: 'Kotlin', icon: '📱' },
              { name: 'Scala', icon: '⚡' },
            ].map((lang) => (
              <Card key={lang.name} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-2">{lang.icon}</div>
                  <p className="font-medium">{lang.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-muted-foreground">
              Works with your existing development workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Github className="w-8 h-8 text-white" />
                </div>
                <CardTitle>GitHub</CardTitle>
                <CardDescription>
                  Direct integration with GitHub repositories and pull requests
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Gitlab className="w-8 h-8 text-white" />
                </div>
                <CardTitle>GitLab</CardTitle>
                <CardDescription>
                  Full support for GitLab CI/CD pipelines and merge requests
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Terminal className="w-8 h-8 text-white" />
                </div>
                <CardTitle>CLI & API</CardTitle>
                <CardDescription>
                  Command-line interface and REST API for custom integrations
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Code Review Process?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust AI Code Review Assistant to maintain 
            high code quality and catch issues before they reach production.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6 min-w-[200px]">
            <Link href="/auth/register">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
