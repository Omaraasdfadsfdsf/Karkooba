'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { validateProfile } from '@/lib/validation';

export interface ProfileFormState {
  error: string | null;
}

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/welcome');

  const result = validateProfile({
    display_name: String(formData.get('display_name') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    emirate: String(formData.get('emirate') ?? ''),
  });
  if ('error' in result) return { error: result.error };

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name: String(formData.get('display_name')).trim(),
    phone: result.phone,
    emirate: String(formData.get('emirate')),
  });
  if (error) {
    return { error: 'Could not save your profile right now. Try again in a moment.' };
  }

  revalidatePath('/');
  const next = String(formData.get('next') || '/post');
  redirect(next.startsWith('/') ? next : '/post');
}
