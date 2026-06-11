import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log back in to KARKOOBA and get selling.',
};

export default function LoginPage() {
  return (
    <div className="panel-wrap">
      <div className="panel">
        <h1>Welcome back</h1>
        <p className="sub">Your junk missed you. Log in to manage your listings.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
