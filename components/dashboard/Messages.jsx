'use client';

import React, { useState } from 'react';
import { Send, Search, MoreVertical } from 'lucide-react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Annapoorna Food Relief',
      lastMessage: 'Thank you for your donation!',
      time: '2h ago',
      unread: 2,
      isNGO: true,
      avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100',
    },
    {
      id: 2,
      name: 'Sarah Chen',
      lastMessage: 'Is the desk still available?',
      time: '1d ago',
      unread: 0,
      isNGO: false,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    },
  ];

  const active = conversations.find((c) => c.id === selectedChat) ?? conversations[0];

  return (
    <div className="flex min-h-[420px] flex-col gap-0 sm:min-h-[520px]">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">Messages</h2>
        <p className="mt-1 text-sm text-slate-300">Chat with donors and organizations</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm lg:flex-row">
        <div className="flex w-full flex-col border-b border-zinc-100 bg-zinc-50/50 lg:w-72 lg:border-b-0 lg:border-r xl:w-80">
          <div className="p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                placeholder="Search chats…"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
          </div>
          <div className="flex max-h-[200px] flex-1 gap-1 overflow-y-auto px-2 pb-3 lg:max-h-none">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setSelectedChat(conv.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
                  selectedChat === conv.id
                    ? 'bg-white shadow-sm ring-1 ring-zinc-200'
                    : 'hover:bg-white/80'
                }`}
              >
                <div className="relative shrink-0">
                  <img src={conv.avatar} className="h-11 w-11 rounded-xl object-cover ring-1 ring-zinc-100" alt="" />
                  {conv.unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-600 px-1 text-[10px] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">{conv.name}</p>
                  <p className="truncate text-xs text-zinc-500">{conv.lastMessage}</p>
                </div>
                <span className="shrink-0 text-[10px] font-medium text-zinc-400">{conv.time}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-[320px] flex-1 flex-col bg-white lg:min-h-0">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <img src={active.avatar} className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-zinc-100" alt="" />
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-zinc-900">{active.name}</h3>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                  {active.isNGO ? 'Verified NGO' : 'Neighbor'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
              aria-label="More"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-800">
                Hello! We saw your listing for jackets.
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-emerald-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
                Hi! Yes, they are available for pickup.
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 p-4 sm:p-5">
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-1.5 pl-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message…"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors hover:bg-zinc-800"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
