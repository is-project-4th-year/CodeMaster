"use server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAdminRole } from "../admin";
import { Challenge } from "@/types";

export async function updateChallenge(
  id: string,
  updates: Partial<Challenge & { tags?: string[] }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const adminClient = createAdminClient();

    // Extract tags from updates since they're not in the challenges table
    const { tags, ...challengeUpdates } = updates;

    // 1. Update the challenge in the base challenges table
    const { error: challengeError } = await adminClient
      .from('challenges')  // Use the base table, not the view
      .update({
        ...challengeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (challengeError) {
      console.error(' Error updating challenge:', challengeError);
      return { success: false, error: challengeError.message };
    }

    // 2. Handle tags separately if they were provided
    if (tags !== undefined) {
      // First, delete existing tags for this challenge
      const { error: deleteTagsError } = await adminClient
        .from('challenge_tags')
        .delete()
        .eq('challenge_id', id);

      if (deleteTagsError) {
        console.warn(' Error deleting old tags:', deleteTagsError);
      }

      // Then, insert new tags if there are any
      if (tags.length > 0) {
        const tagInserts = tags.map(tag => ({
          challenge_id: id,
          tag: tag.trim().toLowerCase()
        }));

        const { error: tagsError } = await adminClient
          .from('challenge_tags')
          .insert(tagInserts);

        if (tagsError) {
          console.warn(' Error inserting tags:', tagsError);
        }
      }
    }

    revalidatePath('/admin/challenges');
    revalidatePath(`/admin/challenges/${id}`);
    revalidatePath(`/admin/challenges/${id}/edit`);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Unexpected error in updateChallenge:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}