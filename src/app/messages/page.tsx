import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Icon from '@/components/Icon';
import { getDict } from '@/lib/i18n/server';
import { createClient } from '@/lib/supabase/server';
import { fmtPriceL, photoUrl } from '@/lib/utils';

export const metadata: Metadata = { title: 'Messages' };
export const dynamic = 'force-dynamic';

interface ConversationRow {
  id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  listings: {
    id: string;
    title: string;
    price_aed: number;
    listing_photos: { storage_path: string; position: number }[];
  } | null;
  buyer: { display_name: string } | null;
  seller: { display_name: string } | null;
  messages: { body: string; sender_id: string; read_at: string | null; created_at: string }[];
}

export default async function MessagesPage() {
  const { dict, locale } = await getDict();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/messages');

  const { data } = await supabase
    .from('conversations')
    .select(
      `id, buyer_id, seller_id, last_message_at,
       listings(id, title, price_aed, listing_photos(storage_path, position)),
       buyer:profiles!conversations_buyer_id_fkey(display_name),
       seller:profiles!conversations_seller_id_fkey(display_name),
       messages(body, sender_id, read_at, created_at)`
    )
    .order('last_message_at', { ascending: false })
    .order('created_at', { referencedTable: 'messages', ascending: false })
    .limit(1, { referencedTable: 'messages' });

  const conversations = (data ?? []) as unknown as ConversationRow[];

  return (
    <div className="panel-wrap">
      <div className="panel wide">
        <h1>{dict.chat.title}</h1>
        <p className="sub">{dict.chat.sub}</p>

        {conversations.length === 0 ? (
          <div className="empty">
            <div className="big">
              <Icon name="chat" size={26} />
            </div>
            <h3>{dict.chat.emptyTitle}</h3>
            <p>{dict.chat.emptySub}</p>
          </div>
        ) : (
          <div className="chat-list">
            {conversations.map((c) => {
              const other = c.buyer_id === user.id ? c.seller : c.buyer;
              const last = c.messages[0];
              const unread = Boolean(last && last.sender_id !== user.id && !last.read_at);
              const photos = [...(c.listings?.listing_photos ?? [])].sort(
                (a, b) => a.position - b.position
              );
              const cover = photos[0];
              return (
                <Link key={c.id} href={`/messages/${c.id}`} className="chat-list-item">
                  <span className="thumb">
                    {cover ? (
                      <Image
                        src={photoUrl(cover.storage_path)}
                        alt=""
                        fill
                        sizes="52px"
                      />
                    ) : (
                      <Icon name="box" size={22} />
                    )}
                  </span>
                  <span className="info">
                    <span className="who">
                      {other?.display_name ?? '—'}
                      {unread && <span className="unread-dot" />}
                    </span>
                    <span className="what">
                      {c.listings
                        ? `${c.listings.title} · ${fmtPriceL(c.listings.price_aed, dict)}`
                        : dict.chat.deletedListing}
                    </span>
                    {last && (
                      <span className={`last ${unread ? 'unread' : ''}`}>
                        {last.sender_id === user.id ? `${dict.chat.you}: ` : ''}
                        {last.body}
                      </span>
                    )}
                  </span>
                  <span className="chat-time">
                    {new Date(c.last_message_at).toLocaleDateString(
                      locale === 'ar' ? 'ar-AE' : 'en-AE',
                      { day: 'numeric', month: 'short' }
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
