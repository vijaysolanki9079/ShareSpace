'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, ShieldAlert, Lock, Hash } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';
import * as encryption from '@/lib/encryption';

interface MessagesProps {
  mode?: 'user' | 'ngo';
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock';

const supabase = createClient(supabaseUrl, supabaseKey);

const Messages = ({ mode = 'user' }: MessagesProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const userType = session?.user?.type || mode;

  const [passphrase, setPassphrase] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [sessionPrivateKey, setSessionPrivateKey] = useState<CryptoKey | null>(null);
  
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // tRPC queries
  const utils = trpc.useContext();
  const myKeysQuery = trpc.chat.getMyKeys.useQuery(undefined, {
    enabled: !!userId
  });

  useEffect(() => {
    if (myKeysQuery.isSuccess) {
      if (!myKeysQuery.data) setSetupRequired(true);
      else setSetupRequired(false);
    }
  }, [myKeysQuery.data, myKeysQuery.isSuccess]);

  const registerKeysMutation = trpc.chat.registerKeys.useMutation();
  const conversationsQuery = trpc.chat.getConversations.useQuery(undefined, { enabled: isUnlocked });
  const messagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId: selectedChat! },
    { enabled: !!selectedChat && isUnlocked }
  );
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // State to hold decrypted messages
  const [decryptedMessages, setDecryptedMessages] = useState<Array<{id: string, content: string, senderId: string, createdAt: Date}>>([]);

  // Auto-scroll inside chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [decryptedMessages]);

  const handleSetupE2EE = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length < 6) return alert("Passphrase must be at least 6 characters.");
    try {
      const keyPair = await encryption.generateChatKeyPair();
      const salt = encryption.generateSalt();
      const kek = await encryption.deriveKEK(passphrase, salt);
      const wrapped = await encryption.wrapPrivateKey(keyPair.privateKey, kek);
      const pubKeyBase64 = await encryption.exportPublicKey(keyPair.publicKey);

      await registerKeysMutation.mutateAsync({
        publicKey: pubKeyBase64,
        encryptedPrivateKey: wrapped.encryptedKeyBase64 + ':' + wrapped.ivBase64,
        keyDerivationSalt: salt,
      });

      setSessionPrivateKey(keyPair.privateKey);
      setIsUnlocked(true);
      myKeysQuery.refetch();
    } catch (e) {
      console.error(e);
      alert("Failed to setup E2EE keys");
    }
  };

  const handleUnlockE2EE = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myKeysQuery.data) return;
    try {
      const { encryptedPrivateKey, keyDerivationSalt } = myKeysQuery.data;
      if (!encryptedPrivateKey || !keyDerivationSalt) return;

      const kek = await encryption.deriveKEK(passphrase, keyDerivationSalt);
      const [keyBlob, iv] = encryptedPrivateKey.split(':');
      
      const privKey = await encryption.unwrapPrivateKey(keyBlob, iv, kek);
      setSessionPrivateKey(privKey);
      setIsUnlocked(true);
    } catch (e) {
      console.error(e);
      alert("Incorrect passphrase or decryption failed.");
    }
  };

  // Subscribe to real-time messages
  useEffect(() => {
    if (!selectedChat || !isUnlocked || !sessionPrivateKey) return;

    const channel = supabase
      .channel(`chat-${selectedChat}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Message', filter: `conversationId=eq.${selectedChat}` },
        (payload) => {
          const newMsg = payload.new as any;
          // Invalidate TRPC to fetch and let effect handle decryption
          utils.chat.getMessages.invalidate({ conversationId: selectedChat });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat, isUnlocked, sessionPrivateKey]);

  // Decrypt messages when they load
  useEffect(() => {
    async function processMessages() {
      if (!messagesQuery.data || !sessionPrivateKey || !selectedChat) return;

      const conv = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
      if (!conv) return;

      // Extract target public key safely
      // Logic assumes 1-on-1 simple chats. Find the participant that isn't me.
      const participants = [conv.user1, conv.user2, conv.ngo1, conv.ngo2].filter(Boolean) as any[];
      const targetParticipant = participants.find(p => p.id !== userId);
      const targetPublicKey = targetParticipant?.publicKey;

      if (!targetPublicKey) return; // Cant decrypt without public key

      const decrypted = await Promise.all(
        messagesQuery.data.map(async (msg) => {
          try {
            // For sender=me, I decrypt using their public key. For sender=target, I decrypt using their public key.
            // (In a complete implementation we might need to encrypt specifically for myself, but WebCrypto ECDH uses shared secrets that work symmetrically).
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
  }, [messagesQuery.data, sessionPrivateKey, selectedChat]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedChat || !sessionPrivateKey) return;

    const conv = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
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


  if (!isUnlocked) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-sm">
        <ShieldAlert className="h-12 w-12 text-emerald-500 mb-4" />
        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
          Secure E2E Encrypted Chat
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500 max-w-md">
          {setupRequired 
            ? "Your chats are protected with Zero-Knowledge End-to-End Encryption. Create a secure passphrase that will be used to protect your messages across devices."
            : "Enter your secure passphrase to decrypt your private key and read your messages."}
        </p>

        <form onSubmit={setupRequired ? handleSetupE2EE : handleUnlockE2EE} className="mt-6 w-full max-w-sm flex flex-col gap-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
              type="password" 
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              placeholder="Chat Passphrase" 
              className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-zinc-50"
            />
          </div>
          <button type="submit" disabled={registerKeysMutation.isPending} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition">
             {setupRequired ? "Enable Secure Chat" : "Unlock Messages"}
          </button>
        </form>
      </div>
    );
  }

  const active = conversationsQuery.data?.find((c: any) => c.id === selectedChat);
  const activeTarget = active ? [active.user1, active.user2, active.ngo1, active.ngo2].filter(Boolean).find((p:any) => p.id !== userId) : null;

  return (
    <div className="flex min-h-[420px] flex-col gap-0 sm:min-h-[520px]">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            Secure Messages
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
            <Lock className="w-3 h-3 text-emerald-400" />
            End-to-End Encrypted
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm lg:flex-row">
        <div className="flex w-full flex-col border-b border-zinc-100 bg-zinc-50/50 lg:w-72 lg:border-b-0 lg:border-r xl:w-80">
          <div className="p-4 border-b border-zinc-100">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                placeholder="Search chats…"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-500/15"
              />
            </div>
          </div>
          <div className="flex max-h-[200px] flex-1 flex-col gap-1 overflow-y-auto px-2 py-3 lg:max-h-none">
            {conversationsQuery.isPending && <p className="text-xs text-zinc-400 text-center mt-4">Loading chats...</p>}
            {conversationsQuery.data?.map((conv: any) => {
              const target = [conv.user1, conv.user2, conv.ngo1, conv.ngo2].filter(Boolean).find((p:any) => p.id !== userId) as any;
              const isTargetNgo = !!target?.organizationName;
              const title = isTargetNgo ? target.organizationName : (userType === 'ngo' ? 'Nearby User' : target?.fullName || 'User');
              
              return (
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
                <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
                  <Hash className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">{title}</p>
                  <p className="truncate text-xs text-emerald-600 font-medium">Encrypted <Lock className="inline w-2 h-2"/></p>
                </div>
              </button>
            )})}
            {conversationsQuery.data?.length === 0 && <p className="text-xs text-zinc-400 text-center mt-4">No conversations yet.</p>}
          </div>
        </div>

        {selectedChat && activeTarget ? (
        <div className="flex min-h-[320px] flex-1 flex-col bg-white lg:min-h-0">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl bg-zinc-100 ring-1 ring-zinc-200">
                  <Hash className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-zinc-900">
                   {(activeTarget as any).organizationName || (userType === 'ngo' ? 'Nearby User' : (activeTarget as any).fullName)}
                </h3>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                  {(activeTarget as any).organizationName ? 'Verified NGO' : 'Community member'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="group rounded-lg p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 text-zinc-400 transition-all hover:border-emerald-500/50 hover:text-emerald-600 hover:shadow-md hover:shadow-emerald-500/20"
            >
              <MoreVertical className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-5">
            {decryptedMessages.map((msg) => {
              const isMine = msg.senderId === userId;
              return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isMine 
                    ? 'rounded-br-md bg-emerald-600 text-white' 
                    : 'rounded-bl-md border border-zinc-100 bg-zinc-50 text-zinc-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            )})}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-zinc-100 p-4 sm:p-5">
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-1.5 pl-3 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-400/60">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type an encrypted message…"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <button
                type="submit"
                disabled={!messageContent.trim() || sendMessageMutation.isPending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
        ) : (
           <div className="flex flex-1 items-center justify-center text-sm text-zinc-400">
             Select a conversation to start chatting securely
           </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
