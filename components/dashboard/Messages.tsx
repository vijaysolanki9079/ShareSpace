/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Search, MoreVertical, ShieldAlert, Lock, MessageSquare, MapPin, Clock, Smile, X, ChevronDown } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';
import * as encryption from '@/lib/encryption';
import { decryptMessage as decryptLegacyMessage, getOrCreateChatKey } from '@/lib/crypto';
import { useChatSecurity } from '@/context/ChatSecurityContext';
import { ChatSecurityShield } from '../chat/ChatSecurityShield';
import { toast } from 'react-hot-toast';

interface MessagesProps {
  mode?: 'user' | 'ngo';
  initialSelectedChat?: string | null;
}

const PROJECT_EMOJIS = [
  '🙏',
  '😊',
  '👍',
  '❤️',
  '🤝',
  '🙌',
  '✅',
  '📦',
  '💻',
  '👕',
  '📚',
  '🍲',
  '🎒',
  '🧸',
  '💊',
  '🪑',
  '🚚',
  '⏰',
  '✨',
  '🙂',
];

const LOCKED_MESSAGE_TEXT = 'Unlock secure chat to view this message.';
const UNREADABLE_MESSAGE_TEXT = 'This older secure message cannot be opened with your current chat key. Ask the sender to resend it.';

function isLikelyEcdhPayload(content: string) {
  const parts = content.split(':');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

  try {
    return atob(parts[0]).length === 12 && atob(parts[1]).length > 0;
  } catch {
    return false;
  }
}

type LegacyEncryptedPayload = {
  encrypted_content: string;
  nonce: string;
};

function parseLegacyEncryptedPayload(content: string): LegacyEncryptedPayload | null {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'encrypted_content' in parsed &&
      'nonce' in parsed &&
      typeof parsed.encrypted_content === 'string' &&
      typeof parsed.nonce === 'string'
    ) {
      return parsed as LegacyEncryptedPayload;
    }
  } catch {
    return null;
  }

  return null;
}

function tryDecryptLegacyMessage(content: string) {
  const legacyPayload = parseLegacyEncryptedPayload(content);
  if (!legacyPayload) return null;

  try {
    const legacyKey = getOrCreateChatKey();
    return decryptLegacyMessage(legacyKey, legacyPayload.encrypted_content, legacyPayload.nonce);
  } catch {
    return null;
  }
}

const MessagesContent = ({ mode: _mode = 'user', initialSelectedChat }: MessagesProps) => {
  const { data: session, status } = useSession();
  const { sessionPrivateKey, isUnlocked } = useChatSecurity();
  const userId = session?.user?.id;
  
  const [userSelectedChat, setUserSelectedChat] = useState<string | null>(null);
  const selectedChat = userSelectedChat || initialSelectedChat || null;
  const [messageContent, setMessageContent] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // tRPC queries
  const utils = trpc.useContext();
  
  const conversationsQuery = trpc.chat.getConversations.useQuery(undefined, { enabled: status === 'authenticated' });
  const messagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId: selectedChat! },
    {
      enabled: status === 'authenticated' && !!selectedChat,
      refetchInterval: selectedChat ? 10000 : false,
      refetchOnWindowFocus: true,
    }
  );
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const acceptConversationMutation = trpc.chat.acceptConversation.useMutation();

  const [decryptedMessages, setDecryptedMessages] = useState<Array<{id: string, content: string, senderId: string, createdAt: Date}>>([]);

  const scrollToLatest = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
    isAtBottomRef.current = true;
    setShowJumpToLatest(false);
  }, []);

  const handleMessageScroll = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const distanceFromBottom = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight;
    const isNearBottom = distanceFromBottom < 96;
    isAtBottomRef.current = isNearBottom;
    setShowJumpToLatest(!isNearBottom && decryptedMessages.length > 0);
  }, [decryptedMessages.length]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      const frame = window.requestAnimationFrame(() => scrollToLatest('auto'));
      return () => window.cancelAnimationFrame(frame);
    }

    if (decryptedMessages.length === 0) {
      return;
    }

    const latestMessage = decryptedMessages[decryptedMessages.length - 1] as any;
    if (latestMessage?.senderId === userId || latestMessage?.isPending) {
      const frame = window.requestAnimationFrame(() => scrollToLatest());
      return () => window.cancelAnimationFrame(frame);
    }

    const frame = window.requestAnimationFrame(() => setShowJumpToLatest(true));
    return () => window.cancelAnimationFrame(frame);
  }, [decryptedMessages, scrollToLatest, userId]);

  useEffect(() => {
    isAtBottomRef.current = true;
    const timer = window.setTimeout(() => scrollToLatest('auto'), 50);
    return () => window.clearTimeout(timer);
  }, [selectedChat, scrollToLatest]);

  useEffect(() => {
    async function processMessages() {
      if (!messagesQuery.data || !selectedChat) return;

      const conv = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
      if (!conv) return;

      const participants = [conv.user1, conv.user2, conv.ngo1, conv.ngo2].filter(Boolean) as any[];
      const targetParticipant = participants.find(p => p.id !== userId);
      const targetPublicKey = targetParticipant?.publicKey;

      const decrypted = await Promise.all(
        (messagesQuery.data as any[]).map(async (msg: any) => {
          if (msg.isSystem) return msg;

          const legacyPlainText = tryDecryptLegacyMessage(msg.content);
          if (legacyPlainText) {
            return { ...msg, content: legacyPlainText };
          }

          if (!isLikelyEcdhPayload(msg.content)) {
            return { ...msg, content: msg.content };
          }
          
          // If locked or missing keys, show placeholder
          if (!isUnlocked || !sessionPrivateKey || !targetPublicKey) {
             return { ...msg, content: LOCKED_MESSAGE_TEXT, unavailable: true };
          }
          
          try {
            const plainText = await encryption.decryptMessage(msg.content, sessionPrivateKey, targetPublicKey);
            return { ...msg, content: plainText };
          } catch {
            return { ...msg, content: UNREADABLE_MESSAGE_TEXT, unavailable: true };
          }
        })
      );

      setDecryptedMessages(decrypted);
    }
    processMessages();
  }, [messagesQuery.data, sessionPrivateKey, selectedChat, conversationsQuery.data, isUnlocked, userId]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedChat || !sessionPrivateKey) return;

    const conv = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
    if (!conv) return;

    if (conv?.status === 'PENDING') {
      toast.error("You must wait for the recipient to accept your chat request.");
      return;
    }

    const participants = [conv?.user1, conv?.user2, conv?.ngo1, conv?.ngo2].filter(Boolean) as any[];
    const targetParticipant = participants.find(p => p.id !== userId);
    
    if (!targetParticipant?.publicKey) {
      toast.error("Target user has not set up chat yet.");
      return;
    }

    const plainText = messageContent.trim();
    const tempId = `temp-${Date.now()}`;

    setMessageContent('');
    setEmojiOpen(false);
    setDecryptedMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content: plainText,
        senderId: userId ?? '',
        createdAt: new Date(),
        isPending: true,
      } as any,
    ]);

    try {
       const cipherText = await encryption.encryptMessage(plainText, sessionPrivateKey, targetParticipant.publicKey);
       
       const savedMessage = await sendMessageMutation.mutateAsync({
         conversationId: selectedChat,
         content: cipherText
       });

       setDecryptedMessages((prev) =>
         prev.map((msg: any) =>
           msg.id === tempId
             ? {
                 ...savedMessage,
                 content: plainText,
                 createdAt: new Date(savedMessage.createdAt),
                 isPending: false,
               }
             : msg
         )
       );

       utils.chat.getMessages.setData({ conversationId: selectedChat }, (old: any[] | undefined) => {
         const existing = old ?? [];
         return existing.some((msg) => msg.id === savedMessage.id) ? existing : [...existing, savedMessage];
       });
       utils.chat.getConversations.invalidate();
    } catch (e) {
       console.error("Failed to send", e);
       setDecryptedMessages((prev) =>
         prev.map((msg: any) =>
           msg.id === tempId
             ? { ...msg, content: `${plainText}\n(Not sent. Please try again.)`, isPending: false, failed: true }
             : msg
         )
       );
    }
  };

  const addEmoji = (emoji: string) => {
    setMessageContent((current) => `${current}${emoji}`);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const selectedConversation = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
  const selectedParticipants = [selectedConversation?.user1, selectedConversation?.user2, selectedConversation?.ngo1, selectedConversation?.ngo2].filter(Boolean) as any[];
  const selectedOther = selectedParticipants.find(p => p.id !== userId);
  const selectedOtherName = selectedOther?.organizationName || selectedOther?.fullName || 'Chat';

  return (
    <div className="flex h-[min(720px,calc(100vh-11rem))] min-h-[560px] bg-white rounded-[1.5rem] shadow-xl overflow-hidden border border-gray-100">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search chats..."
              className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversationsQuery.data?.map((conv: any) => {
             const participants = [conv.user1, conv.user2, conv.ngo1, conv.ngo2].filter(Boolean) as any[];
             const other = participants.find(p => p.id !== userId);
             const otherName = other?.organizationName || other?.fullName || 'User';
             const latestMessage = conv.messages?.[0]?.content;
             return (
               <button
                 key={conv.id}
                 onClick={() => {
                   setEmojiOpen(false);
                   setUserSelectedChat(conv.id);
                 }}
                 className={`w-full p-4 flex items-center gap-4 hover:bg-emerald-50 transition-colors ${selectedChat === conv.id ? 'bg-emerald-50' : ''}`}
               >
                 <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-bold">
                   {otherName.charAt(0)}
                 </div>
                 <div className="flex-1 text-left">
                   <p className="font-bold text-gray-900 text-sm">{otherName}</p>
                   <p className="text-xs text-gray-400 truncate">
                     {conv.itemRequest?.title || (latestMessage ? 'Latest message available' : 'Tap to see messages')}
                   </p>
                 </div>
               </button>
             );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {!isUnlocked ? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <ChatSecurityShield>
              <p className="text-emerald-600 font-bold">Securely Unlocked</p>
            </ChatSecurityShield>
          </div>
        ) : selectedChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                   {selectedOtherName.charAt(0)}
                </div>
                <div>
                   <p className="font-black text-gray-900 text-sm">
                      {selectedOtherName}
                   </p>
                   {selectedConversation?.itemRequest?.title && (
                     <p className="text-[11px] text-gray-400 font-semibold">
                       {selectedConversation.itemRequest.title}
                     </p>
                   )}
                   <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                     <Lock size={10} />
                     End-to-end Encrypted
                   </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>

            {(() => {
              const conv = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
              if (conv?.status !== 'PENDING') return null;
              
              const isInitiator = conv.initiatorId === userId;
              
              if (isInitiator) {
                return (
                  <div className="bg-amber-50 p-4 border-b border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="text-amber-600 animate-pulse" size={20} />
                      <div>
                        <p className="text-sm font-bold text-gray-900">Request Pending</p>
                        <p className="text-xs text-gray-500">Waiting for the recipient to accept your chat request.</p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="text-emerald-600" size={20} />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Chat Request</p>
                      <p className="text-xs text-gray-500">Accept this request to enable secure end-to-end encryption.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        await acceptConversationMutation.mutateAsync({ conversationId: selectedChat });
                        utils.chat.getConversations.invalidate();
                        utils.chat.getMessages.invalidate({ conversationId: selectedChat });
                      }}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      Accept
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-100 text-gray-400 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors">
                      Ignore
                    </button>
                  </div>
                </div>
              );
            })()}

            <div className="relative flex-1 min-h-0">
              <div
                ref={scrollAreaRef}
                onScroll={handleMessageScroll}
                className="h-full overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
              >
                {decryptedMessages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.isSystem ? 'justify-center' : msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                    {msg.isSystem ? (
                      <div className="bg-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-gray-200">
                        {msg.content}
                      </div>
                    ) : (
                      <div className={`max-w-[70%] p-4 rounded-[1.5rem] shadow-sm text-sm font-medium ${
                        msg.senderId === userId 
                          ? 'bg-emerald-600 text-white rounded-tr-none' 
                          : msg.failed
                            ? 'bg-red-50 text-red-700 rounded-tl-none border border-red-100'
                            : msg.unavailable
                              ? 'bg-amber-50 text-amber-800 rounded-tl-none border border-amber-100'
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                      }`}>
                        {msg.content.startsWith('📍') ? (
                          <div className="flex items-start gap-2">
                            <MapPin size={16} className="shrink-0 mt-1" />
                            <span>{msg.content}</span>
                          </div>
                        ) : msg.content}
                        {msg.isPending && (
                          <div className="mt-1 text-[10px] font-semibold opacity-70">Sending...</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {showJumpToLatest && (
                <button
                  type="button"
                  onClick={() => scrollToLatest()}
                  className="absolute bottom-4 right-5 flex h-10 items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 text-xs font-black uppercase tracking-wider text-emerald-700 shadow-xl shadow-emerald-900/10 transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
                  aria-label="Jump to latest message"
                >
                  Latest
                  <ChevronDown size={16} strokeWidth={3} />
                </button>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
              <div className="relative">
                {(() => {
                  const conv = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
                  const isPending = conv?.status === 'PENDING';
                  const participants = [conv?.user1, conv?.user2, conv?.ngo1, conv?.ngo2].filter(Boolean) as any[];
                  const targetParticipant = participants.find(p => p.id !== userId);
                  const targetMissingKeys = !!conv && !targetParticipant?.publicKey;
                  const disabled = isPending || targetMissingKeys || !isUnlocked;
                  return (
                    <>
                      {emojiOpen && !disabled && (
                        <div className="absolute bottom-[calc(100%+0.6rem)] left-0 z-20 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl shadow-gray-200/70">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Quick emojis</p>
                            <button
                              type="button"
                              onClick={() => setEmojiOpen(false)}
                              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                              aria-label="Close emoji palette"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div className="grid grid-cols-10 gap-1.5">
                            {PROJECT_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => addEmoji(emoji)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-lg transition-colors hover:bg-emerald-50"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setEmojiOpen((open) => !open)}
                        disabled={disabled}
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-xl p-2 text-gray-400 transition-colors hover:bg-white hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Open emoji palette"
                      >
                        <Smile size={18} />
                      </button>
                      <input 
                        ref={inputRef}
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        disabled={disabled}
                        placeholder={
                          isPending
                            ? 'Waiting for acceptance...'
                            : targetMissingKeys
                              ? 'Waiting for the other person to activate secure chat...'
                              : !isUnlocked
                                ? 'Unlock secure chat to send...'
                                : 'Type a secure message...'
                        }
                        className={`w-full bg-gray-50 border-none rounded-2xl pl-12 pr-12 py-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <button 
                        type="submit"
                        disabled={disabled || !messageContent.trim() || sendMessageMutation.isPending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:bg-gray-300 disabled:shadow-none"
                      >
                        <Send size={18} />
                      </button>
                    </>
                  );
                })()}
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 shadow-inner border border-emerald-100">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Select a Conversation</h3>
            <p className="text-gray-500 max-w-xs text-sm font-medium">
              Choose a chat from the sidebar to start a secure, end-to-end encrypted conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Messages = (props: MessagesProps) => (
  <MessagesContent {...props} />
);

export default Messages;
