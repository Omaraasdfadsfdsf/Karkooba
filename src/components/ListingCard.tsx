import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/Icon';
import type { Dict } from '@/lib/i18n/dictionaries';
import type { ListingWithPhotos } from '@/lib/types';
import { fmtPriceL, listingPath, photoUrl } from '@/lib/utils';

interface Props {
  listing: ListingWithPhotos;
  dict: Dict;
  isMine?: boolean;
}

export default function ListingCard({ listing, dict, isMine }: Props) {
  const photos = [...listing.listing_photos].sort((a, b) => a.position - b.position);
  const cover = photos[0];

  return (
    <Link
      href={listingPath(listing.id, listing.title)}
      className="card"
      aria-label={`${listing.title}, ${fmtPriceL(listing.price_aed, dict)}`}
    >
      <div className={`price-sticker ${listing.price_aed === 0 ? 'free' : ''}`}>
        {fmtPriceL(listing.price_aed, dict)}
      </div>
      {isMine && listing.status === 'active' && (
        <div className="badge-status active">{dict.card.yours}</div>
      )}
      {listing.status === 'sold' && <div className="badge-status sold">{dict.card.sold}</div>}
      <div className="card-img">
        {cover ? (
          <Image
            src={photoUrl(cover.storage_path)}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <Icon name="box" size={44} />
        )}
      </div>
      <div className="card-body">
        <h3>{listing.title}</h3>
        <div className="card-meta">
          <span>{dict.emirates[listing.emirate] ?? listing.emirate}</span>
          <span>{dict.categories[listing.category] ?? listing.category}</span>
        </div>
      </div>
    </Link>
  );
}
