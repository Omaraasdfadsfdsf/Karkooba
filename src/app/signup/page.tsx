import type { Metadata } from 'next';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Join KARKOOBA and turn your clutter into dirhams.',
};

export default function SignupPage() {
  return (
    <div className="panel-wrap">
      <div className="panel">
        <h1>Join the pile</h1>
        <p className="sub">
          One account, endless decluttering. Sign up and start selling in minutes.
        </p>
        <SignupForm />
      </div>
    </div>
  );
}
