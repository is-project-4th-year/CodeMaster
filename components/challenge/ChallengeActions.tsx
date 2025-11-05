"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Trophy, Loader2, ArrowLeft } from 'lucide-react';

interface ChallengeActionsProps {
  onRunTests: () => void;
  onSubmit: () => void;
  onSkip: () => void;
  isRunning: boolean;
  canSubmit: boolean;
  testsPassed: number;
  testsTotal: number;
}

export const ChallengeActions: React.FC<ChallengeActionsProps> = ({
  onRunTests,
  onSubmit,
  onSkip,
  isRunning,
  canSubmit,
  testsPassed,
  testsTotal
}) => {
  return (
    <div className="border-t border-border p-4 bg-card">
      <div className="flex items-center justify-between gap-3">
        <Button
          onClick={onSkip}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          {testsTotal > 0 && (
            <Badge variant={testsPassed === testsTotal ? 'default' : 'secondary'}>
              {testsPassed}/{testsTotal} Passed
            </Badge>
          )}
          
          <Button
            onClick={onRunTests}
            disabled={isRunning}
            variant="outline"
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Tests
              </>
            )}
          </Button>

          <Button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Trophy className="w-4 h-4" />
            Submit Solution
          </Button>
        </div>
      </div>
    </div>
  );
};
