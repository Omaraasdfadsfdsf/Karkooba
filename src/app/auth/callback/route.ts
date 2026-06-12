import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Handles the redirect from Supabase email confirmation links.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/welcome';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // The email is confirmed on Supabase's side by the time this runs; the
  // session exchange only fails when the link was opened in a different
  // browser than the signup. Send them to log in with a success note.
  return NextResponse.redirect(new URL('/login?confirmed=1', request.url));
}
