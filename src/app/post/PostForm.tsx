'use client';

import { useRef, useState } from 'react';
import { createListing } from '@/app/actions/listings';
import Icon from '@/components/Icon';
import { useI18n } from '@/components/I18nProvider';
import { compressImage } from '@/lib/compressImage';
import { CATEGORIES, CONDITIONS, EMIRATES, MAX_DESCRIPTION, MAX_PHOTOS, MAX_TITLE } from '@/lib/constants';
import { t } from '@/lib/i18n/dictionaries';
import { validateListing } from '@/lib/validation';

interface PendingPhoto {
  file: File;
  previewUrl: string;
}

export default function PostForm({ defaultEmirate }: { defaultEmirate: string }) {
  const { dict } = useI18n();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('good');
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
    if (room <= 0) return;
    setError(null);
    setCompressing(true);
    const added: PendingPhoto[] = [];
    for (const file of files.slice(0, room)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressed = await compressImage(file);
        added.push({ file: compressed, previewUrl: URL.createObjectURL(compressed) });
      } catch {
        setError(`Couldn't read "${file.name}".`);
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
      condition,
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
    fd.set('condition', condition);
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
      setError(dict.auth.loginFailed);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="title">{dict.post.itemTitle}</label>
        <input
          id="title"
          maxLength={MAX_TITLE}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={dict.post.itemTitlePh}
        />
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="price">{dict.post.price}</label>
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
            dir="ltr"
          />
        </div>
        <div className="field">
          <label htmlFor="category">{dict.post.category}</label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="" disabled>
              {dict.welcome.pickOne}
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {dict.categories[c.id]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label htmlFor="condition">{dict.post.condition}</label>
          <select
            id="condition"
            required
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {dict.conditions[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="emirate">{dict.post.emirate}</label>
          <select id="emirate" required value={emirate} onChange={(e) => setEmirate(e.target.value)}>
            {EMIRATES.map((e) => (
              <option key={e} value={e}>
                {dict.emirates[e]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>{dict.post.photos}</label>
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
          <Icon name="camera" size={18} />
          {compressing
            ? dict.post.compressing
            : photos.length === 0
              ? dict.post.addPhotos
              : t(dict.post.photosAdded, { n: photos.length, max: MAX_PHOTOS })}
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
                  aria-label={dict.post.removePhoto}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="field">
        <label htmlFor="description">{dict.post.description}</label>
        <textarea
          id="description"
          maxLength={MAX_DESCRIPTION}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={dict.post.descriptionPh}
        />
        <p className="hint">{t(dict.post.charsLeft, { n: MAX_DESCRIPTION - description.length })}</p>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy || compressing}>
        {busy ? dict.post.submitting : dict.post.submit}
      </button>
    </form>
  );
}
