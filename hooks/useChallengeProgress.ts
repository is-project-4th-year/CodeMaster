import { useState } from 'react';
import { ChallengeProgress } from '@/types/challenge';

export const useChallengeProgress = (challengeId: string) => {
  const [progress, setProgress] = useState<ChallengeProgress>({
    timeElapsed: 0,
    hintsUsed: 0,
    attemptsCount: 0,
    isCompleted: false,
    testsPassed: 0,
    testsTotal: 0
  });

  const updateProgress = (updates: Partial<ChallengeProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const completeChallenge = async (data: {
    code: string;
    timeElapsed: number;
    hintsUsed: number;
    testsPassed: number;
    testsTotal: number;
  }) => {
    // TODO: Implement actual API call to save progress
    console.log('Saving challenge progress:', data);
    
    setProgress(prev => ({
      ...prev,
      isCompleted: true,
      timeElapsed: data.timeElapsed,
      hintsUsed: data.hintsUsed
    }));
  };

  return { progress, updateProgress, completeChallenge };
};
