'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { markSold, relist, removeListing } from '@/app/actions/listings';
import Icon from '@/components/Icon';
import { useI18n } from '@/components/I18nProvider';
import type { ListingWithPhotos } from '@/lib/types';
import { fmtPriceL, listingPath, photoUrl } from '@/lib/utils';

export default function MyListingCard({ listing }: { listing: ListingWithPhotos }) {
  const { dict } = useI18n();
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
        {fmtPriceL(listing.price_aed, dict)}
      </div>
      <div className={`badge-status ${listing.status === 'sold' ? 'sold' : 'active'}`}>
        {listing.status === 'sold' ? dict.card.sold : dict.card.live}
      </div>
      <Link
        href={listingPath(listing.id, listing.title)}
        className="card-img"
        style={{ textDecoration: 'none' }}
      >
        {cover ? (
          <Image
            src={photoUrl(cover.storage_path)}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, 25vw"
          />
        ) : (
          <Icon name="box" size={44} />
        )}
      </Link>
      <div className="card-body">
        <h3>{listing.title}</h3>
        <div className="card-meta">
          <span>{dict.emirates[listing.emirate] ?? listing.emirate}</span>
          <span>{dict.categories[listing.category] ?? listing.category}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {listing.status === 'active' ? (
            <button className="btn-small" disabled={pending} onClick={() => run(markSold)}>
              <Icon name="check" size={14} /> {dict.myListings.markSold}
            </button>
          ) : (
            <button className="btn-small" disabled={pending} onClick={() => run(relist)}>
              <Icon name="refresh" size={14} /> {dict.myListings.relist}
            </button>
          )}
          {confirmDelete ? (
            <button
              className="btn-small danger"
              disabled={pending}
              onClick={() => run(removeListing)}
            >
              {dict.myListings.confirmDelete}
            </button>
          ) : (
            <button
              className="btn-small danger"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
            >
              <Icon name="trash" size={14} /> {dict.myListings.delete}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
