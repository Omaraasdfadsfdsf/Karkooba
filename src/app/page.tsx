import FilterBar from '@/components/FilterBar';
import ListingCard from '@/components/ListingCard';
import Icon from '@/components/Icon';
import { isCategory, isEmirate } from '@/lib/constants';
import { getDict } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';
import type { ListingWithPhotos } from '@/lib/types';
import { fmtPriceL } from '@/lib/utils';

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
  const { dict } = await getDict();
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

  const [listingsRes, statsRes] = await Promise.all([
    query.limit(60),
    supabase
      .from('listings')
      .select('price_aed', { count: 'exact' })
      .eq('status', 'active')
      .order('price_aed', { ascending: true })
      .limit(1),
  ]);

  const listings = (listingsRes.data ?? []) as ListingWithPhotos[];
  const totalActive = statsRes.count ?? 0;
  const cheapest = statsRes.data?.[0]?.price_aed ?? null;

  return (
    <>
      {/* Landing view: hero + categories fill the first screen; the grid
          sits below the fold and is reached by scrolling or picking a category. */}
      <div className={hasFilters ? undefined : 'landing-wrap'}>
        <section className="hero">
          <div>
            <h1>
              {dict.hero.title1}
              <br />
              <span className="grad-text">{dict.hero.title2}</span>
            </h1>
            <p>{dict.hero.sub}</p>
          </div>
          <div className="hero-stats">
            <div className="stat-tag">
              <b>{totalActive}</b>
              <small>{dict.hero.statItems}</small>
            </div>
            <div className="stat-tag">
              <b>{cheapest === null ? '—' : fmtPriceL(cheapest, dict)}</b>
              <small>{dict.hero.statCheapest}</small>
            </div>
          </div>
        </section>

        <FilterBar />

        {!hasFilters && (
          <div className="filters" style={{ paddingTop: 18 }}>
            <a href="#listings" className="btn-post">
              {dict.hero.browse}
            </a>
          </div>
        )}
      </div>

      <main id="listings" className="listing-grid" aria-live="polite">
        {listings.length === 0 ? (
          <div className="empty">
            <div className="big">
              <Icon name="box" size={28} />
            </div>
            <h3>{dict.empty.title}</h3>
            <p>{hasFilters ? dict.empty.filtered : dict.empty.fresh}</p>
          </div>
        ) : (
          listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              dict={dict}
              isMine={user?.id === listing.owner_id}
            />
          ))
        )}
      </main>
    </>
  );
}
