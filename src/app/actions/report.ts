'use server';

import { createClient } from '@/lib/supabase/server';

const REASONS = ['spam', 'scam', 'prohibited', 'offensive', 'other'];

export interface ReportState {
  status: 'idle' | 'thanks' | 'already' | 'login' | 'error';
}

export async function reportListing(
  _prev: ReportState,
  formData: FormData
): Promise<ReportState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'login' };

  const listingId = String(formData.get('listing_id') ?? '');
  const reason = String(formData.get('reason') ?? '');
  const details = String(formData.get('details') ?? '')
    .trim()
    .slice(0, 300);
  if (!REASONS.includes(reason) || !listingId) return { status: 'error' };

  const { error } = await supabase.from('listing_reports').insert({
    listing_id: listingId,
    reporter_id: user.id,
    reason,
    details,
  });

  if (error) {
    // 23505 = unique violation: this user already reported this listing.
    if (error.code === '23505') return { status: 'already' };
    return { status: 'error' };
  }
  return { status: 'thanks' };
}
