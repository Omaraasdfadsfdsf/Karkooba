'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  photos: { url: string; alt: string }[];
  fallbackEmoji: string;
}

export default function PhotoGallery({ photos, fallbackEmoji }: Props) {
  const [selected, setSelected] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="detail-gallery-main" role="img" aria-label="No photo provided">
        <span aria-hidden="true">{fallbackEmoji}</span>
      </div>
    );
  }

  const current = photos[Math.min(selected, photos.length - 1)];

  return (
    <div>
      <div className="detail-gallery-main">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          sizes="(max-width: 640px) 100vw, 560px"
          priority
        />
      </div>
      {photos.length > 1 && (
        <div className="detail-thumbs">
          {photos.map((p, i) => (
            <button
              key={p.url}
              type="button"
              className={i === selected ? 'sel' : ''}
              onClick={() => setSelected(i)}
              aria-label={`Photo ${i + 1} of ${photos.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
