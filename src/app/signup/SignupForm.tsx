'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { createClient } from '@/lib/supabase/client';

export default function SignupForm() {
  const { dict } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkInbox, setCheckInbox] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError(dict.auth.passwordShort);
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
          {dict.auth.checkInbox} <b dir="ltr">{email}</b>. {dict.auth.checkInboxTail}
        </p>
        <p className="panel-note">{dict.auth.checkSpam}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="email">{dict.auth.email}</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          dir="ltr"
        />
      </div>
      <div className="field">
        <label htmlFor="password">{dict.auth.password}</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={dict.auth.passwordHint}
          dir="ltr"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? dict.auth.signingUp : dict.auth.signupBtn}
      </button>
      <p className="panel-note">
        {dict.auth.haveAccount} <Link href="/login">{dict.auth.loginTitle}</Link>
      </p>
    </form>
  );
}
