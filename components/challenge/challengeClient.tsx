"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Challenge, TestCase } from '@/types/challenge';
import { ChallengeHeader } from './ChallengeHeader';
import { ChallengeDescription } from './ChallengeDescription';
import { CodeEditor } from './CodeEditor';
import { TestResultsPanel } from './TestResultsPanel';
import { ChallengeActions } from './ChallengeActions';
import { ProgressTracker } from './ProgressTracker';
import { SuccessModal } from './SuccessModal';
import { useTimer } from '@/hooks/useTimer';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import type { TestResult } from '@/types/challenge';

interface ChallengeClientProps {
  challenge: Challenge;
  testCases: TestCase[];
}

export const ChallengeClient: React.FC<ChallengeClientProps> = ({
  challenge,
  testCases
}) => {
  const router = useRouter();
  const { time, startTimer, pauseTimer, resetTimer } = useTimer();
  const [code, setCode] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  const {
    progress,
    updateProgress,
    completeChallenge
  } = useChallengeProgress(challenge.id);

  // Initialize starter code
  useEffect(() => {
    const starterCode = generateStarterCode(challenge.solutions || '');
    setCode(starterCode);
    startTimer();
    
    return () => pauseTimer();
  }, [challenge]);

  const generateStarterCode = (solution: string): string => {
    if (!solution) return '# Write your solution here\npass';
    
    const lines = solution.split('\n');
    const defLine = lines.find(line => line.trim().startsWith('def '));
    
    if (defLine) {
      const functionName = defLine.match(/def\s+(\w+)\s*\(/)?.[1];
      return `${defLine}\n    # Write your solution here\n    pass\n\n# Test your function\nif __name__ == "__main__":\n    print(${functionName}())`;
    }
    
    return '# Write your solution here\npass';
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const visibleTests = testCases.filter(tc => !tc.is_hidden);
    const results: TestResult[] = [];
    
    for (const testCase of visibleTests) {
      const result = await executeTest(code, testCase);
      results.push(result);
    }
    
    setTestResults(results);
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    updateProgress({
      testsPassed: passed,
      testsTotal: total,
      attemptsCount: progress.attemptsCount + 1,
      timeElapsed: time
    });
    
    if (passed === total) {
      setShowSuccess(true);
      pauseTimer();
    }
    
    setIsRunning(false);
  };

  const executeTest = async (
    userCode: string, 
    testCase: TestCase
  ): Promise<TestResult> => {
    // TODO: Replace with actual backend API call
    // This is a simulation for demo purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate for demo
        
        resolve({
          testId: testCase.id,
          passed: success,
          message: testCase.description,
          output: success ? testCase.expected_output : 'Incorrect output',
          expected: testCase.expected_output,
          executionTime: Math.floor(Math.random() * 50) + 10
        });
      }, 300);
    });
  };

  const handleSubmit = async () => {
    if (!showSuccess) return;
    
    try {
      // TODO: Implement actual submission
      // await submitChallenge(challenge.id, code, {
      //   timeElapsed: time,
      //   hintsUsed,
      //   isPerfectSolve: progress.attemptsCount === 1
      // });
      
      await completeChallenge({
        code,
        timeElapsed: time,
        hintsUsed,
        testsPassed: testResults.length,
        testsTotal: testResults.length
      });
      
      router.push('/challenges');
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const handleShowHints = () => {
    setShowHints(true);
    setHintsUsed(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Panel - Description */}
      <div className="w-1/2 flex flex-col border-r border-border">
        <ChallengeHeader challenge={challenge} />
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <ProgressTracker
              timeElapsed={time}
              hintsUsed={hintsUsed}
              testsPassed={progress.testsPassed}
              testsTotal={progress.testsTotal}
              attemptsCount={progress.attemptsCount}
            />
            
            <ChallengeDescription
              description={challenge.description}
              testCases={testCases.filter(tc => !tc.is_hidden)}
              solutions={challenge.solutions}
              showHints={showHints}
              onShowHints={handleShowHints}
            />
            
            {testResults.length > 0 && (
              <TestResultsPanel results={testResults} />
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="python"
        />
        
        <ChallengeActions
          onRunTests={handleRunTests}
          onSubmit={handleSubmit}
          onSkip={() => router.push('/challenges')}
          isRunning={isRunning}
          canSubmit={showSuccess}
          testsPassed={testResults.filter(r => r.passed).length}
          testsTotal={testResults.length}
        />
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          challenge={challenge}
          timeElapsed={time}
          hintsUsed={hintsUsed}
          attemptsCount={progress.attemptsCount}
          onSubmit={handleSubmit}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};