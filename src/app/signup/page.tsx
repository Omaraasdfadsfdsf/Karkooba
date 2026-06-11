import type { Metadata } from 'next';
import SignupForm from './SignupForm';
import { getDict } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Sign up' };

export default async function SignupPage() {
  const { dict } = await getDict();
  return (
    <div className="panel-wrap">
      <div className="panel">
        <h1>{dict.auth.signupTitle}</h1>
        <p className="sub">{dict.auth.signupSub}</p>
        <SignupForm />
      </div>
    </div>
  );
}
