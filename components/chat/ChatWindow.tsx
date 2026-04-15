"use client";

import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MessageBubble from './MessageBubble';
import { getOrCreateChatKey, encryptMessage, decryptMessage } from '@/lib/crypto';

type RawMessage = {
  id: string;
  sender_id: string;
  conversation_id: string;
  encrypted_content: string;
  nonce: string;
  created_at: string;
};

type DecryptedMessage = { id: string; text: string; sender: string; created_at: string };

interface Props {
  conversationId?: string | null;
}

export default function ChatWindow({ conversationId }: Props) {
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    let mounted = true;

    let pollInterval: NodeJS.Timeout | null = null;

    try {
      const k = getOrCreateChatKey();
      setKey(k);

      (async () => {
        const { data } = await supabase.auth.getUser();
        const u = data?.user ?? null;
        if (!mounted) return;
        setUserId(u?.id ?? null);

        const { data: rows, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('fetch messages error', error);
        } else if (rows) {
          const dec = (rows as RawMessage[]).map((m) => {
            const t = decryptMessage(k, m.encrypted_content, m.nonce) ?? '[unable to decrypt]';
            return { id: m.id, text: t, sender: m.sender_id, created_at: m.created_at };
          });
          setMessages(dec);
          setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'auto' }), 50);
        }
      })();

    // Poll as a fallback in case realtime misses messages or connection drops
    pollInterval = setInterval(async () => {
      try {
        const { data: rows } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        if (!mounted || !rows) return;
        const dec = (rows as RawMessage[]).map((m) => ({ id: m.id, text: decryptMessage(k, m.encrypted_content, m.nonce) ?? '[unable to decrypt]', sender: m.sender_id, created_at: m.created_at }));
        setMessages((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const merged = [...prev];
          dec.forEach((d) => {
            if (!ids.has(d.id)) merged.push(d);
          });
          merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          return merged;
        });
      } catch (e) {
        // ignore poll errors
      }
    }, 15000);
    } catch (e) {
      console.warn('Chat key unavailable (client-only)', e);
    }

    const channel = supabase
      .channel(`public:messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const newRow = payload.new as RawMessage;
          const t = key ? decryptMessage(key, newRow.encrypted_content, newRow.nonce) ?? '[unable to decrypt]' : '[no key]';
          setMessages((prev) => [...prev, { id: newRow.id, text: t, sender: newRow.sender_id, created_at: newRow.created_at }]);
          setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
      try {
        supabase.removeChannel(channel);
      } catch {
        try {
          channel.unsubscribe();
        } catch {}
      }
    };
  }, [conversationId, key]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !conversationId) return;
    setSending(true);
    try {
      // Sanitize via server-side profanity check before encrypting
      const profResp = await fetch('/api/chat/profanity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() }),
      });

      let sanitized = input.trim();
      try {
        const profData = await profResp.json();
        if (profData && typeof profData.text === 'string') sanitized = profData.text;
      } catch (e) {
        // fallback to original text
      }

      const k = key ?? getOrCreateChatKey();
      const { encrypted, nonce } = encryptMessage(k, sanitized);

      // Send the encrypted payload to a server route that enforces membership
      const sendResp = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId, encrypted_content: encrypted, nonce }),
      });

      const sendData = await sendResp.json().catch(() => null);
      if (!sendResp.ok) {
        console.error('send message failed', sendData);
      } else {
        setInput('');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} currentUserId={userId} />
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t bg-white/3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 rounded-lg px-3 py-2 bg-white/5 text-white outline-none"
          />
          <button type="submit" disabled={sending} className="px-4 py-2 bg-emerald-500 rounded text-white">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
