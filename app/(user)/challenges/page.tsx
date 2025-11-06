import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChallengeCard } from '@/components/ChallengeCard';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchChallenges } from '@/actions/challenges';
import { Challenge } from '@/types/challenge';

export default async function ChallengesPage() {
 
  let challenges: Challenge[];
  let error = null;

  try {
    challenges = await fetchChallenges();
  } catch (err) {
    error = 'Failed to load challenges. Please try again later.';
    console.error('Challenge fetch error:', err);
    challenges = [];
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Browse Challenges</h1>
          <p className="text-muted-foreground">Choose your next coding adventure</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                All
              </Badge>
              <Badge variant="outline" className="cursor-pointer">Fundamentals</Badge>
              <Badge variant="outline" className="cursor-pointer">Algorithms</Badge>
              <Badge variant="outline" className="cursor-pointer">Data Structures</Badge>
              <Badge variant="outline" className="cursor-pointer">Easy</Badge>
              <Badge variant="outline" className="cursor-pointer">Medium</Badge>
              <Badge variant="outline" className="cursor-pointer">Hard</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Challenge Grid */}
        {challenges.length === 0 && !error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No challenges available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
