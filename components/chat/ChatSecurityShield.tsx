'use client';

import React, { useState } from 'react';
import { ChatRecoveryQuestion, useChatSecurity } from '@/context/ChatSecurityContext';
import { HelpCircle, KeyRound, Lock, Loader2, RotateCcw, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';

const recoveryQuestions = [
  { value: 'favorite_pen', label: 'Your favorite pen' },
  { value: 'childhood_location', label: 'A childhood location' },
  { value: 'favorite_teacher', label: 'Your favorite teacher' },
  { value: 'pet_name', label: 'Your pet name' },
  { value: 'first_school', label: 'Your first school' },
];

function recoveryQuestionLabel(value: string | null) {
  return recoveryQuestions.find((question) => question.value === value)?.label ?? 'Your recovery answer';
}

export function ChatSecurityShield({ children }: { children: React.ReactNode }) {
  const { isUnlocked, setupRequired, isLoading, unlock, setup, resetWithRecovery, recoveryQuestion } = useChatSecurity();
  const [mode, setMode] = useState<'unlock' | 'reset'>('unlock');
  const [passphrase, setPassphrase] = useState('');
  const [recoveryQuestionValue, setRecoveryQuestionValue] = useState<ChatRecoveryQuestion>('favorite_pen');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
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
        await setup(passphrase, recoveryQuestionValue, recoveryAnswer);
      } else if (mode === 'reset') {
        await resetWithRecovery({
          recoveryAnswer,
          newPassphrase: passphrase,
        });
      } else {
        const success = await unlock(passphrase);
        if (!success) {
          toast.error('Incorrect passphrase or decryption failed.');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isResetMode = !setupRequired && mode === 'reset';
  const title = setupRequired
    ? 'Enable Secure Chat'
    : isResetMode
      ? 'Reset Secure Chat'
      : 'Unlock Your Messages';
  const description = setupRequired
    ? 'Create a passphrase of at least 6 letters, numbers, or symbols, then choose a recovery question in case you forget it.'
    : isResetMode
      ? 'Answer your recovery question, then choose a new passphrase of at least 6 letters, numbers, or symbols.'
      : 'Enter your secure passphrase. It must match the 6+ character code or phrase you created.';

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        {isResetMode ? <RotateCcw className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
      </div>
      
      <h2 className="text-xl font-bold text-zinc-950">
        {title}
      </h2>
      
      <p className="mt-2 text-center text-sm text-zinc-500 max-w-md">
        {description}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 w-full max-w-sm space-y-3">
        {isResetMode && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
            Recovery question: {recoveryQuestionLabel(recoveryQuestion)}
          </div>
        )}

        {isResetMode && (
          <div className="relative">
            <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={recoveryAnswer}
              onChange={e => setRecoveryAnswer(e.target.value)}
              placeholder="Recovery answer"
              className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-zinc-50 transition-all"
              disabled={isProcessing}
              required
            />
          </div>
        )}

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type="password" 
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            placeholder={isResetMode ? 'New passphrase: 6+ chars, e.g. Green42' : 'Passphrase: 6+ chars, e.g. Green42'}
            className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-zinc-50 transition-all"
            disabled={isProcessing}
            required
          />
        </div>

        {setupRequired && (
          <>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <select
                value={recoveryQuestionValue}
                onChange={e => {
                  const value = e.target.value as ChatRecoveryQuestion;
                  setRecoveryQuestionValue(value);
                }}
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-zinc-50 transition-all"
                disabled={isProcessing}
              >
                {recoveryQuestions.map(question => (
                  <option key={question.value} value={question.value}>{question.label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={recoveryAnswer}
                onChange={e => setRecoveryAnswer(e.target.value)}
                placeholder="Recovery answer"
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-zinc-50 transition-all"
                disabled={isProcessing}
                required
              />
            </div>
          </>
        )}
        
        <button 
          type="submit" 
          disabled={isProcessing || passphrase.length < 6}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
          {setupRequired ? 'Activate Secure Chat' : isResetMode ? 'Reset And Unlock' : 'Unlock Messages'}
        </button>

        {!setupRequired && (
          <button
            type="button"
            onClick={() => setMode(isResetMode ? 'unlock' : 'reset')}
            className="w-full text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            {isResetMode ? 'Back to unlock' : 'Forgot passphrase? Reset with recovery answer'}
          </button>
        )}

        <p className="text-[10px] text-center text-zinc-400 mt-4 px-4">
          ShareSpace cannot see your passphrase. Keep your recovery answer memorable but hard to guess.
        </p>
      </form>
    </div>
  );
}
