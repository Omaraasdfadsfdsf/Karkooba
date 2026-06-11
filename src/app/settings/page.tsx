import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import SettingsForm from './SettingsForm';
import { getDict } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { dict } = await getDict();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/settings');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile) redirect('/welcome?next=/settings');

  return (
    <div className="panel-wrap">
      <div className="panel">
        <h1>{dict.settings.title}</h1>
        <p className="sub">{dict.settings.sub}</p>
        <SettingsForm profile={profile as Profile} />
      </div>
    </div>
  );
}
