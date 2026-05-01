'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, ShieldAlert, Lock, Hash, MessageSquare, MapPin } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';
import * as encryption from '@/lib/encryption';
import { useChatSecurity } from '@/context/ChatSecurityContext';
import { ChatSecurityShield } from '../chat/ChatSecurityShield';
import { useSearchParams } from 'next/navigation';

interface MessagesProps {
  mode?: 'user' | 'ngo';
  initialSelectedChat?: string | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock';
const supabase = createClient(supabaseUrl, supabaseKey);

const MessagesContent = ({ mode = 'user', initialSelectedChat }: MessagesProps) => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { sessionPrivateKey, isUnlocked } = useChatSecurity();
  const userId = session?.user?.id;
  
  const [selectedChat, setSelectedChat] = useState<string | null>(initialSelectedChat || null);
  const [messageContent, setMessageContent] = useState('');
  const [hasSharedLocation, setHasSharedLocation] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // tRPC queries
  const utils = trpc.useContext();
  
  const conversationsQuery = trpc.chat.getConversations.useQuery(undefined, { enabled: status === 'authenticated' });
  const messagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId: selectedChat! },
    { enabled: !!selectedChat }
  );
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const acceptConversationMutation = trpc.chat.acceptConversation.useMutation();

  const [decryptedMessages, setDecryptedMessages] = useState<Array<{id: string, content: string, senderId: string, createdAt: Date}>>([]);

  useEffect(() => {
    if (initialSelectedChat) {
      setSelectedChat(initialSelectedChat);
    }
  }, [initialSelectedChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [decryptedMessages]);

  // Automated Location Sharing
  useEffect(() => {
    const shareLocation = searchParams.get('shareLocation');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (shareLocation === 'true' && lat && lng && selectedChat && isUnlocked && sessionPrivateKey && !hasSharedLocation) {
      const sendProximityMsg = async () => {
        const conv = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
        if (!conv) return;

        const participants = [conv.user1, conv.user2, conv.ngo1, conv.ngo2].filter(Boolean) as any[];
        const targetParticipant = participants.find(p => p.id !== userId);
        
        if (targetParticipant?.publicKey) {
          try {
            const content = `📍 Shared Proximity Verification\nCoordinates: ${lat}, ${lng}\n(Shared to ensure we are nearby and save time!)`;
            const cipherText = await encryption.encryptMessage(content, sessionPrivateKey, targetParticipant.publicKey);
            
            await sendMessageMutation.mutateAsync({
              conversationId: selectedChat,
              content: cipherText
            });
            
            setHasSharedLocation(true);
            utils.chat.getMessages.invalidate({ conversationId: selectedChat });
          } catch (e) {
            console.error("Auto-location failed", e);
          }
        }
      };
      sendProximityMsg();
    }
  }, [searchParams, selectedChat, isUnlocked, sessionPrivateKey, conversationsQuery.data, hasSharedLocation]);

  useEffect(() => {
    if (!selectedChat || !isUnlocked || !sessionPrivateKey) return;

    const channel = supabase
      .channel(`chat-${selectedChat}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Message', filter: `conversationId=eq.${selectedChat}` },
        (payload) => {
          utils.chat.getMessages.invalidate({ conversationId: selectedChat });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat, isUnlocked, sessionPrivateKey]);

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
          
          // If locked or missing keys, show placeholder
          if (!isUnlocked || !sessionPrivateKey || !targetPublicKey) {
             return { ...msg, content: "<Encrypted Message. Unlock chat to view>" };
          }
          
          try {
            const plainText = await encryption.decryptMessage(msg.content, sessionPrivateKey, targetPublicKey);
            return { ...msg, content: plainText };
          } catch (e) {
            return { ...msg, content: "<Encrypted Message. Could not decrypt>" };
          }
        })
      );

      setDecryptedMessages(decrypted);
    }
    processMessages();
  }, [messagesQuery.data, sessionPrivateKey, selectedChat, conversationsQuery.data, isUnlocked]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedChat || !sessionPrivateKey) return;

    const conv = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
    if (conv?.status === 'PENDING') {
      return alert("You must wait for the recipient to accept your chat request.");
    }

    const participants = [conv?.user1, conv?.user2, conv?.ngo1, conv?.ngo2].filter(Boolean) as any[];
    const targetParticipant = participants.find(p => p.id !== userId);
    
    if (!targetParticipant?.publicKey) return alert("Target user has not set up chat yet.");

    try {
       const cipherText = await encryption.encryptMessage(messageContent, sessionPrivateKey, targetParticipant.publicKey);
       
       await sendMessageMutation.mutateAsync({
         conversationId: selectedChat,
         content: cipherText
       });

       setMessageContent('');
       utils.chat.getMessages.invalidate({ conversationId: selectedChat });
    } catch (e) {
       console.error("Failed to send", e);
    }
  };

  return (
    <div className="flex h-[600px] bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
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
             return (
               <button
                 key={conv.id}
                 onClick={() => setSelectedChat(conv.id)}
                 className={`w-full p-4 flex items-center gap-4 hover:bg-emerald-50 transition-colors ${selectedChat === conv.id ? 'bg-emerald-50' : ''}`}
               >
                 <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-bold">
                   {other?.name?.charAt(0) || other?.organizationName?.charAt(0) || 'U'}
                 </div>
                 <div className="flex-1 text-left">
                   <p className="font-bold text-gray-900 text-sm">{other?.organizationName || other?.name || 'User'}</p>
                   <p className="text-xs text-gray-400 truncate">Tap to see messages</p>
                 </div>
               </button>
             );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xs font-bold">
                   {conversationsQuery.data?.find((c:any) => c.id === selectedChat)?.user1?.fullName?.charAt(0) || 
                    conversationsQuery.data?.find((c:any) => c.id === selectedChat)?.ngo1?.organizationName?.charAt(0) || 'C'}
                </div>
                <div>
                   <p className="font-black text-gray-900 text-sm">
                      {(() => {
                        const conv = conversationsQuery.data?.find((c:any) => c.id === selectedChat);
                        const participants = [conv?.user1, conv?.user2, conv?.ngo1, conv?.ngo2].filter(Boolean) as any[];
                        const other = participants.find(p => p.id !== userId);
                        return other?.organizationName || other?.fullName || other?.name || 'Chat';
                      })()}
                   </p>
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
              
              const isInitiator = conv.user1Id === userId || conv.ngo1Id === userId;
              
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

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isUnlocked ? (
                decryptedMessages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.isSystem ? 'justify-center' : msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                    {msg.isSystem ? (
                      <div className="bg-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-gray-200">
                        {msg.content}
                      </div>
                    ) : (
                      <div className={`max-w-[70%] p-4 rounded-[1.5rem] shadow-sm text-sm font-medium ${
                        msg.senderId === userId 
                          ? 'bg-emerald-600 text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                      }`}>
                        {msg.content.startsWith('📍') ? (
                          <div className="flex items-start gap-2">
                            <MapPin size={16} className="shrink-0 mt-1" />
                            <span>{msg.content}</span>
                          </div>
                        ) : msg.content}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                   <ChatSecurityShield>
                      <p className="text-emerald-600 font-bold">Securely Unlocked</p>
                   </ChatSecurityShield>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
              <div className="relative">
                {(() => {
                  const conv = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
                  const isPending = conv?.status === 'PENDING';
                  return (
                    <>
                      <input 
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        disabled={isPending}
                        placeholder={isPending ? "Waiting for acceptance..." : "Type a secure message..."}
                        className={`w-full bg-gray-50 border-none rounded-2xl pl-4 pr-12 py-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <button 
                        type="submit"
                        disabled={isPending || !messageContent.trim()}
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
