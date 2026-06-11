'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CATEGORIES, EMIRATES } from '@/lib/constants';

function buildHref(params: URLSearchParams, key: string, value: string): string {
  const next = new URLSearchParams(params.toString());
  if (value) next.set(key, value);
  else next.delete(key);
  const qs = next.toString();
  return qs ? `/?${qs}` : '/';
}

function FilterBarInner() {
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
      <div className="filters" role="group" aria-label="Filter by category">
        <Link href={buildHref(params, 'cat', '')} className={`chip ${activeCat === '' ? 'active' : ''}`}>
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={buildHref(params, 'cat', activeCat === c.id ? '' : c.id)}
            className={`chip ${activeCat === c.id ? 'active' : ''}`}
          >
            {c.emoji} {c.label}
          </Link>
        ))}
      </div>
      <div className="filters">
        <div className="push-right">
          <select
            className="boardselect"
            value={activeSort}
            onChange={(e) => onSelect('sort', e.target.value === 'newest' ? '' : e.target.value)}
            aria-label="Sort listings"
          >
            <option value="newest">Newest first</option>
            <option value="cheapest">Cheapest first</option>
          </select>
          <select
            className="boardselect"
            value={activeEmirate}
            onChange={(e) => onSelect('emirate', e.target.value)}
            aria-label="Filter by emirate"
          >
            <option value="">All Emirates</option>
            {EMIRATES.map((e) => (
              <option key={e} value={e}>
                {e}
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
