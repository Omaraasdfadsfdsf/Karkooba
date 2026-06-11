'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    params.get('error') === 'confirm'
      ? 'That confirmation link did not work. Try logging in, or sign up again.'
      : null
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError || !data.user) {
      setError(
        signInError?.message === 'Invalid login credentials'
          ? "Email or password is off. Like a chair with three legs, it doesn't quite work."
          : signInError?.message || 'Could not log in right now. Try again in a moment.'
      );
      setBusy(false);
      return;
    }
    // First login without a profile? Detour through the welcome form.
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();
    router.push(profile ? next : `/welcome?next=${encodeURIComponent(next)}`);
    router.refresh();
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Logging in…' : 'Log in →'}
      </button>
      <p className="panel-note">
        New around here? <Link href="/signup">Create an account</Link> — it takes a minute.
      </p>
    </form>
  );
}
