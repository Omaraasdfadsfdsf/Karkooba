import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ListingWithPhotos } from '@/lib/types';
import MyListingCard from './MyListingCard';

export const metadata: Metadata = {
  title: 'My listings',
  description: 'Manage your karkooba: mark things sold, relist, or remove them.',
};

export const dynamic = 'force-dynamic';

export default async function MyListingsPage() {
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
          <h2>Your pile</h2>
          <p>
            Everything you&apos;ve listed. Mark it sold when it finds a home, or pull it off the
            board.
          </p>
        </div>
      </section>
      <main className="listing-grid">
        {listings.length === 0 ? (
          <div className="empty">
            <div className="big">🕳️</div>
            <h3>Nothing in your pile</h3>
            <p>
              You haven&apos;t listed anything yet. That broken thing in your closet is waiting.
            </p>
            <p style={{ marginTop: 16 }}>
              <Link href="/post" className="btn-post">
                + Sell your karkooba
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
