import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dismissReport, isAdmin, removeReportedListing } from './actions';
import { createAdminClient } from '@/lib/supabase/admin';
import { fmtDate, listingPath } from '@/lib/utils';

export const metadata: Metadata = { title: 'Moderation', robots: { index: false } };
export const dynamic = 'force-dynamic';

interface ReportRow {
  id: string;
  reason: string;
  details: string;
  created_at: string;
  listings: { id: string; title: string; status: string } | null;
  profiles: { display_name: string } | null;
}

export default async function AdminPage() {
  if (!(await isAdmin())) notFound();

  const admin = createAdminClient();
  if (!admin) {
    return (
      <div className="panel-wrap">
        <div className="panel">
          <h1>Moderation</h1>
          <p className="sub">
            SUPABASE_SERVICE_ROLE_KEY is not configured in this environment, so reports
            can&apos;t be loaded here. It is configured in production.
          </p>
        </div>
      </div>
    );
  }

  const { data } = await admin
    .from('listing_reports')
    .select('id, reason, details, created_at, listings(id, title, status), profiles!listing_reports_reporter_id_fkey(display_name)')
    .order('created_at', { ascending: false })
    .limit(100);
  const reports = (data ?? []) as unknown as ReportRow[];

  return (
    <div className="panel-wrap">
      <div className="panel wide">
        <h1>Moderation</h1>
        <p className="sub">
          {reports.length === 0
            ? 'No open reports. The board is clean.'
            : `${reports.length} open report${reports.length === 1 ? '' : 's'}.`}
        </p>

        <div className="chat-list">
          {reports.map((r) => (
            <div key={r.id} className="chat-list-item" style={{ cursor: 'default' }}>
              <div className="info">
                <div className="who">
                  {r.listings ? (
                    <Link href={listingPath(r.listings.id, r.listings.title)}>
                      {r.listings.title}
                    </Link>
                  ) : (
                    'Deleted listing'
                  )}
                  <span
                    style={{
                      fontSize: '0.68rem',
                      textTransform: 'uppercase',
                      color: 'var(--red)',
                      fontWeight: 700,
                    }}
                  >
                    {r.reason}
                  </span>
                </div>
                <div className="what">
                  Reported by {r.profiles?.display_name ?? 'unknown'} · {fmtDate(r.created_at)}
                </div>
                {r.details && <div className="last">{r.details}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {r.listings && r.listings.status !== 'deleted' && (
                  <form action={removeReportedListing.bind(null, r.listings.id)}>
                    <button type="submit" className="btn-small danger">
                      Remove listing
                    </button>
                  </form>
                )}
                <form action={dismissReport.bind(null, r.id)}>
                  <button type="submit" className="btn-small">
                    Dismiss
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
