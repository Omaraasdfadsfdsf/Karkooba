import Link from 'next/link';
import Icon from '@/components/Icon';
import ProfileMenu from '@/components/ProfileMenu';
import SearchBox from '@/components/SearchBox';
import { getDict } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';

export default async function Header() {
  const { dict, locale } = await getDict();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = '';
  let unread = 0;
  if (user) {
    const [profileRes, unreadRes] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null)
        .neq('sender_id', user.id),
    ]);
    displayName = profileRes.data?.display_name ?? '';
    unread = unreadRes.count ?? 0;
  }

  const otherLocale = locale === 'en' ? 'ar' : 'en';

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo" title="KARKOOBA">
          <span className="en">Karkooba</span>
          <span className="ar">كركوبة</span>
        </Link>
        <SearchBox />
        <nav className="flex items-center gap-2">
          <a
            href={`/locale/${otherLocale}`}
            className="icon-btn lang-btn"
            title={otherLocale === 'ar' ? 'العربية' : 'English'}
          >
            {otherLocale === 'ar' ? 'ع' : 'EN'}
          </a>
          {user && (
            <Link href="/messages" className="icon-btn" title={dict.nav.messages} aria-label={dict.nav.messages}>
              <Icon name="chat" />
              {unread > 0 && <span className="badge">{unread > 99 ? '99+' : unread}</span>}
            </Link>
          )}
          {user ? (
            <ProfileMenu
              initial={(displayName || user.email || '?').slice(0, 1)}
              name={displayName}
            />
          ) : (
            <Link href="/login" className="icon-btn labeled" title={dict.nav.login}>
              <Icon name="user" size={16} /> {dict.nav.login}
            </Link>
          )}
          <Link href="/post" className="btn-post">
            {dict.nav.sell}
          </Link>
        </nav>
      </div>
    </header>
  );
}
