'use client';

import Image from 'next/image';
import { useState } from 'react';
import Icon from '@/components/Icon';

interface Props {
  photos: { url: string; alt: string }[];
}

export default function PhotoGallery({ photos }: Props) {
  const [selected, setSelected] = useState(0);

  if (photos.length === 0) {
    return (
      <div>
        <div className="detail-gallery-main" role="img" aria-label="No photo provided">
          <Icon name="box" size={56} />
        </div>
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
          sizes="(max-width: 760px) 100vw, 480px"
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
