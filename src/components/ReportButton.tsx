'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { reportListing, type ReportState } from '@/app/actions/report';
import { useI18n } from '@/components/I18nProvider';

const initialState: ReportState = { status: 'idle' };
const REASONS = ['spam', 'scam', 'prohibited', 'offensive', 'other'];

export default function ReportButton({ listingId }: { listingId: string }) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(reportListing, initialState);

  if (state.status === 'thanks') {
    return <p className="form-success">{dict.report.thanks}</p>;
  }
  if (state.status === 'already') {
    return <p className="form-success">{dict.report.already}</p>;
  }
  if (state.status === 'login') {
    return (
      <p className="panel-note" style={{ textAlign: 'start' }}>
        <Link href="/login">{dict.report.loginFirst}</Link>
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--muted)',
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          marginTop: 18,
          textDecoration: 'underline',
        }}
      >
        ⚑ {dict.report.button}
      </button>
    );
  }

  return (
    <form action={formAction} style={{ marginTop: 18 }}>
      <input type="hidden" name="listing_id" value={listingId} />
      <div className="section-label" style={{ marginTop: 0 }}>
        {dict.report.title}
      </div>
      <div className="field">
        <label htmlFor="reason">{dict.report.sub}</label>
        <select id="reason" name="reason" required defaultValue="spam">
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {dict.report.reasons[r]}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="details">{dict.report.details}</label>
        <input id="details" name="details" maxLength={300} />
      </div>
      {state.status === 'error' && <p className="form-error">{dict.auth.loginFailed}</p>}
      <button type="submit" className="btn-small" disabled={pending} style={{ flex: 'none' }}>
        {pending ? dict.report.submitting : dict.report.submit}
      </button>
    </form>
  );
}
