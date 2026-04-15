"use client";

import React from 'react';

interface Props {
  message: { id: string; text: string; sender: string; created_at: string };
  currentUserId?: string | null;
}

export default function MessageBubble({ message, currentUserId }: Props) {
  const isMe = !!currentUserId && message.sender === currentUserId;

  return (
    <div className={`${isMe ? 'justify-end' : 'justify-start'} flex`}> 
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg ${isMe ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white'}`}
      >
        <div className="text-sm leading-tight break-words">{message.text}</div>
        <div className="text-xs text-white/60 mt-1 text-right">{new Date(message.created_at).toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
