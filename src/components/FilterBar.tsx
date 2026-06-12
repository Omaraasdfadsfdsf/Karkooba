'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { CATEGORIES, EMIRATES } from '@/lib/constants';

function buildHref(params: URLSearchParams, key: string, value: string): string {
  const next = new URLSearchParams(params.toString());
  if (value) next.set(key, value);
  else next.delete(key);
  const qs = next.toString();
  // Land on the listings grid, past the landing hero.
  return (qs ? `/?${qs}` : '/') + '#listings';
}

function FilterBarInner() {
  const { dict } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const activeCat = params.get('cat') ?? '';
  const activeEmirate = params.get('emirate') ?? '';
  const activeSort = params.get('sort') ?? 'newest';

  function onSelect(key: string, value: string) {
    router.push(buildHref(params, key, value));
  }

  return (
    <>
      <div className="filters" role="group" aria-label={dict.filters.all}>
        <Link href={buildHref(params, 'cat', '')} className={`cat-box ${activeCat === '' ? 'active' : ''}`}>
          {dict.filters.all}
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={buildHref(params, 'cat', activeCat === c.id ? '' : c.id)}
            className={`cat-box ${activeCat === c.id ? 'active' : ''}`}
          >
            {dict.categories[c.id]}
          </Link>
        ))}
      </div>
      <div className="filters">
        <div className="push-right">
          <select
            className="boardselect"
            value={activeSort}
            onChange={(e) => onSelect('sort', e.target.value === 'newest' ? '' : e.target.value)}
            aria-label={dict.filters.sortNewest}
          >
            <option value="newest">{dict.filters.sortNewest}</option>
            <option value="cheapest">{dict.filters.sortCheapest}</option>
          </select>
          <select
            className="boardselect"
            value={activeEmirate}
            onChange={(e) => onSelect('emirate', e.target.value)}
            aria-label={dict.filters.allEmirates}
          >
            <option value="">{dict.filters.allEmirates}</option>
            {EMIRATES.map((e) => (
              <option key={e} value={e}>
                {dict.emirates[e]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}

export default function FilterBar() {
  return (
    <Suspense fallback={<div className="filters" style={{ minHeight: 44 }} />}>
      <FilterBarInner />
    </Suspense>
  );
}
