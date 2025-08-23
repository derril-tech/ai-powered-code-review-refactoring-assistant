import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Shield, 
  Zap, 
  Users, 
  Code, 
  Target,
  Award,
  Heart
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge variant="secondary" className="mb-4">
            <Brain className="w-4 h-4 mr-2" />
            About Us
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            About AI Code Review Assistant
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            We're revolutionizing code review with AI-powered intelligence that helps developers 
            write better, safer, and more maintainable code.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">Our Mission</CardTitle>
              <CardDescription className="text-lg">
                To democratize high-quality code review by making AI-powered analysis 
                accessible to every developer and team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Target className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">Quality Assurance</h3>
                      <p className="text-muted-foreground">
                        Ensure code quality through intelligent analysis and automated checks.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-success mt-1" />
                    <div>
                      <h3 className="font-semibold">Security First</h3>
                      <p className="text-muted-foreground">
                        Proactively identify security vulnerabilities and coding risks.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-6 h-6 text-warning mt-1" />
                    <div>
                      <h3 className="font-semibold">Performance Optimization</h3>
                      <p className="text-muted-foreground">
                        Detect performance bottlenecks and suggest optimizations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-6 h-6 text-info mt-1" />
                    <div>
                      <h3 className="font-semibold">Team Collaboration</h3>
                      <p className="text-muted-foreground">
                        Foster better collaboration through clear, actionable feedback.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Analysis</CardTitle>
                <CardDescription>
                  Advanced machine learning models trained on millions of code samples
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Multi-Language Support</CardTitle>
                <CardDescription>
                  Support for Python, JavaScript, TypeScript, Java, C++, and more
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-warning" />
                </div>
                <CardTitle>Best Practices</CardTitle>
                <CardDescription>
                  Enforce coding standards and industry best practices
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-info" />
                </div>
                <CardTitle>Real-time Feedback</CardTitle>
                <CardDescription>
                  Instant feedback as you code with live analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle>Security Scanning</CardTitle>
                <CardDescription>
                  Comprehensive security vulnerability detection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <CardTitle>Developer Experience</CardTitle>
                <CardDescription>
                  Intuitive interface designed for developers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-8">Built with ❤️ by Developers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our team of experienced developers and AI researchers are passionate about 
            creating tools that make coding better for everyone.
          </p>
        </section>
      </div>
    </div>
  );
}
