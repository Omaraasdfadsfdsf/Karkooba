import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Icon from '@/components/Icon';
import MyListingCard from './MyListingCard';
import { getDict } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';
import type { ListingWithPhotos } from '@/lib/types';

export const metadata: Metadata = { title: 'My listings' };
export const dynamic = 'force-dynamic';

export default async function MyListingsPage() {
  const { dict } = await getDict();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/my-listings');

  const { data } = await supabase
    .from('listings')
    .select('*, listing_photos(storage_path, position)')
    .eq('owner_id', user.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  const listings = (data ?? []) as ListingWithPhotos[];

  return (
    <>
      <section className="hero" style={{ paddingBottom: 10 }}>
        <div>
          <h1>{dict.myListings.title}</h1>
          <p>{dict.myListings.sub}</p>
        </div>
      </section>
      <main className="listing-grid">
        {listings.length === 0 ? (
          <div className="empty">
            <div className="big">
              <Icon name="box" size={28} />
            </div>
            <h3>{dict.myListings.emptyTitle}</h3>
            <p>{dict.myListings.emptySub}</p>
            <p style={{ marginTop: 18 }}>
              <Link href="/post" className="btn-post">
                {dict.nav.sell}
              </Link>
            </p>
          </div>
        ) : (
          listings.map((listing) => <MyListingCard key={listing.id} listing={listing} />)
        )}
      </main>
    </>
  );
}
