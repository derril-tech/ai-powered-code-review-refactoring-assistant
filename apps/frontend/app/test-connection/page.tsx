'use client';

import { ConnectionTest } from '@/components/connection-test';

export default function TestConnectionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Backend Connection Test</h1>
        <p className="text-muted-foreground">
          Test the connection between frontend and backend
        </p>
      </div>
      
      <ConnectionTest />
    </div>
  );
}

