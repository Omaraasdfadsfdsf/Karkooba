import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ChatThread from './ChatThread';
import { getDict } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';
import type { Listing } from '@/lib/types';
import { listingPath } from '@/lib/utils';

export const metadata: Metadata = { title: 'Messages' };
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const { dict } = await getDict();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/messages/${id}`);

  const { data: conversation } = await supabase
    .from('conversations')
    .select(
      `id, buyer_id, seller_id,
       listings(id, title, price_aed, status),
       buyer:profiles!conversations_buyer_id_fkey(display_name),
       seller:profiles!conversations_seller_id_fkey(display_name)`
    )
    .eq('id', id)
    .maybeSingle();
  if (!conversation) notFound();

  const conv = conversation as unknown as {
    id: string;
    buyer_id: string;
    seller_id: string;
    listings: Pick<Listing, 'id' | 'title' | 'price_aed' | 'status'> | null;
    buyer: { display_name: string } | null;
    seller: { display_name: string } | null;
  };

  const { data: messages } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })
    .limit(500);

  const otherName =
    (conv.buyer_id === user.id ? conv.seller?.display_name : conv.buyer?.display_name) ?? '—';

  return (
    <div className="panel-wrap">
      <div className="panel wide">
        <ChatThread
          conversationId={conv.id}
          userId={user.id}
          otherName={otherName}
          listingTitle={conv.listings?.title ?? dict.chat.deletedListing}
          listingHref={
            conv.listings ? listingPath(conv.listings.id, conv.listings.title) : null
          }
          initialMessages={messages ?? []}
        />
      </div>
    </div>
  );
}
