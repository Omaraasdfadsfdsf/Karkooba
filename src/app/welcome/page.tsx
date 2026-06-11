import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';
import { getDict } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Set up your profile' };

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const { dict } = await getDict();
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
        <h1>{dict.welcome.title}</h1>
        <p className="sub">{dict.welcome.sub}</p>
        <ProfileForm next={next && next.startsWith('/') ? next : '/post'} />
      </div>
    </div>
  );
}
