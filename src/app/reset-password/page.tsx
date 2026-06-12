import type { Metadata } from 'next';
import ResetForm from './ResetForm';
import { getDict } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Choose a new password' };
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const { dict } = await getDict();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="panel-wrap">
      <div className="panel">
        <h1>{dict.auth.resetTitle}</h1>
        <p className="sub">{dict.auth.resetSub}</p>
        <ResetForm hasSession={Boolean(user)} />
      </div>
    </div>
  );
}
