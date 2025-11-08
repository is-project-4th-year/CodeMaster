'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface AdminStats {
  activeUsers: number;
  todaySubmissions: number;
  totalUsers: number;
  totalChallenges: number;
  pendingReports: number;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  role: string;
  level: number;
  total_points: number;
  total_solved: number;
  current_streak: number;
}

/**
 * Check if current user is admin
 */
export async function checkAdminRole(): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;
    
    if (!user?.sub) {
      return false;
    }

    // Check if user has admin role in user_profiles
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.sub)
      .single();

    if (error || !profile) {
      return false;
    }

    return profile.role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}

/**
 * Get current admin user info
 */
export async function getAdminUserInfo() {
  try {
    const supabase = await createClient();
    
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;
    
    if (!user?.sub) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, avatar, level')
      .eq('user_id', user.sub)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      return null;
    }

    return {
      email: user.email || 'Admin',
      username: user.email?.split('@')[0] || 'Admin',
      role: profile.role,
      avatar: profile.avatar,
      level: profile.level,
    };
  } catch (error) {
    console.error('Error fetching admin user info:', error);
    return null;
  }
}

/**
 * Get admin dashboard stats
 */
export async function getAdminStats(): Promise<AdminStats | null> {
  try {
    const supabase = await createClient();

    // Verify admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return null;
    }

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users (users who logged in within last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: activeUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', yesterday.toISOString());

    // Get today's submissions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: todaySubmissions } = await supabase
      .from('user_solutions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get total challenges
    const { count: totalChallenges } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });

    // Get pending reports (assuming you have a reports table)
    const { count: pendingReports } = await supabase
      .from('user_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return {
      activeUsers: activeUsers || 0,
      todaySubmissions: todaySubmissions || 0,
      totalUsers: totalUsers || 0,
      totalChallenges: totalChallenges || 0,
      pendingReports: pendingReports || 0,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return null;
  }
}

/**
 * Get all users with pagination (admin only)
 */
export async function getAllUsers(
  page = 1,
  limit = 20,
  searchQuery?: string
): Promise<{ users: AdminUser[]; total: number } | null> {
  try {
    const supabase = await createClient();

    // Verify admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return null;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('user_profiles')
      .select(`
        user_id,
        role,
        level,
        total_points,
        total_solved,
        current_streak,
        created_at
      `, { count: 'exact' });

    // Add search filter if provided
    if (searchQuery) {
      // Note: You'll need to join with auth.users for email search
      // For now, we'll just filter by user_id
      query = query.ilike('user_id', `%${searchQuery}%`);
    }

    const { data: profiles, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error || !profiles) {
      console.error('Error fetching users:', error);
      return null;
    }

    // Get user emails from auth
    const userIds = profiles.map(p => p.user_id);
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
    
    const emailMap = new Map(
      authUsers?.map(u => [u.id, u.email]) || []
    );

    const users: AdminUser[] = profiles.map(profile => ({
      id: profile.user_id,
      email: emailMap.get(profile.user_id) || 'Unknown',
      created_at: profile.created_at,
      role: profile.role,
      level: profile.level,
      total_points: profile.total_points,
      total_solved: profile.total_solved,
      current_streak: profile.current_streak,
    }));

    return {
      users,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching all users:', error);
    return null;
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: 'user' | 'admin' | 'moderator'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

/**
 * Ban/Unban user (admin only)
 */
export async function toggleUserBan(
  userId: string,
  banned: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_banned: banned })
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error toggling user ban:', error);
    return { success: false, error: 'Failed to toggle user ban status' };
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    // Delete from auth (this will cascade to user_profiles)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

/**
 * Get pending reports (admin only)
 */
export async function getPendingReports(
  page = 1,
  limit = 20
): Promise<{ reports: any[]; total: number } | null> {
  try {
    const supabase = await createClient();

    // Verify admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return null;
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: reports, error, count } = await supabase
      .from('user_reports')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return null;
    }

    return {
      reports: reports || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching pending reports:', error);
    return null;
  }
}

/**
 * Update report status (admin only)
 */
export async function updateReportStatus(
  reportId: string,
  status: 'pending' | 'resolved' | 'dismissed'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify admin role
    const isAdmin = await checkAdminRole();
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('user_reports')
      .update({ status, resolved_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/users/reports');
    return { success: true };
  } catch (error) {
    console.error('Error updating report status:', error);
    return { success: false, error: 'Failed to update report status' };
  }
}