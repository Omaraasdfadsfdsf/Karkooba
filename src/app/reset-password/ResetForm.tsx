'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { createClient } from '@/lib/supabase/client';

export default function ResetForm({ hasSession }: { hasSession: boolean }) {
  const { dict } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!hasSession) {
    return (
      <div>
        <p className="form-error">{dict.auth.resetExpired}</p>
        <p className="panel-note">
          <Link href="/forgot-password">{dict.auth.forgotTitle}</Link>
        </p>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError(dict.auth.passwordShort);
      return;
    }
    if (password !== confirm) {
      setError(dict.auth.passwordMismatch);
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 1500);
  }

  if (done) {
    return <p className="form-success">{dict.auth.resetDone}</p>;
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="password">{dict.auth.newPassword}</label>
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
      <div className="field">
        <label htmlFor="confirm">{dict.auth.confirmPassword}</label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          dir="ltr"
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? dict.auth.resetting : dict.auth.resetBtn}
      </button>
    </form>
  );
}
