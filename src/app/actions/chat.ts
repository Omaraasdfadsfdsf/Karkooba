'use server';

import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { listingPath, siteUrl } from '@/lib/utils';

/** Opens (or finds) the conversation between the current user and a listing's seller. */
export async function startConversation(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from('listings')
    .select('id, title, owner_id, status')
    .eq('id', listingId)
    .maybeSingle();
  if (!listing || listing.status === 'deleted') redirect('/');

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(listingPath(listing.id, listing.title))}`);
  }
  if (listing.owner_id === user.id) redirect('/messages');

  // A profile is required so the seller sees who they're talking to.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile) {
    redirect(`/welcome?next=${encodeURIComponent(listingPath(listing.id, listing.title))}`);
  }

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listing.id)
    .eq('buyer_id', user.id)
    .maybeSingle();
  if (existing) redirect(`/messages/${existing.id}`);

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ listing_id: listing.id, buyer_id: user.id, seller_id: listing.owner_id })
    .select('id')
    .single();
  if (error || !created) {
    // Likely a race with another insert — try to find it again.
    const { data: retry } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .eq('buyer_id', user.id)
      .maybeSingle();
    if (retry) redirect(`/messages/${retry.id}`);
    redirect(listingPath(listing.id, listing.title));
  }

  redirect(`/messages/${created.id}`);
}

export interface SentMessage {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<{ message?: SentMessage; error?: string }> {
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 1000) return { error: 'Message must be 1–1000 characters.' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not logged in.' };

  // Anti-spam: per-sender message rate limits.
  const minuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const { count: lastMinute } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', user.id)
    .gte('created_at', minuteAgo);
  if ((lastMinute ?? 0) >= 15) {
    return { error: 'Slow down a little — too many messages at once.' };
  }

  // Was the recipient already waiting on unread messages from us?
  // If yes, skip the email — one notification per "burst" is enough.
  const { count: alreadyUnread } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('sender_id', user.id)
    .is('read_at', null);

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: user.id, body: trimmed })
    .select('id, sender_id, body, created_at')
    .single();
  if (error || !message) return { error: 'Could not send. Try again.' };

  if ((alreadyUnread ?? 0) === 0) {
    await notifyRecipient(conversationId, user.id, trimmed).catch((err) =>
      console.error('Chat notification failed:', err)
    );
  }

  return { message: message as SentMessage };
}

/** Best-effort email to the other participant. Requires SUPABASE_SERVICE_ROLE_KEY + RESEND_API_KEY. */
async function notifyRecipient(conversationId: string, senderId: string, preview: string) {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: conv } = await admin
    .from('conversations')
    .select('buyer_id, seller_id, listings(title)')
    .eq('id', conversationId)
    .maybeSingle();
  if (!conv) return;

  const recipientId = conv.buyer_id === senderId ? conv.seller_id : conv.buyer_id;
  const [{ data: recipient }, { data: senderProfile }] = await Promise.all([
    admin.auth.admin.getUserById(recipientId),
    admin.from('profiles').select('display_name').eq('id', senderId).maybeSingle(),
  ]);
  const email = recipient?.user?.email;
  if (!email) return;

  const listing = conv.listings as unknown as { title: string } | null;
  const senderName = senderProfile?.display_name ?? 'A buyer';
  const title = listing?.title ?? 'your listing';
  const link = `${siteUrl()}/messages/${conversationId}`;
  const safePreview = preview.slice(0, 120).replace(/</g, '&lt;');

  await sendEmail({
    to: email,
    subject: `${senderName} sent you a message about "${title}" · KARKOOBA`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#43325e">
        <h2 style="color:#a855f7">KARKOOBA <span style="color:#92819f;font-weight:normal">· كركوبة</span></h2>
        <p><b>${senderName}</b> sent you a message about <b>"${title}"</b>:</p>
        <p style="background:#f7f3fb;border-radius:10px;padding:14px 16px">${safePreview}</p>
        <p>
          <a href="${link}"
             style="display:inline-block;background:#a855f7;color:#fff;text-decoration:none;
                    padding:12px 22px;border-radius:10px;font-weight:bold">
            Reply on KARKOOBA
          </a>
        </p>
        <p style="color:#92819f;font-size:12px">
          You receive this because someone messaged you on KARKOOBA — the UAE's pre-loved marketplace.
        </p>
      </div>`,
  });
}
