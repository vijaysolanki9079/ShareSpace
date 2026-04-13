'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, type Transition } from 'framer-motion';
import MFAOnboardingWarning from './MFAOnboardingWarning';
import MFASetup from './MFASetup';
import MFAVerification from './MFAVerification';
import { Smartphone, Key } from 'lucide-react';

type MFAFlowStep = 'warning' | 'method-selection' | 'setup' | 'verification' | 'complete';
type MFAMethod = 'authenticator' | 'webauthn';

interface MFAFlowCoordinatorProps {
  ngoId: string;
  email: string;
  organizationName: string;
  isFirstLogin: boolean;
  onFlowComplete: () => void;
}

interface GeneratedMFAData {
  success?: boolean;
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
  expiresIn?: number;
}

export default function MFAFlowCoordinator({
  ngoId,
  email,
  organizationName,
  isFirstLogin,
  onFlowComplete
}: MFAFlowCoordinatorProps) {
  const [currentStep, setCurrentStep] = useState<MFAFlowStep>(
    isFirstLogin ? 'warning' : 'verification'
  );
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mfaData, setMfaData] = useState<GeneratedMFAData | null>(null);

  // Generate MFA secret when user moves to setup
  const handleContinueFromWarning = useCallback(async () => {
    setCurrentStep('method-selection');
    setLoading(false);
  }, []);

  // When user confirms MFA method selection, generate secret
  const handleSetupMethodSelected = useCallback(async (method: MFAMethod) => {
    setSelectedMethod(method);
    setLoading(true);
    setError(null);

    try {
      // Call backend to generate MFA secret
      const response = await fetch('/api/auth/mfa/generate-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId,
          method,
          email,
          organizationName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate MFA secret');
      }

      const data: GeneratedMFAData = await response.json();
      setMfaData(data);
      setCurrentStep('setup');
      setLoading(false);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate MFA secret');
      setLoading(false);
    }
  }, [ngoId, email, organizationName]);

  // Handle successful setup verification
  const handleSetupComplete = useCallback(async (verificationCode: string) => {
    setLoading(true);
    setError(null);

    try {
      // Verify the setup with the code
      const response = await fetch('/api/auth/mfa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId,
          code: verificationCode,
          secret: mfaData?.secret
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      setCurrentStep('complete');
      setLoading(false);

      // Call parent callback after a short delay for animation
      setTimeout(() => {
        onFlowComplete();
      }, 2000);
    } catch (err) {
      setError((err as Error).message || 'Setup verification failed');
      setLoading(false);
    }
  }, [ngoId, mfaData, onFlowComplete]);

  // Handle verification during login
  const handleVerificationComplete = useCallback((verificationCode: string) => {
    // MFAVerification component handles the API call and only calls this on success
    // So here we just need to transition to complete state and call the callback
    setCurrentStep('complete');
    setLoading(false);

    // Call parent callback after a short delay for animation
    setTimeout(() => {
      onFlowComplete();
    }, 2000);
  }, [onFlowComplete]);

  // Go back to previous step
  const handleBack = useCallback(() => {
    if (currentStep === 'method-selection') {
      setCurrentStep('warning');
      setSelectedMethod(null);
      setMfaData(null);
      setError(null);
    } else if (currentStep === 'setup') {
      setCurrentStep('method-selection');
      setSelectedMethod(null);
      setMfaData(null);
      setError(null);
    }
  }, [currentStep]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition: Transition = {
    ease: 'easeInOut',
    duration: 0.3
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentStep === 'warning' && (
          <motion.div
            key="warning"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <MFAOnboardingWarning
              onContinueToMFA={handleContinueFromWarning}
              ngoName={organizationName}
              email={email}
            />
          </motion.div>
        )}

        {currentStep === 'method-selection' && !selectedMethod && (
          <motion.div
            key="method-selection"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <MFAMethodSelection
              onMethodSelect={handleSetupMethodSelected}
              onBack={handleBack}
              loading={loading}
              organizationName={organizationName}
              email={email}
            />
          </motion.div>
        )}

        {currentStep === 'setup' && selectedMethod && mfaData && (
          <motion.div
            key="setup"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <MFASetup
              method={selectedMethod}
              email={email}
              organizationName={organizationName}
              secret={mfaData.secret}
              qrCodeUrl={mfaData.qrCodeUrl}
              backupCodes={mfaData.backupCodes}
              onSetupComplete={handleSetupComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentStep === 'verification' && (
          <motion.div
            key="verification"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <MFAVerification
              ngoId={ngoId}
              method="authenticator"
              email={email}
              onVerificationComplete={handleVerificationComplete}
              onBack={() => {}}
            />
          </motion.div>
        )}

        {currentStep === 'complete' && (
          <motion.div
            key="complete"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50"
          >
            <div className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <div className="text-4xl">✓</div>
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Setup Complete!</h2>
              <p className="text-gray-400">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-xs z-50"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// MFA Method Selection Component
// ============================================

interface MFAMethodSelectionProps {
  onMethodSelect: (method: MFAMethod) => void;
  onBack: () => void;
  loading: boolean;
  organizationName: string;
  email: string;
}

function MFAMethodSelection({
  onMethodSelect,
  onBack,
  loading,
  organizationName,
  email
}: MFAMethodSelectionProps) {
  const methodCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 }
    }),
    hover: { scale: 1.02, y: -5 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-900/20 to-gray-900"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[500px] px-6">
        <div className="bg-white rounded-3xl p-10 shadow-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Choose Your Method
            </h1>
            <p className="text-sm text-gray-600">
              Select how you&apos;d like to secure your account
            </p>
          </div>

          {/* Method cards */}
          <div className="space-y-4 mb-8">
            {/* Authenticator App */}
            <motion.button
              custom={0}
              variants={methodCardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={() => onMethodSelect('authenticator')}
              disabled={loading}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <Smartphone className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Authenticator App</h3>
                  <p className="text-sm text-gray-600">
                    Use Google Authenticator, Microsoft Authenticator, or Authy
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold mt-2">✓ Recommended</p>
                </div>
              </div>
            </motion.button>

            {/* Security Key */}
            <motion.button
              custom={1}
              variants={methodCardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={() => onMethodSelect('webauthn')}
              disabled={loading || true}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <Key className="w-8 h-8 text-gray-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Security Key</h3>
                  <p className="text-sm text-gray-600">
                    Use YubiKey, Google Titan, or any FIDO2 device
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Coming soon</p>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Info box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <p className="text-xs text-blue-900">
              <span className="font-semibold">💡 Tip:</span> You&apos;ll receive backup codes to use if you lose access to your authenticator.
            </p>
          </motion.div>

          {/* Back button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onBack}
            disabled={loading}
            className="w-full h-11 bg-gray-100 text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Back
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
