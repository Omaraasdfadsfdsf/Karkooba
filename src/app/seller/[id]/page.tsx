import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import ListingCard from '@/components/ListingCard';
import { getDict } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';
import type { ListingWithPhotos, Profile } from '@/lib/types';
import { fmtDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_RE.test(id)) return { title: 'Seller' };
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', id)
    .maybeSingle();
  return { title: data ? `${data.display_name} — Seller` : 'Seller' };
}

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const { dict, locale } = await getDict();
  const supabase = await createClient();

  const [{ data: profile }, activeRes, soldRes, userRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('listings')
      .select('*, listing_photos(storage_path, position)')
      .eq('owner_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(48),
    supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', id)
      .eq('status', 'sold'),
    supabase.auth.getUser(),
  ]);

  if (!profile) notFound();
  const seller = profile as Profile;
  const listings = (activeRes.data ?? []) as ListingWithPhotos[];
  const soldCount = soldRes.count ?? 0;
  const viewer = userRes.data.user;

  return (
    <>
      <section className="hero" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <span
            className="avatar-dot"
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              fontSize: '1.5rem',
              background: 'var(--grad)',
              color: '#fff',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textTransform: 'uppercase',
            }}
          >
            {seller.display_name.slice(0, 1)}
          </span>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>{seller.display_name}</h1>
            <p style={{ marginTop: 6 }}>
              <Icon name="check" size={14} className="inline" />{' '}
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>
                {dict.seller.verified}
              </span>{' '}
              · {dict.emirates[seller.emirate] ?? seller.emirate} · {dict.seller.memberSince}{' '}
              {fmtDate(seller.created_at, locale)}
            </p>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-tag">
            <b>{listings.length}</b>
            <small>{dict.seller.activeListings}</small>
          </div>
          <div className="stat-tag">
            <b>{soldCount}</b>
            <small>{dict.seller.itemsSold}</small>
          </div>
        </div>
      </section>

      <div className="filters">
        <span className="section-label" style={{ border: 'none', margin: 0 }}>
          {dict.seller.listingsTitle}
        </span>
      </div>

      <main className="listing-grid">
        {listings.length === 0 ? (
          <div className="empty">
            <div className="big">
              <Icon name="box" size={28} />
            </div>
            <h3>{dict.empty.title}</h3>
            <p>{dict.seller.emptyListings}</p>
          </div>
        ) : (
          listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              dict={dict}
              isMine={viewer?.id === listing.owner_id}
            />
          ))
        )}
      </main>
    </>
  );
}
