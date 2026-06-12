'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const { dict } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    params.get('error') === 'confirm' ? dict.auth.confirmFailed : null
  );
  const [busy, setBusy] = useState(false);
  const justConfirmed = params.get('confirmed') === '1';

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
          ? dict.auth.badCredentials
          : signInError?.message || dict.auth.loginFailed
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
      {justConfirmed && (
        <p className="form-success" style={{ marginTop: 0, marginBottom: 16 }}>
          {dict.auth.confirmedNotice}
        </p>
      )}
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          dir="ltr"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? dict.auth.loggingIn : dict.auth.loginBtn}
      </button>
      <p className="panel-note">
        {dict.auth.noAccount} <Link href="/signup">{dict.auth.createAccount}</Link>
      </p>
    </form>
  );
}
