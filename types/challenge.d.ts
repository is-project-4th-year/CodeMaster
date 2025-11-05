export interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  tags: string[];
  points: number;
  timeLimit?: number;
  solvedCount: number;
  locked: boolean;
  requiredLevel?: number;
}
export interface Exercise {
  id: string;
  name: string;
  category: string;
  description: string;
  rank: number;
  rank_name: string;
  solutions: string;
  points: number;
  created_at: string;
  updated_at: string;
  solved_count: number | null;
  is_locked: boolean;
  required_level?: number | null;
  time_limit?: number | null;
  estimated_time?: number | null;
}

export interface ExerciseFull extends Exercise {
  tags: string[] | null;
  test_count: number;
}
export interface TestCase {
  id: string;
  exercise_id: string;
  input: string;
  expected_output: string;
  description: string;
  order_index: number;
  is_hidden: boolean;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  message: string;
  output?: string;
  expected?: string;
  error?: string;
  executionTime?: number;
}

export interface ChallengeProgress {
  timeElapsed: number;
  hintsUsed: number;
  attemptsCount: number;
  isCompleted: boolean;
  testsPassed: number;
  testsTotal: number;
}

export interface UserProgress {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  lastActiveDate: string;
  exercisesCompletedToday: number;
  dailyGoal: number;
}
export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  points: number;
  solvedToday: number;
  isCurrentUser?: boolean;
}
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  total?: number;
}

