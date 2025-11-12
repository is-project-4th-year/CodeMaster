export interface ChallengeData {
  id: string;
  name: string;
  slug: string;
  category: string;
  rank: number;
  rank_name: string;
  description: string;
  tags: string[];
  points: number;
  time_limit?: number;
  solved_count: number;
  is_locked: boolean;
  required_level?: number;
  created_at: string;
  updated_at: string;
}

export interface TestCaseData {
  id: string;
  exercise_id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  order_index: number;
  description?: string;
}
