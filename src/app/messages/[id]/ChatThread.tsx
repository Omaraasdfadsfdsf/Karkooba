'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendMessage } from '@/app/actions/chat';
import Icon from '@/components/Icon';
import { useI18n } from '@/components/I18nProvider';
import { createClient } from '@/lib/supabase/client';
import { fmtTime } from '@/lib/utils';

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface Props {
  conversationId: string;
  userId: string;
  otherName: string;
  listingTitle: string;
  listingHref: string | null;
  initialMessages: Message[];
}

export default function ChatThread({
  conversationId,
  userId,
  otherName,
  listingTitle,
  listingHref,
  initialMessages,
}: Props) {
  const { dict, locale } = useI18n();
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const markRead = useCallback(() => {
    supabase.rpc('mark_conversation_read', { conv: conversationId }).then(() => {});
  }, [supabase, conversationId]);

  // Live updates: new messages in this conversation arrive over Supabase Realtime.
  useEffect(() => {
    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
          if (incoming.sender_id !== userId) markRead();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId, userId, markRead]);

  useEffect(() => {
    markRead();
  }, [markRead]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || body.length > 1000 || sending) return;
    setSending(true);
    // Server action: inserts the message and emails the recipient if needed.
    const { message } = await sendMessage(conversationId, body);
    if (message) {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      setDraft('');
    }
    setSending(false);
  }

  let lastDay = '';

  return (
    <div className="chat-thread">
      <div className="chat-head">
        <Link href="/messages" className="icon-btn" aria-label={dict.chat.title}>
          <Icon name="back" />
        </Link>
        <div className="meta">
          <div className="who">{otherName}</div>
          <div className="what">
            {dict.chat.about}:{' '}
            {listingHref ? <Link href={listingHref}>{listingTitle}</Link> : listingTitle}
          </div>
        </div>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.map((m) => {
          const day = new Date(m.created_at).toLocaleDateString(
            locale === 'ar' ? 'ar-AE' : 'en-AE',
            { day: 'numeric', month: 'short' }
          );
          const sep = day !== lastDay;
          lastDay = day;
          return (
            <div key={m.id} style={{ display: 'contents' }}>
              {sep && <div className="day-sep">{day}</div>}
              <div className={`bubble ${m.sender_id === userId ? 'mine' : 'theirs'}`}>
                {m.body}
                <time>{fmtTime(m.created_at, locale)}</time>
              </div>
            </div>
          );
        })}
      </div>

      <form className="chat-compose" onSubmit={send}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={dict.chat.inputPh}
          maxLength={1000}
          aria-label={dict.chat.inputPh}
        />
        <button type="submit" disabled={!draft.trim() || sending} aria-label={dict.chat.send}>
          <Icon name="send" />
        </button>
      </form>
    </div>
  );
}
