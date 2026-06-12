import type { Metadata } from 'next';
import ForgotForm from './ForgotForm';
import { getDict } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Reset password' };

export default async function ForgotPasswordPage() {
  const { dict } = await getDict();
  return (
    <div className="panel-wrap">
      <div className="panel">
        <h1>{dict.auth.forgotTitle}</h1>
        <p className="sub">{dict.auth.forgotSub}</p>
        <ForgotForm />
      </div>
    </div>
  );
}
