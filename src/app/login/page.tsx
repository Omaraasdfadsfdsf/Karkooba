import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from './LoginForm';
import { getDict } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Log in' };

export default async function LoginPage() {
  const { dict } = await getDict();
  return (
    <div className="panel-wrap">
      <div className="panel">
        <h1>{dict.auth.loginTitle}</h1>
        <p className="sub">{dict.auth.loginSub}</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
