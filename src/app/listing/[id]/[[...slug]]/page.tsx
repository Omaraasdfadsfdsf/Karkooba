import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Icon from '@/components/Icon';
import PhotoGallery from '@/components/PhotoGallery';
import { startConversation } from '@/app/actions/chat';
import { t } from '@/lib/i18n/dictionaries';
import { getDict } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';
import type { ListingWithSeller } from '@/lib/types';
import {
  fmtDate,
  fmtPrice,
  fmtPriceL,
  listingPath,
  photoUrl,
  slugify,
} from '@/lib/utils';

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
    listing.description?.slice(0, 150) || 'Pre-loved find on KARKOOBA.'
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
  const { dict, locale } = await getDict();

  const listing = await fetchListing(id);
  if (!listing) notFound();

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
  const startThisConversation = startConversation.bind(null, listing.id);
  const waText = encodeURIComponent(
    t(dict.detail.waText, { title: listing.title, price: fmtPriceL(listing.price_aed, dict) })
  );

  return (
    <div className="panel-wrap">
      <div className="panel wide">
        {posted && (
          <p className="form-success" style={{ marginTop: 0, marginBottom: 18 }}>
            {dict.detail.posted}
          </p>
        )}
        {listing.status === 'sold' && <div className="sold-banner">{dict.detail.soldBanner}</div>}

        <div className="detail-layout">
          <PhotoGallery photos={photos} />

          <div>
            <h1>{listing.title}</h1>
            <div style={{ margin: '14px 0' }}>
              <span className={`detail-price ${listing.price_aed === 0 ? 'free' : ''}`}>
                {fmtPriceL(listing.price_aed, dict)}
              </span>
            </div>
            <div className="detail-meta">
              {dict.emirates[listing.emirate] ?? listing.emirate} ·{' '}
              {dict.categories[listing.category] ?? listing.category}
              {listing.condition ? <> · {dict.conditions[listing.condition]}</> : null} ·{' '}
              {dict.detail.listed} {fmtDate(listing.created_at, locale)}
              {seller ? (
                <>
                  {' '}
                  · {dict.detail.by}{' '}
                  <a href={`/seller/${listing.owner_id}`} style={{ color: 'var(--purple)' }}>
                    {seller.display_name}
                  </a>
                </>
              ) : null}
            </div>
            <div className="detail-desc">
              {listing.description || dict.detail.noDescription}
            </div>

            {listing.status === 'active' && seller && !isMine && (
              <>
                <form action={startThisConversation}>
                  <button type="submit" className="btn-chat">
                    <Icon name="chat" /> {user ? dict.detail.message : dict.chat.loginToChat}
                  </button>
                </form>
                <a
                  className="btn-wa"
                  href={`https://wa.me/${seller.phone}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="whatsapp" size={16} /> {dict.detail.whatsapp}
                </a>
              </>
            )}
            {isMine && (
              <p className="panel-note" style={{ textAlign: 'start' }}>
                {dict.detail.yourListing} <a href="/my-listings">{dict.nav.myListings}</a>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
