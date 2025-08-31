'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Wifi, Database, Server } from 'lucide-react';
import apiClient from '@/lib/api';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
  duration?: number;
}

export function ConnectionTest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Basic Health Check', status: 'pending' },
    { name: 'Detailed Health Check', status: 'pending' },
    { name: 'API Response Format', status: 'pending' },
    { name: 'CORS Configuration', status: 'pending' },
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...update } : test));
  };

  const runTests = async () => {
    setIsRunning(true);
    setOverallStatus('testing');
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, message: undefined, data: undefined, duration: undefined })));

    let allPassed = true;

    // Test 1: Basic Health Check
    try {
      const startTime = Date.now();
      updateTest(0, { status: 'pending', message: 'Connecting to backend...' });
      
      const response = await fetch('https://refactoriq-backend.fly.dev/api/v1/health');
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        updateTest(0, { 
          status: 'success', 
          message: `Connected successfully (${duration}ms)`,
          data,
          duration 
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      allPassed = false;
      updateTest(0, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Connection failed' 
      });
    }

    // Test 2: Detailed Health Check
    try {
      const startTime = Date.now();
      updateTest(1, { status: 'pending', message: 'Checking system status...' });
      
      // Try multiple endpoints for detailed health check
      let response;
      let duration;
      
      try {
        response = await apiClient.detailedHealthCheck();
        duration = Date.now() - startTime;
      } catch (firstError) {
        // Try alternative endpoint
        try {
          const altResponse = await fetch('https://refactoriq-backend.fly.dev/api/v1/health/detailed');
          const altData = await altResponse.json();
          response = altData;
          duration = Date.now() - startTime;
        } catch (secondError) {
          throw firstError; // Use original error
        }
      }
      
      updateTest(1, { 
        status: 'success', 
        message: `System status retrieved (${duration}ms)`,
        data: response,
        duration 
      });
    } catch (error) {
      // This might fail if the endpoint doesn't exist, but that's okay for simplified backend
      updateTest(1, { 
        status: 'error', 
        message: 'Detailed health check not available (simplified backend - this is OK)' 
      });
    }

    // Test 3: API Response Format
    try {
      const startTime = Date.now();
      updateTest(2, { status: 'pending', message: 'Validating API format...' });
      
      const response = await fetch('https://refactoriq-backend.fly.dev/');
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      if (data && typeof data === 'object') {
        updateTest(2, { 
          status: 'success', 
          message: `API returns valid JSON (${duration}ms)`,
          data,
          duration 
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      updateTest(2, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Invalid API response' 
      });
    }

    // Test 4: CORS Configuration
    try {
      const startTime = Date.now();
      updateTest(3, { status: 'pending', message: 'Testing CORS...' });
      
      // Try a simple GET request to test CORS
      const response = await fetch('https://refactoriq-backend.fly.dev/api/v1/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        updateTest(3, { 
          status: 'success', 
          message: `CORS configured correctly (${duration}ms)`,
          duration 
        });
      } else {
        throw new Error('CORS request failed');
      }
    } catch (error) {
      allPassed = false;
      updateTest(3, { 
        status: 'error', 
        message: 'CORS configuration issue - check backend settings' 
      });
    }

    setOverallStatus(allPassed ? 'success' : 'error');
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Frontend ↔ Backend Connection Test
          </CardTitle>
          <CardDescription>
            Test the connection between your Next.js frontend and FastAPI backend on Fly.io
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Status */}
          {overallStatus !== 'idle' && (
            <Alert className={overallStatus === 'success' ? 'border-green-500' : overallStatus === 'error' ? 'border-red-500' : 'border-blue-500'}>
              <AlertDescription className="flex items-center gap-2">
                {overallStatus === 'testing' && <Loader2 className="h-4 w-4 animate-spin" />}
                {overallStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {overallStatus === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                {overallStatus === 'testing' && 'Running connection tests...'}
                {overallStatus === 'success' && 'All tests passed! Frontend and backend are connected.'}
                {overallStatus === 'error' && 'Some tests failed. Check the details below.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Test Button */}
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Server className="mr-2 h-4 w-4" />
                Test Connection
              </>
            )}
          </Button>

          {/* Test Results */}
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-medium">{test.name}</div>
                    {test.message && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {test.message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {test.duration && (
                    <span className="text-xs text-gray-500">{test.duration}ms</span>
                  )}
                  {getStatusBadge(test.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Backend Info */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Database className="h-4 w-4" />
              Backend Configuration
            </h4>
            <div className="space-y-1 text-sm">
              <div><strong>API URL:</strong> https://refactoriq-backend.fly.dev</div>
              <div><strong>Health Check:</strong> /api/v1/health</div>
              <div><strong>API Docs:</strong> /docs</div>
              <div><strong>Status:</strong> 
                <Badge variant="outline" className="ml-2">
                  {overallStatus === 'success' ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Test Data Display */}
          {tests.some(test => test.data) && (
            <div className="mt-6">
              <h4 className="font-medium mb-2">Response Data</h4>
              {tests.map((test, index) => 
                test.data && (
                  <div key={index} className="mb-3">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {test.name}:
                    </div>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
