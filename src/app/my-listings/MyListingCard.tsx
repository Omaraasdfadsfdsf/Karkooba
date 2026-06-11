'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { markSold, relist, removeListing } from '@/app/actions/listings';
import { categoryEmoji, categoryLabel } from '@/lib/constants';
import type { ListingWithPhotos } from '@/lib/types';
import { fmtPrice, listingPath, photoUrl } from '@/lib/utils';

export default function MyListingCard({ listing }: { listing: ListingWithPhotos }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const photos = [...listing.listing_photos].sort((a, b) => a.position - b.position);
  const cover = photos[0];

  function run(action: (id: string) => Promise<void>) {
    startTransition(async () => {
      await action(listing.id);
    });
  }

  return (
    <div className="card" style={{ cursor: 'default' }}>
      <div className={`price-sticker ${listing.price_aed === 0 ? 'free' : ''}`}>
        {fmtPrice(listing.price_aed)}
      </div>
      <div className={`badge-status ${listing.status === 'sold' ? 'sold' : 'active'}`}>
        {listing.status === 'sold' ? 'Sold' : 'Live'}
      </div>
      <Link href={listingPath(listing.id, listing.title)} className="card-img" style={{ textDecoration: 'none' }}>
        {cover ? (
          <Image
            src={photoUrl(cover.storage_path)}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, 25vw"
          />
        ) : (
          <span aria-hidden="true">{categoryEmoji(listing.category)}</span>
        )}
      </Link>
      <div className="card-body">
        <h3>{listing.title}</h3>
        <div className="card-meta">
          <span>{listing.emirate}</span>
          <span>{categoryLabel(listing.category)}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {listing.status === 'active' ? (
            <button className="btn-small" disabled={pending} onClick={() => run(markSold)}>
              ✓ Mark sold
            </button>
          ) : (
            <button className="btn-small" disabled={pending} onClick={() => run(relist)}>
              ↻ Relist
            </button>
          )}
          {confirmDelete ? (
            <button
              className="btn-small danger"
              disabled={pending}
              onClick={() => run(removeListing)}
            >
              Sure? Tap again
            </button>
          ) : (
            <button
              className="btn-small danger"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
            >
              🗑 Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
