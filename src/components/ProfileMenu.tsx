'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { useI18n } from '@/components/I18nProvider';

export default function ProfileMenu({ initial, name }: { initial: string; name?: string }) {
  const { dict } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div className="menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="profile-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={dict.nav.profile}
      >
        <span className="avatar-dot">{initial}</span>
        {name && <span className="hidden sm:inline">{name}</span>}
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          <Link href="/my-listings" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="box" size={16} /> {dict.nav.myListings}
          </Link>
          <Link href="/messages" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="chat" size={16} /> {dict.nav.messages}
          </Link>
          <Link href="/settings" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="settings" size={16} /> {dict.nav.settings}
          </Link>
          <div className="sep" />
          <form action="/auth/signout" method="post">
            <button type="submit" role="menuitem">
              <Icon name="logout" size={16} /> {dict.nav.logout}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
