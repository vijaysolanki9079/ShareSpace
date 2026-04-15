"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type ConvRow = { conversation_id: string; conversations?: { id: string; title?: string } };

export default function ConversationList() {
  const [conversations, setConversations] = useState<Array<{ id: string; title?: string }>>([]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;
      if (!user) return;

      const { data: rows, error } = await supabase
        .from('conversation_members')
        .select('conversation_id, conversations(id, title)')
        .eq('user_id', user.id);

      if (error) {
        console.error('fetch convs error', error);
        return;
      }

      const convs = ((rows ?? []) as unknown as ConvRow[]).map((r) => {
        const c = r.conversations ?? { id: r.conversation_id, title: 'Conversation' };
        return { id: c.id, title: c.title };
      });

      if (mounted) setConversations(convs);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-3">Conversations</h2>
      <div className="space-y-2">
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
