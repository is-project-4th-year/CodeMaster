import { Challenge, ExerciseFull } from "@/types/challenge";

export function transformExerciseToChallenge(exercise: ExerciseFull): Challenge {
  return {
    id: exercise.id.toString(),
    title: exercise.name || 'Untitled Challenge',
    difficulty: exercise.rank_name || '8 kyu',
    category: exercise.category || 'reference',
    description: exercise.description || '',
    tags: exercise.tags || [],
    points: exercise.points || 0,
    timeLimit: exercise.time_limit ?? undefined,
    solvedCount: exercise.solved_count ?? 0,
    locked: exercise.is_locked ?? false,
    requiredLevel: exercise.required_level ?? undefined,
    rank: exercise.rank ?? 0,
    rank_name: exercise.rank_name || '8 kyu',
  };
}