import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PostForm from './PostForm';

export const metadata: Metadata = {
  title: 'Sell your karkooba',
  description: 'List your secondhand treasure on KARKOOBA in under a minute.',
};

export default async function PostPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/post');

  const { data: profile } = await supabase
    .from('profiles')
    .select('emirate')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile) redirect('/welcome?next=/post');

  return (
    <div className="panel-wrap">
      <div className="panel">
        <h1>Sell your karkooba</h1>
        <p className="sub">
          Don&apos;t overthink it. If it works (or almost works), someone wants it.
        </p>
        <PostForm defaultEmirate={profile.emirate} />
      </div>
    </div>
  );
}
