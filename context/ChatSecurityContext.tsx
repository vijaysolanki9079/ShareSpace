'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as encryption from '@/lib/encryption';
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface ChatSecurityContextType {
  isUnlocked: boolean;
  setupRequired: boolean;
  sessionPrivateKey: CryptoKey | null;
  publicKey: string | null;
  isLoading: boolean;
  unlock: (passphrase: string) => Promise<boolean>;
  setup: (passphrase: string) => Promise<boolean>;
  lock: () => void;
}

const ChatSecurityContext = createContext<ChatSecurityContextType | undefined>(undefined);

export function ChatSecurityProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [sessionPrivateKey, setSessionPrivateKey] = useState<CryptoKey | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // tRPC queries
  const myKeysQuery = trpc.chat.getMyKeys.useQuery(undefined, {
    enabled: status === 'authenticated',
    retry: false,
  });

  const registerKeysMutation = trpc.chat.registerKeys.useMutation();

  useEffect(() => {
    if (myKeysQuery.isSuccess) {
      if (!myKeysQuery.data) {
        setSetupRequired(true);
        setPublicKey(null);
      } else {
        setSetupRequired(false);
        setPublicKey(myKeysQuery.data.publicKey);
      }
    }
  }, [myKeysQuery.data, myKeysQuery.isSuccess]);

  // Handle logout
  useEffect(() => {
    if (status === 'unauthenticated') {
      lock();
    }
  }, [status]);

  const unlock = async (passphrase: string): Promise<boolean> => {
    if (!myKeysQuery.data) return false;
    try {
      const { encryptedPrivateKey, keyDerivationSalt } = myKeysQuery.data;
      if (!encryptedPrivateKey || !keyDerivationSalt) return false;

      const kek = await encryption.deriveKEK(passphrase, keyDerivationSalt);
      const [keyBlob, iv] = encryptedPrivateKey.split(':');
      
      const privKey = await encryption.unwrapPrivateKey(keyBlob, iv, kek);
      setSessionPrivateKey(privKey);
      setIsUnlocked(true);
      return true;
    } catch (e) {
      console.error('Unlock failed:', e);
      return false;
    }
  };

  const setup = async (passphrase: string): Promise<boolean> => {
    if (passphrase.length < 6) {
      toast.error('Passphrase must be at least 6 characters');
      return false;
    }

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
      setSetupRequired(false);
      setPublicKey(pubKeyBase64);
      myKeysQuery.refetch();
      
      toast.success('Secure chat activated!');
      return true;
    } catch (e) {
      console.error('Setup failed:', e);
      toast.error('Failed to setup E2EE keys');
      return false;
    }
  };

  const lock = () => {
    setSessionPrivateKey(null);
    setIsUnlocked(false);
  };

  return (
    <ChatSecurityContext.Provider
      value={{
        isUnlocked,
        setupRequired,
        sessionPrivateKey,
        publicKey,
        isLoading: myKeysQuery.isLoading || status === 'loading',
        unlock,
        setup,
        lock,
      }}
    >
      {children}
    </ChatSecurityContext.Provider>
  );
}

export function useChatSecurity() {
  const context = useContext(ChatSecurityContext);
  if (context === undefined) {
    throw new Error('useChatSecurity must be used within a ChatSecurityProvider');
  }
  return context;
}
