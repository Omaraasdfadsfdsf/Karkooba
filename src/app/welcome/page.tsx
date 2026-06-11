import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileForm from './ProfileForm';

export const metadata: Metadata = {
  title: 'Set up your profile',
  description: 'Tell buyers who you are and where to WhatsApp you.',
};

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/welcome');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (profile) redirect(next && next.startsWith('/') ? next : '/');

  return (
    <div className="panel-wrap">
      <div className="panel">
        <h1>Almost in</h1>
        <p className="sub">
          Last step: tell buyers who you are and where to WhatsApp you. This is what shows up
          next to your listings.
        </p>
        <ProfileForm next={next && next.startsWith('/') ? next : '/post'} />
      </div>
    </div>
  );
}
