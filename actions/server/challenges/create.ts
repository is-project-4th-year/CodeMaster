"use server";
import { createClient } from "@/lib/supabase/server";
import { mapDifficultyToRank } from "@/lib/mapDifficultyToRank";
import { calculatePoints } from "@/lib/calculatePoints";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAdminRole } from "../admin";

export async function createChallenge(
  challengeData: {
    name: string;
    category: string;
    rank_name: string; // 'easy', 'medium', 'hard'
    description: string;
    solutions: string;
    tags: string[];
    points?: number;
    time_limit?: number;
    estimated_time?: number;
    is_locked?: boolean;
    required_level?: number;
    is_daily_challenge?: boolean;
    daily_bonus_points?: number;
    test_cases?: Array<{
      input: string;
      expected_output: string;
      description?: string;
      is_hidden: boolean;
    }>;
  }
): Promise<{ success: boolean; error?: string; challengeId?: string }> {
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const adminClient = createAdminClient();

    // Map difficulty to rank and rank_name
    const difficultyMap: Record<string, { rank: number; rank_name: string; defaultPoints: number }> = {
      'easy': { rank: 1, rank_name: '8 kyu', defaultPoints: 10 },
      'medium': { rank: 4, rank_name: '5 kyu', defaultPoints: 30 },
      'hard': { rank: 7, rank_name: '2 kyu', defaultPoints: 50 }
    };

    const difficulty = difficultyMap[challengeData.rank_name.toLowerCase()] || difficultyMap['easy'];
    
    // Prepare challenge data
    const challengeDataToInsert = {
      name: challengeData.name,
      category: challengeData.category,
      description: challengeData.description,
      rank: difficulty.rank,
      rank_name: difficulty.rank_name,
      solutions: challengeData.solutions,
      points: challengeData.points || difficulty.defaultPoints,
      time_limit: challengeData.time_limit,
      estimated_time: challengeData.estimated_time,
      is_locked: challengeData.is_locked || false,
      required_level: challengeData.required_level,
      solved_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into challenges table
    const { data: challenge, error: challengeError } = await adminClient
      .from('challenges')
      .insert([challengeDataToInsert])
      .select()
      .single();

    if (challengeError) {
      console.error('❌ Error creating challenge:', challengeError);
      return { success: false, error: challengeError.message };
    }

    const challengeId = challenge.id;

    // Insert tags
    if (challengeData.tags && challengeData.tags.length > 0) {
      const tagInserts = challengeData.tags.map(tag => ({
        challenge_id: challengeId,
        tag: tag
      }));

      const { error: tagsError } = await adminClient
        .from('challenge_tags')
        .insert(tagInserts);

      if (tagsError) {
        console.warn('⚠️ Error inserting tags:', tagsError);
      }
    }

    // Insert test cases
    if (challengeData.test_cases && challengeData.test_cases.length > 0) {
      const testCaseInserts = challengeData.test_cases.map((tc, index) => ({
        challenge_id: challengeId,
        input: tc.input,
        expected_output: tc.expected_output,
        description: tc.description || `Test case ${index + 1}`,
        order_index: index,
        is_hidden: tc.is_hidden || false
      }));

      const { error: testCasesError } = await adminClient
        .from('test_cases')
        .insert(testCaseInserts);

      if (testCasesError) {
        console.warn('⚠️ Error inserting test cases:', testCasesError);
      }
    }

    // Insert daily challenge if applicable
    if (challengeData.is_daily_challenge) {
      const { error: dailyChallengeError } = await adminClient
        .from('daily_challenges')
        .insert([{
          challenge_id: challengeId,
          challenge_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          bonus_points: challengeData.daily_bonus_points || 50
        }]);

      if (dailyChallengeError) {
        console.warn('⚠️ Error creating daily challenge:', dailyChallengeError);
      }
    }

    revalidatePath('/admin/challenges');
    return { success: true, challengeId: challengeId.toString() };
  } catch (error) {
    console.error('❌ Unexpected error in createChallenge:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function addTestCase(
  testCaseData: {
    challenge_id: string;
    input: string;
    expected_output: string;
    is_hidden: boolean;
    order_index: number;
    description?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const adminClient = createAdminClient();

    const { error } = await adminClient
      .from('test_cases')
      .insert([testCaseData]);

    if (error) {
      console.error('❌ Error adding test case:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/challenges');
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error in addTestCase:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}