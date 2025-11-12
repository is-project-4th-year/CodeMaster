"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function unenrollMFA(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get all factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    
    if (factorsError) {
      return { success: false, error: factorsError.message };
    }

    // Unenroll all TOTP factors
    if (factors?.totp) {
      for (const factor of factors.totp) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: factor.id
        });
        
        if (unenrollError) {
          console.error('Error unenrolling factor:', unenrollError);
          return { success: false, error: unenrollError.message };
        }
      }
    }

    revalidatePath('/admin/profile');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in unenrollMFA:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
