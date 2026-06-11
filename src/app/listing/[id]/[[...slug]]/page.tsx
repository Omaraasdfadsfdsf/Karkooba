import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import PhotoGallery from '@/components/PhotoGallery';
import { categoryEmoji, categoryLabel } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import type { ListingWithSeller } from '@/lib/types';
import { fmtDate, fmtPrice, listingPath, photoUrl, slugify, whatsAppLink } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PageParams {
  id: string;
  slug?: string[];
}

async function fetchListing(id: string): Promise<ListingWithSeller | null> {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from('listings')
    .select(
      '*, listing_photos(storage_path, position), profiles(display_name, phone, emirate)'
    )
    .eq('id', id)
    .neq('status', 'deleted')
    .maybeSingle();
  return data as ListingWithSeller | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListing(id);
  if (!listing) return { title: 'Not found' };

  const photos = [...listing.listing_photos].sort((a, b) => a.position - b.position);
  const description = `${fmtPrice(listing.price_aed)} · ${listing.emirate} · ${
    listing.description?.slice(0, 150) || 'No description. It is what it is.'
  }`;

  return {
    title: `${listing.title} — ${fmtPrice(listing.price_aed)}`,
    description,
    alternates: { canonical: listingPath(listing.id, listing.title) },
    openGraph: {
      title: `${listing.title} — ${fmtPrice(listing.price_aed)} on KARKOOBA`,
      description,
      type: 'article',
      images: photos.length > 0 ? [{ url: photoUrl(photos[0].storage_path) }] : undefined,
    },
  };
}

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<{ posted?: string }>;
}) {
  const { id, slug } = await params;
  const { posted } = await searchParams;

  const listing = await fetchListing(id);
  if (!listing) notFound();

  // Canonical URL: /listing/<id>/<slug-of-title>
  const canonicalSlug = slugify(listing.title);
  if (!slug || slug[0] !== canonicalSlug) {
    redirect(listingPath(listing.id, listing.title) + (posted ? '?posted=1' : ''));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isMine = user?.id === listing.owner_id;

  const photos = [...listing.listing_photos]
    .sort((a, b) => a.position - b.position)
    .map((p) => ({ url: photoUrl(p.storage_path), alt: listing.title }));

  const seller = listing.profiles;

  return (
    <div className="panel-wrap">
      <div className="panel wide">
        {posted && (
          <p className="form-success" style={{ marginTop: 0, marginBottom: 16 }}>
            Posted! Your karkooba is live 🎉 Share it around — junk moves fast.
          </p>
        )}
        {listing.status === 'sold' && (
          <div className="sold-banner">Sold! This one found a new home.</div>
        )}

        <PhotoGallery photos={photos} fallbackEmoji={categoryEmoji(listing.category)} />

        <h1 style={{ marginTop: 16 }}>{listing.title}</h1>
        <div style={{ margin: '12px 0' }}>
          <span className={`detail-price ${listing.price_aed === 0 ? 'free' : ''}`}>
            {fmtPrice(listing.price_aed)}
          </span>
        </div>
        <div className="detail-meta">
          {listing.emirate} · {categoryLabel(listing.category)} · Listed{' '}
          {fmtDate(listing.created_at)}
          {seller ? <> · by {seller.display_name}</> : null}
        </div>
        <div className="detail-desc">
          {listing.description || 'No description. It is what it is.'}
        </div>

        {listing.status === 'active' && seller && !isMine && (
          <a
            className="btn-wa"
            href={whatsAppLink(seller.phone, listing.title, listing.price_aed)}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 WhatsApp the seller
          </a>
        )}
        {isMine && (
          <p className="panel-note">
            This is your listing. Manage it from <a href="/my-listings">My listings</a>.
          </p>
        )}
      </div>
    </div>
  );
}
