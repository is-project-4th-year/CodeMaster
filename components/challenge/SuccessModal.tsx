"use client";
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Clock, Lightbulb, Star, Share2 } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import confetti from 'canvas-confetti';

interface SuccessModalProps {
  challenge: Challenge;
  timeElapsed: number;
  hintsUsed: number;
  attemptsCount: number;
  onSubmit: () => void;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  challenge,
  timeElapsed,
  hintsUsed,
  attemptsCount,
  onSubmit,
  onClose
}) => {
  const [open, setOpen] = useState(true);
  
  useEffect(() => {
    // Trigger confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const calculateBonus = () => {
    let bonus = 0;
    if (attemptsCount === 1) bonus += 50; // Perfect solve
    if (hintsUsed === 0) bonus += 20; // No hints
    if (timeElapsed < (challenge.timeLimit || 600)) bonus += 30; // Fast solve
    return bonus;
  };

  const totalXP = challenge.points + calculateBonus();
  const isPerfect = attemptsCount === 1 && hintsUsed === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <DialogTitle className="text-center text-2xl">
            {isPerfect ? '🎉 Perfect Solve! 🎉' : '✨ Challenge Complete! ✨'}
          </DialogTitle>
          
          <DialogDescription className="text-center">
            You successfully solved <strong>{challenge.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* XP Breakdown */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Base XP</span>
              <span className="font-bold text-lg">+{challenge.points}</span>
            </div>
            
            {calculateBonus() > 0 && (
              <>
                <div className="border-t border-border/50 pt-2 space-y-2">
                  {attemptsCount === 1 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-green-400">
                        <Zap className="w-3 h-3" />
                        Perfect Solve
                      </span>
                      <span className="text-green-400 font-semibold">+50</span>
                    </div>
                  )}
                  
                  {hintsUsed === 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-blue-400">
                        <Lightbulb className="w-3 h-3" />
                        No Hints Used
                      </span>
                      <span className="text-blue-400 font-semibold">+20</span>
                    </div>
                  )}
                  
                  {timeElapsed < (challenge.timeLimit || 600) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Clock className="w-3 h-3" />
                        Speed Bonus
                      </span>
                      <span className="text-yellow-400 font-semibold">+30</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-border/50 pt-2 flex items-center justify-between">
                  <span className="font-semibold">Total XP Earned</span>
                  <Badge className="text-lg bg-yellow-500 hover:bg-yellow-500">
                    <Star className="w-4 h-4 mr-1" />
                    {totalXP}
                  </Badge>
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="text-sm font-semibold">{formatTime(timeElapsed)}</p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <Zap className="w-5 h-5 mx-auto mb-1 text-orange-500" />
              <p className="text-xs text-muted-foreground">Attempts</p>
              <p className="text-sm font-semibold">{attemptsCount}</p>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <Lightbulb className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
              <p className="text-xs text-muted-foreground">Hints</p>
              <p className="text-sm font-semibold">{hintsUsed}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={onSubmit}
              className="flex-1 gap-2"
            >
              <Trophy className="w-4 h-4" />
              Submit & Continue
            </Button>
            
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  `I just solved "${challenge.title}" and earned ${totalXP} XP! 🎉`
                );
              }}
              variant="outline"
              size="icon"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};