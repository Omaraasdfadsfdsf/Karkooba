import { NextResponse } from 'next/server';
import { isLocale } from '@/lib/i18n/dictionaries';
import { LOCALE_COOKIE } from '@/lib/i18n/server';

// GET /locale/en or /locale/ar — sets the language cookie and returns
// to the page the user was on.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params;
  const url = new URL(request.url);
  const back = url.searchParams.get('back');
  const referer = request.headers.get('referer');

  let target = '/';
  if (back && back.startsWith('/')) target = back;
  else if (referer) {
    try {
      const refUrl = new URL(referer);
      if (refUrl.origin === url.origin) target = refUrl.pathname + refUrl.search;
    } catch {
      // ignore malformed referer
    }
  }

  const response = NextResponse.redirect(new URL(target, request.url));
  if (isLocale(lang)) {
    response.cookies.set(LOCALE_COOKIE, lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }
  return response;
}
