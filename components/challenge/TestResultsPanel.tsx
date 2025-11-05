"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { TestResult } from '@/types/challenge';

interface TestResultsPanelProps {
  results: TestResult[];
}

export const TestResultsPanel: React.FC<TestResultsPanelProps> = ({ results }) => {
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Results</CardTitle>
        <CardDescription>
          {passed} of {total} tests passed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.map((result) => (
          <Alert
            key={result.testId}
            className={
              result.passed
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-red-500/50 bg-red-500/10'
            }
          >
            <div className="flex items-start gap-3">
              {result.passed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0 space-y-2">
                <AlertDescription>
                  <p className="font-medium text-sm">{result.message}</p>
                  
                  {result.executionTime && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{result.executionTime}ms</span>
                    </div>
                  )}
                  
                  {result.output && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Output:</span>
                        <code className="ml-2 bg-muted px-2 py-0.5 rounded text-xs font-mono">
                          {result.output}
                        </code>
                      </div>
                      
                      {!result.passed && result.expected && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Expected:</span>
                          <code className="ml-2 bg-muted px-2 py-0.5 rounded text-xs font-mono">
                            {result.expected}
                          </code>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {result.error && (
                    <p className="text-xs text-red-500 mt-2 font-mono">
                      Error: {result.error}
                    </p>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};