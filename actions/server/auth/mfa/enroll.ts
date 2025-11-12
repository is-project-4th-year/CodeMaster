"use server";
import { createClient } from "@/lib/supabase/server";

export async function checkMFAStatus(): Promise<{
  success: boolean;
  hasVerifiedFactor: boolean;
  hasPendingFactor: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, hasVerifiedFactor: false, hasPendingFactor: false, error: 'Not authenticated' };
    }

    // Get all MFA factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    
    if (factorsError) {
      console.error('Error listing MFA factors:', factorsError);
      return { success: false, hasVerifiedFactor: false, hasPendingFactor: false, error: factorsError.message };
    }

    const hasVerifiedFactor = factors?.totp?.some(factor => factor.status === 'verified') || false;
    const hasPendingFactor = factors?.totp?.some(factor => factor.status === 'unverified') || false;

    return {
      success: true,
      hasVerifiedFactor,
      hasPendingFactor
    };
  } catch (error) {
    console.error('Unexpected error in checkMFAStatus:', error);
    return { success: false, hasVerifiedFactor: false, hasPendingFactor: false, error: 'An unexpected error occurred' };
  }
}
export async function continueExistingEnrollment(): Promise<{
  success: boolean;
  qrCode?: string;
  secret?: string;
  factorId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get existing factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    
    if (factorsError) {
      return { success: false, error: factorsError.message };
    }

    // Find unverified factor
    const pendingFactor = factors?.totp?.find(factor => factor.status === 'unverified');
    
    if (!pendingFactor) {
      return { success: false, error: 'No pending enrollment found' };
    }

    // Get the QR code for the existing factor
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: pendingFactor.friendly_name || 'Authenticator'
    });

    if (error) {
      console.error('Error continuing enrollment:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      qrCode: data?.totp.qr_code,
      secret: data?.totp.secret,
      factorId: pendingFactor.id
    };
  } catch (error) {
    console.error('Unexpected error in continueExistingEnrollment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
export async function enrollMFA(): Promise<{
  success: boolean;
  qrCode?: string;
  secret?: string;
  factorId?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Enroll a new TOTP factor
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `${user.email}'s Authenticator`
    });

    if (error) {
      console.error('MFA enrollment error:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No enrollment data returned' };
    }

    return {
      success: true,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id
    };
  } catch (error) {
    console.error('Unexpected error in enrollMFA:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
