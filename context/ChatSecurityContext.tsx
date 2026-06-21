'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as encryption from '@/lib/encryption';
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export type ChatRecoveryQuestion =
  | 'favorite_pen'
  | 'childhood_location'
  | 'favorite_teacher'
  | 'pet_name'
  | 'first_school';

interface ChatSecurityContextType {
  isUnlocked: boolean;
  setupRequired: boolean;
  sessionPrivateKey: CryptoKey | null;
  publicKey: string | null;
  recoveryQuestion: string | null;
  isLoading: boolean;
  unlock: (passphrase: string) => Promise<boolean>;
  setup: (passphrase: string, recoveryQuestion: ChatRecoveryQuestion, recoveryAnswer: string) => Promise<boolean>;
  resetWithRecovery: (input: {
    recoveryAnswer: string;
    newPassphrase: string;
  }) => Promise<boolean>;
  lock: () => void;
}

const ChatSecurityContext = createContext<ChatSecurityContextType | undefined>(undefined);

export function ChatSecurityProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [sessionPrivateKey, setSessionPrivateKey] = useState<CryptoKey | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [optimisticPublicKey, setOptimisticPublicKey] = useState<string | null>(null);
  const [keyOwnerId, setKeyOwnerId] = useState<string | null>(null);

  // tRPC queries
  const myKeysQuery = trpc.chat.getMyKeys.useQuery(undefined, {
    enabled: status === 'authenticated',
    retry: false,
  });

  const registerKeysMutation = trpc.chat.registerKeys.useMutation();
  const resetKeysMutation = trpc.chat.resetKeysWithRecovery.useMutation();

  const lock = useCallback(() => {
    setSessionPrivateKey(null);
    setIsUnlocked(false);
    setOptimisticPublicKey(null);
    setKeyOwnerId(null);
  }, []);

  const unlock = async (passphrase: string): Promise<boolean> => {
    if (!myKeysQuery.data) return false;
    try {
      const { encryptedPrivateKey, keyDerivationSalt } = myKeysQuery.data;
      if (!encryptedPrivateKey || !keyDerivationSalt) return false;

      const kek = await encryption.deriveKEK(passphrase, keyDerivationSalt);
      const [keyBlob, iv] = encryptedPrivateKey.split(':');
      if (!keyBlob || !iv) return false;
      
      const privKey = await encryption.unwrapPrivateKey(keyBlob, iv, kek);
      setSessionPrivateKey(privKey);
      setIsUnlocked(true);
      setKeyOwnerId(userId ?? null);
      return true;
    } catch {
      return false;
    }
  };

  async function createWrappedKeyBundle(passphrase: string) {
    const keyPair = await encryption.generateChatKeyPair();
    const salt = encryption.generateSalt();
    const kek = await encryption.deriveKEK(passphrase, salt);
    const wrapped = await encryption.wrapPrivateKey(keyPair.privateKey, kek);
    const publicKey = await encryption.exportPublicKey(keyPair.publicKey);

    return {
      privateKey: keyPair.privateKey,
      publicKey,
      encryptedPrivateKey: wrapped.encryptedKeyBase64 + ':' + wrapped.ivBase64,
      keyDerivationSalt: salt,
    };
  }

  const setup = async (passphrase: string, recoveryQuestion: ChatRecoveryQuestion, recoveryAnswer: string): Promise<boolean> => {
    if (passphrase.length < 6) {
      toast.error('Passphrase must be at least 6 characters');
      return false;
    }
    if (!recoveryQuestion || recoveryAnswer.trim().length < 2) {
      toast.error('Choose a recovery question and answer');
      return false;
    }

    try {
      const bundle = await createWrappedKeyBundle(passphrase);

      await registerKeysMutation.mutateAsync({
        publicKey: bundle.publicKey,
        encryptedPrivateKey: bundle.encryptedPrivateKey,
        keyDerivationSalt: bundle.keyDerivationSalt,
        recoveryQuestion,
        recoveryAnswer,
      });

      setSessionPrivateKey(bundle.privateKey);
      setIsUnlocked(true);
      setOptimisticPublicKey(bundle.publicKey);
      setKeyOwnerId(userId ?? null);
      myKeysQuery.refetch();
      
      toast.success('Secure chat activated!');
      return true;
    } catch (e) {
      console.error('Setup failed:', e);
      toast.error('Failed to setup E2EE keys');
      return false;
    }
  };

  const resetWithRecovery: ChatSecurityContextType['resetWithRecovery'] = async ({
    recoveryAnswer,
    newPassphrase,
  }) => {
    if (newPassphrase.length < 6) {
      toast.error('New passphrase must be at least 6 characters');
      return false;
    }

    try {
      const bundle = await createWrappedKeyBundle(newPassphrase);

      await resetKeysMutation.mutateAsync({
        recoveryAnswer,
        publicKey: bundle.publicKey,
        encryptedPrivateKey: bundle.encryptedPrivateKey,
        keyDerivationSalt: bundle.keyDerivationSalt,
      });

      setSessionPrivateKey(bundle.privateKey);
      setIsUnlocked(true);
      setOptimisticPublicKey(bundle.publicKey);
      setKeyOwnerId(userId ?? null);
      await myKeysQuery.refetch();
      toast.success('Secure chat reset. New passphrase is active.');
      return true;
    } catch (e) {
      console.error('Reset failed:', e);
      toast.error('Recovery answer did not match');
      return false;
    }
  };

  const hasCurrentUserKeyState = Boolean(userId && keyOwnerId === userId);
  const effectivePublicKey =
    status === 'authenticated'
      ? (hasCurrentUserKeyState ? optimisticPublicKey : null) ?? myKeysQuery.data?.publicKey ?? null
      : null;
  const effectiveIsUnlocked = status === 'authenticated' && isUnlocked && hasCurrentUserKeyState;
  const effectivePrivateKey = effectiveIsUnlocked ? sessionPrivateKey : null;
  const setupRequired =
    status === 'authenticated' &&
    myKeysQuery.isSuccess &&
    !myKeysQuery.data &&
    !(hasCurrentUserKeyState && optimisticPublicKey);

  return (
    <ChatSecurityContext.Provider
      value={{
        isUnlocked: effectiveIsUnlocked,
        setupRequired,
        sessionPrivateKey: effectivePrivateKey,
        publicKey: effectivePublicKey,
        recoveryQuestion: myKeysQuery.data?.chatRecoveryQuestion ?? null,
        isLoading: myKeysQuery.isLoading || status === 'loading',
        unlock,
        setup,
        resetWithRecovery,
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
