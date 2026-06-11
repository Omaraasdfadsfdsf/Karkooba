'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function SearchBoxInner() {
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
        placeholder="Search the junk pile... old fans, broken chairs, mystery cables"
        aria-label="Search listings"
      />
      <button type="submit">Search</button>
    </form>
  );
}

export default function SearchBox() {
  return (
    <Suspense
      fallback={
        <div className="searchwrap">
          <input type="text" placeholder="Search the junk pile..." aria-label="Search listings" disabled />
          <button type="button">Search</button>
        </div>
      }
    >
      <SearchBoxInner />
    </Suspense>
  );
}
