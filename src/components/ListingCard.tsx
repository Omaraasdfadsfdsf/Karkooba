import Link from 'next/link';
import Image from 'next/image';
import type { ListingWithPhotos } from '@/lib/types';
import { categoryEmoji, categoryLabel } from '@/lib/constants';
import { fmtPrice, listingPath, photoUrl } from '@/lib/utils';

interface Props {
  listing: ListingWithPhotos;
  isMine?: boolean;
}

export default function ListingCard({ listing, isMine }: Props) {
  const photos = [...listing.listing_photos].sort((a, b) => a.position - b.position);
  const cover = photos[0];

  return (
    <Link
      href={listingPath(listing.id, listing.title)}
      className="card"
      aria-label={`${listing.title}, ${fmtPrice(listing.price_aed)}`}
    >
      <div className={`price-sticker ${listing.price_aed === 0 ? 'free' : ''}`}>
        {fmtPrice(listing.price_aed)}
      </div>
      {isMine && listing.status === 'active' && <div className="badge-status active">Yours</div>}
      {listing.status === 'sold' && <div className="badge-status sold">Sold</div>}
      <div className="card-img">
        {cover ? (
          <Image
            src={photoUrl(cover.storage_path)}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <span aria-hidden="true">{categoryEmoji(listing.category)}</span>
        )}
      </div>
      <div className="card-body">
        <h3>{listing.title}</h3>
        <div className="card-meta">
          <span>{listing.emirate}</span>
          <span>{categoryLabel(listing.category)}</span>
        </div>
      </div>
    </Link>
  );
}
