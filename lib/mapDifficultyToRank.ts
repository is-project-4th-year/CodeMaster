export function mapDifficultyToRank(difficulty: 'easy' | 'medium' | 'hard'): { rank: number; rank_name: string } {
  const difficultyMap = {
    easy: { rank: 8, rank_name: '8 kyu' },    // Beginner
    medium: { rank: 5, rank_name: '5 kyu' },  // Intermediate
    hard: { rank: 2, rank_name: '2 kyu' }     // Advanced
  };
  
  return difficultyMap[difficulty];
}