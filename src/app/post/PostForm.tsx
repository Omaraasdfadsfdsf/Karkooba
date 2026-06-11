'use client';

import { useRef, useState } from 'react';
import { createListing } from '@/app/actions/listings';
import { compressImage } from '@/lib/compressImage';
import { CATEGORIES, EMIRATES, MAX_DESCRIPTION, MAX_PHOTOS, MAX_TITLE } from '@/lib/constants';
import { validateListing } from '@/lib/validation';

interface PendingPhoto {
  file: File;
  previewUrl: string;
}

export default function PostForm({ defaultEmirate }: { defaultEmirate: string }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [emirate, setEmirate] = useState(defaultEmirate);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onPickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-picking the same file
    if (files.length === 0) return;

    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setError(`Four photos max. It's karkooba, not a museum exhibit.`);
      return;
    }
    setError(null);
    setCompressing(true);
    const added: PendingPhoto[] = [];
    for (const file of files.slice(0, room)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressed = await compressImage(file);
        added.push({ file: compressed, previewUrl: URL.createObjectURL(compressed) });
      } catch {
        setError(`Couldn't read "${file.name}" — try a regular JPEG or PNG.`);
      }
    }
    setPhotos((prev) => [...prev, ...added]);
    setCompressing(false);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceNum = /^\d+$/.test(price.trim()) ? parseInt(price.trim(), 10) : NaN;
    const clientError = validateListing({
      title,
      description,
      price_aed: priceNum,
      category,
      emirate,
    });
    if (clientError) {
      setError(clientError);
      return;
    }

    setError(null);
    setBusy(true);
    const fd = new FormData();
    fd.set('title', title.trim());
    fd.set('price_aed', String(priceNum));
    fd.set('category', category);
    fd.set('emirate', emirate);
    fd.set('description', description.trim());
    photos.forEach((p) => fd.append('photos', p.file));

    try {
      const result = await createListing(fd);
      if (result?.error) {
        setError(result.error);
        setBusy(false);
      }
      // On success the action redirects to the new listing page.
    } catch (err) {
      // Next.js redirects surface as a thrown error — let those through.
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) throw err;
      setError('Could not post right now. Check your connection and try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="title">What is it?</label>
        <input
          id="title"
          maxLength={MAX_TITLE}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Old desk fan — loud but loyal"
        />
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="price">Price (AED) — 0 = free</label>
          <input
            id="price"
            type="number"
            min={0}
            max={999}
            required
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="15"
          />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" disabled>
              Pick one
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="emirate">Emirate</label>
        <select id="emirate" required value={emirate} onChange={(e) => setEmirate(e.target.value)}>
          {EMIRATES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Photos (up to {MAX_PHOTOS})</label>
        <div
          className="photo-drop"
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          {compressing
            ? '📷 Shrinking your photos…'
            : photos.length === 0
              ? '📷 Add photos — honest angles sell faster'
              : `📷 ${photos.length}/${MAX_PHOTOS} added — tap to add more`}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onPickPhotos}
        />
        {photos.length > 0 && (
          <div className="photo-previews">
            {photos.map((p, i) => (
              <div className="ph" key={p.previewUrl}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.previewUrl} alt={`Photo ${i + 1}`} />
                <button
                  type="button"
                  className="rm"
                  onClick={() => removePhoto(i)}
                  aria-label={`Remove photo ${i + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="field">
        <label htmlFor="description">Honest description (flaws welcome)</label>
        <textarea
          id="description"
          maxLength={MAX_DESCRIPTION}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Missing one wheel. Squeaks in a friendly way. Pickup only."
        />
        <p className="hint">
          {MAX_DESCRIPTION - description.length} characters left
        </p>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy || compressing}>
        {busy ? 'Posting…' : 'Post it →'}
      </button>
    </form>
  );
}
