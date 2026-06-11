import FilterBar from '@/components/FilterBar';
import ListingCard from '@/components/ListingCard';
import { categoryEmoji, isCategory, isEmirate } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import type { ListingWithPhotos } from '@/lib/types';
import { fmtPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface HomeSearchParams {
  q?: string;
  cat?: string;
  emirate?: string;
  sort?: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const cat = sp.cat && isCategory(sp.cat) ? sp.cat : '';
  const emirate = sp.emirate && isEmirate(sp.emirate) ? sp.emirate : '';
  const sort = sp.sort === 'cheapest' ? 'cheapest' : 'newest';
  const hasFilters = Boolean(q || cat || emirate);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from('listings')
    .select('*, listing_photos(storage_path, position)')
    .eq('status', 'active');

  if (q) {
    // strip characters that would break the PostgREST or() filter syntax
    const safe = q.replace(/[,()%\\]/g, ' ').trim();
    if (safe) query = query.or(`title.ilike.%${safe}%,description.ilike.%${safe}%`);
  }
  if (cat) query = query.eq('category', cat);
  if (emirate) query = query.eq('emirate', emirate);

  query =
    sort === 'cheapest'
      ? query.order('price_aed', { ascending: true }).order('created_at', { ascending: false })
      : query.order('created_at', { ascending: false });

  const [listingsRes, statsRes, tickerRes] = await Promise.all([
    query.limit(60),
    supabase
      .from('listings')
      .select('price_aed', { count: 'exact' })
      .eq('status', 'active')
      .order('price_aed', { ascending: true })
      .limit(1),
    supabase
      .from('listings')
      .select('title, price_aed, emirate, category')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const listings = (listingsRes.data ?? []) as ListingWithPhotos[];
  const totalActive = statsRes.count ?? 0;
  const cheapest = statsRes.data?.[0]?.price_aed ?? null;
  const tickerItems = tickerRes.data ?? [];

  return (
    <>
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((half) => (
            <span key={half} style={{ margin: 0 }}>
              {tickerItems.length > 0 ? (
                tickerItems.map((t, i) => (
                  <span key={i}>
                    {categoryEmoji(t.category)} {t.title} — {fmtPrice(t.price_aed)} ({t.emirate})
                  </span>
                ))
              ) : (
                <span>Be the first to list something →</span>
              )}
            </span>
          ))}
        </div>
      </div>

      <section className="hero">
        <div>
          <h2>
            One man&apos;s junk.
            <br />
            Another man&apos;s <span className="stamp">jackpot.</span>
          </h2>
          <p>
            That dusty thing in your storage room? Someone in the UAE actually wants it. List it
            for cheap, free up space, make a few dirhams. Everything here is under-loved and
            over-discounted.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-tag">
            <b>{totalActive}</b>
            <small>items listed</small>
          </div>
          <div className="stat-tag">
            <b>{cheapest === null ? '—' : fmtPrice(cheapest)}</b>
            <small>cheapest find</small>
          </div>
        </div>
      </section>

      <FilterBar />

      <main className="listing-grid" aria-live="polite">
        {listings.length === 0 ? (
          <div className="empty">
            <div className="big">🕳️</div>
            <h3>Nothing in this pile</h3>
            <p>
              {hasFilters
                ? 'No items match. Try another category — or be the first to list one.'
                : 'The board is empty. That broken thing in your closet is waiting for its moment.'}
            </p>
          </div>
        ) : (
          listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isMine={user?.id === listing.owner_id} />
          ))
        )}
      </main>
    </>
  );
}
