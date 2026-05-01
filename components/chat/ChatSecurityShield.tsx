'use client';

import React, { useState } from 'react';
import { useChatSecurity } from '@/context/ChatSecurityContext';
import { ShieldAlert, Lock, Loader2 } from 'lucide-react';

export function ChatSecurityShield({ children }: { children: React.ReactNode }) {
  const { isUnlocked, setupRequired, isLoading, unlock, setup } = useChatSecurity();
  const [passphrase, setPassphrase] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      if (setupRequired) {
        await setup(passphrase);
      } else {
        const success = await unlock(passphrase);
        if (!success) {
          alert('Incorrect passphrase or decryption failed.');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-sm">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <ShieldAlert className="h-8 w-8" />
      </div>
      
      <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
        {setupRequired ? 'Enable Secure Chat' : 'Unlock Your Messages'}
      </h2>
      
      <p className="mt-2 text-center text-sm text-zinc-500 max-w-md">
        {setupRequired 
          ? "Your chats are protected with Zero-Knowledge End-to-End Encryption. Create a secure passphrase to protect your messages. This cannot be recovered if lost."
          : "Enter your secure passphrase to decrypt your private key and read your messages."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 w-full max-w-sm space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="password" 
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            placeholder="Enter Chat Passphrase" 
            className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-zinc-50 transition-all"
            disabled={isProcessing}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isProcessing || passphrase.length < 6}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
          {setupRequired ? 'Activate Secure Chat' : 'Unlock Messages'}
        </button>

        {setupRequired && (
          <p className="text-[10px] text-center text-zinc-400 mt-4 px-4">
            By activating, you agree that only you hold the keys to your messages. ShareSpace cannot recover your history if you lose this passphrase.
          </p>
        )}
      </form>
    </div>
  );
}
