'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkInbox, setCheckInbox] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError('Make the password at least 8 characters. Junk is cheap, security is not.');
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/welcome`,
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }
    if (data.session) {
      // Email confirmation disabled — go straight to profile setup.
      router.push('/welcome');
      router.refresh();
      return;
    }
    setCheckInbox(true);
    setBusy(false);
  }

  if (checkInbox) {
    return (
      <div>
        <p className="form-success">
          📬 Almost there! We sent a confirmation link to <b>{email}</b>. Click it and
          you&apos;re in.
        </p>
        <p className="panel-note">
          Nothing arrived? Check the spam folder — even emails end up in the junk pile
          sometimes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Creating account…' : 'Sign up →'}
      </button>
      <p className="panel-note">
        Already have an account? <Link href="/login">Log in</Link>.
      </p>
    </form>
  );
}
