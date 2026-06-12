'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { createClient } from '@/lib/supabase/client';

export default function ForgotForm() {
  const { dict } = useI18n();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    // Always show success — never reveal whether an account exists.
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div>
        <p className="form-success">{dict.auth.resetSent}</p>
        <p className="panel-note">
          <Link href="/login">{dict.auth.loginTitle}</Link>
        </p>
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
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? dict.auth.sendingReset : dict.auth.sendReset}
      </button>
    </form>
  );
}
