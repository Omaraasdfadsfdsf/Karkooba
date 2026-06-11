import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SearchBox from './SearchBox';

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo" title="Back to all listings">
          <span className="en">Karkooba</span>
          <span className="ar">كركوبة</span>
        </Link>
        <SearchBox />
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/my-listings" className="nav-link">
                My listings
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className="nav-link accent bg-transparent border-0 cursor-pointer p-0 font-bold">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="nav-link">
              Log in
            </Link>
          )}
          <Link href="/post" className="btn-post">
            + Sell your karkooba
          </Link>
        </nav>
      </div>
    </header>
  );
}
