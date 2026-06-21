"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Conversation = { id: string; title?: string };

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;

    let mounted = true;
    (async () => {
      const response = await fetch('/api/chat/conversations', { cache: 'no-store' });
      const payload = await response.json().catch(() => null) as { conversations?: Conversation[]; error?: string } | null;

      if (!response.ok) {
        console.error('fetch convs error', payload?.error ?? response.statusText);
        return;
      }

      if (mounted) setConversations(payload?.conversations ?? []);
    })();

    return () => {
      mounted = false;
    };
  }, [status]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Conversations</h2>
      <div className="space-y-2">
        {status === 'unauthenticated' && <div className="text-sm text-white/60">Sign in to see conversations.</div>}
        {conversations.length === 0 && <div className="text-sm text-white/60">No conversations yet.</div>}
        {conversations.map((c) => (
          <button key={c.id} onClick={() => router.push(`/dashboard/messages?conversation=${c.id}`)} className="w-full text-left p-3 rounded bg-white/5">
            <div className="font-medium">{c.title ?? 'Conversation'}</div>
            <div className="text-xs text-white/60">{c.id}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
