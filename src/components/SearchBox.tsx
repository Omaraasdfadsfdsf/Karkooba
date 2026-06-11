'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Icon from '@/components/Icon';
import { useI18n } from '@/components/I18nProvider';

function SearchBoxInner() {
  const { dict } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set('q', q.trim());
    else next.delete('q');
    router.push(`/?${next.toString()}`);
  }

  return (
    <form className="searchwrap" onSubmit={submit} role="search">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={dict.nav.searchPlaceholder}
        aria-label={dict.nav.search}
      />
      <button type="submit" aria-label={dict.nav.search}>
        <Icon name="search" />
      </button>
    </form>
  );
}

export default function SearchBox() {
  return (
    <Suspense
      fallback={
        <div className="searchwrap">
          <input type="text" disabled aria-hidden="true" />
        </div>
      }
    >
      <SearchBoxInner />
    </Suspense>
  );
}
