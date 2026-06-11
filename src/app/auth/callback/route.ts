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

  return NextResponse.redirect(new URL('/login?error=confirm', request.url));
}
