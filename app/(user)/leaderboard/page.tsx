import React from 'react';
import { createClient } from '@/lib/supabase/server';
import LeaderboardClient from '@/components/leaderboard-client';


interface LeaderboardSnapshotRow {
  rank: number;
  user_id: string;
  username?: string;
  avatar?: string;
  points: number;
  challenges_solved: number;
}

interface UserProfileRow {
  user_id: string;
  avatar?: string;
  total_points: number;
  total_solved: number;
}

/* -------------------------------------------------
   2. Final Leaderboard Entry (shared with client)
   ------------------------------------------------- */
export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  points: number;
  solvedToday: number;
  isCurrentUser: boolean;
}

export interface Leaderboards {
  daily: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}

/* -------------------------------------------------
   3. Typed Data Fetching
   ------------------------------------------------- */
async function fetchLeaderboards(): Promise<Leaderboards> {
  const supabase = await createClient();

  // Correct way: get session → user
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  const todayStr = new Date().toISOString().split('T')[0];

  // ── Daily Leaderboard ──
  const { data: dailyData } = await supabase
    .from('leaderboard_snapshots')
    .select('*')
    .eq('period_type', 'daily')
    .eq('period_date', todayStr)
    .order('rank', { ascending: true })
    .limit(50)
    .returns<LeaderboardSnapshotRow[]>();

  // ── Weekly Leaderboard ──
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  const { data: weeklyData } = await supabase
    .from('leaderboard_snapshots')
    .select('*')
    .eq('period_type', 'weekly')
    .gte('period_date', startOfWeekStr)
    .order('rank', { ascending: true })
    .limit(50)
    .returns<LeaderboardSnapshotRow[]>();

  // ── All-Time Leaderboard ──
  const { data: allTimeData } = await supabase
    .from('user_profiles')
    .select('user_id, avatar, total_points, total_solved')
    .order('total_points', { ascending: false })
    .limit(50)
    .returns<UserProfileRow[]>();

  // Fetch usernames via admin API (only in server components)
  const allTimeWithUsernames: LeaderboardEntry[] = await Promise.all(
    (allTimeData || []).map(async (entry, index) => {
      let username = 'Anonymous';
      if (entry.user_id) {
        const { data: adminUser } = await supabase.auth.admin.getUserById(entry.user_id);
        username = adminUser?.user?.email?.split('@')[0] || 'Anonymous';
      }

      return {
        rank: index + 1,
        username,
        avatar: entry.avatar || 'User',
        points: entry.total_points,
        solvedToday: entry.total_solved,
        isCurrentUser: entry.user_id === currentUserId,
      };
    })
  );

  // ── Helper: safely format snapshot-based leaderboards ──
  const formatLeaderboard = (
    data: LeaderboardSnapshotRow[] | null | undefined
  ): LeaderboardEntry[] =>
    (data || []).map((entry) => ({
      rank: entry.rank,
      username: entry.username || 'Anonymous',
      avatar: entry.avatar || 'User',
      points: entry.points,
      solvedToday: entry.challenges_solved,
      isCurrentUser: entry.user_id === currentUserId,
    }));

  return {
    daily: formatLeaderboard(dailyData),
    weekly: formatLeaderboard(weeklyData),
    allTime: allTimeWithUsernames,
  };
}


export default async function LeaderboardPage() {
  const leaderboards = await fetchLeaderboards();

  return <LeaderboardClient leaderboards={leaderboards} />;
}