// app/admin/challenges/[id]/edit/page.tsx
import React from 'react';
import { notFound } from 'next/navigation';

import EditChallengeClient from '@/components/edit-challenge-client';
import { fetchChallengeById } from '@/actions/client';
import { getTestCases } from '@/actions';


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChallengeEditPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch challenge and test cases
  const [challenge, testCases] = await Promise.all([
    fetchChallengeById(id),
    getTestCases(id)
  ]);

  if (!challenge) {
    notFound();
  }

  return <EditChallengeClient challenge={challenge} testCases={testCases || []} />;
}

