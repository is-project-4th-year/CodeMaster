
import { createClient } from "@/lib/supabase/client";

export async function incrementSolvedCount(exerciseId: string) {
  const supabase = createClient();
  
  const { error } = await supabase.rpc('increment_solved_count', {
    exercise_id: exerciseId
  });

  if (error) {
    console.error('Error incrementing solved count:', error);
  }
}