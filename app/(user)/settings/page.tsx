import React from 'react';

import { redirect } from 'next/navigation';

import SettingsClient from '@/components/settings-client';
import { fetchUserProfile } from '@/actions';

export default async function SettingsPage() {
  const profile = await fetchUserProfile();

  if (!profile) {
    redirect('/login');
  }

  return <SettingsClient profile={profile} />;
}