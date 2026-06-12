'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/** True when the logged-in user's email is listed in ADMIN_EMAILS. */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const allowed = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(user?.email && allowed.includes(user.email.toLowerCase()));
}

export async function removeReportedListing(listingId: string) {
  if (!(await isAdmin())) return;
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from('listings').update({ status: 'deleted' }).eq('id', listingId);
  await admin.from('listing_reports').delete().eq('listing_id', listingId);
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function dismissReport(reportId: string) {
  if (!(await isAdmin())) return;
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from('listing_reports').delete().eq('id', reportId);
  revalidatePath('/admin');
}
