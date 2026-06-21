"use client";

import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import { getOrCreateChatKey, encryptMessage, decryptMessage } from '@/lib/crypto';
import { useSession } from 'next-auth/react';

type RawMessage = {
  id: string;
  sender_id: string;
  conversation_id: string;
  encrypted_content: string;
  nonce: string;
  text?: string;
  is_system?: boolean;
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!conversationId || status !== 'authenticated') return;
    let mounted = true;

    let pollInterval: NodeJS.Timeout | null = null;

    try {
      const k = getOrCreateChatKey();
      setKey(k);

      const fetchMessages = async (replace = false) => {
        const response = await fetch(`/api/chat/messages?conversation_id=${encodeURIComponent(conversationId)}`, { cache: 'no-store' });
        const payload = await response.json().catch(() => null) as { messages?: RawMessage[]; error?: string } | null;

        if (!response.ok) {
          console.error('fetch messages error', payload?.error ?? response.statusText);
          return;
        }

        if (!mounted || !payload?.messages) return;

        const dec = payload.messages.map((m) => {
          const text = m.is_system || !m.nonce
            ? (m.text ?? m.encrypted_content)
            : decryptMessage(k, m.encrypted_content, m.nonce) ?? '[unable to decrypt]';

          return { id: m.id, text, sender: m.sender_id, created_at: m.created_at };
        });

        if (replace) {
          setMessages(dec);
          setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'auto' }), 50);
          return;
        }

        setMessages((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const merged = [...prev];
          dec.forEach((d) => {
            if (!ids.has(d.id)) merged.push(d);
          });
          merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          return merged;
        });
      };

      fetchMessages(true);

    // Poll as a fallback in case realtime misses messages or connection drops
    pollInterval = setInterval(async () => {
      try {
        await fetchMessages();
      } catch {
        // ignore poll errors
      }
    }, 15000);
    } catch (e) {
      console.warn('Chat key unavailable (client-only)', e);
    }

    return () => {
      mounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [conversationId, status]);

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
      } catch {
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
        const message = sendData?.message as { id: string; senderId: string; createdAt: string } | undefined;
        if (message) {
          setMessages((prev) => [
            ...prev,
            {
              id: message.id,
              text: sanitized,
              sender: message.senderId,
              created_at: message.createdAt,
            },
          ]);
        }
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
