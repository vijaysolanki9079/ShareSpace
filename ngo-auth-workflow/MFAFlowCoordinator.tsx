'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MFAOnboardingWarning from './MFAOnboardingWarning';
import MFASetup from './MFASetup';
import MFAVerification from './MFAVerification';

type MFAFlowStep = 'warning' | 'setup' | 'verification' | 'complete';
type MFAMethod = 'authenticator' | 'webauthn';

interface MFAFlowCoordinatorProps {
  userId: string;
  email: string;
  ngoName: string;
  isFirstLogin: boolean;
  onFlowComplete: () => void;
}

interface GeneratedMFAData {
  secret?: string;
  qrCodeUrl?: string;
  backupCodes?: string[];
  expiresIn?: number;
}

export default function MFAFlowCoordinator({
  userId,
  email,
  ngoName,
  isFirstLogin,
  onFlowComplete
}: MFAFlowCoordinatorProps) {
  const [currentStep, setCurrentStep] = useState<MFAFlowStep>(
    isFirstLogin ? 'warning' : 'verification'
  );
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_mfaData, setMfaData] = useState<GeneratedMFAData | null>(null);

  // Generate MFA secret when user moves to setup
  const handleContinueFromWarning = useCallback(async () => {
    setCurrentStep('setup');
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
          userId,
          method,
          email,
          ngoName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate MFA secret');
      }

      const data: GeneratedMFAData = await response.json();
      setMfaData(data);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message || 'Failed to generate MFA secret');
      setLoading(false);
    }
  }, [userId, email, ngoName]);

  // Handle successful setup verification
  const handleSetupComplete = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Move to verification step
      setCurrentStep('verification');
      setLoading(false);
    } catch (err) {
      setError((err as Error).message || 'Setup failed');
      setLoading(false);
    }
  }, []);

  // Handle successful verification
  const handleVerificationComplete = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Mark MFA setup as complete in backend
      const response = await fetch('/api/auth/mfa/mark-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to mark MFA as complete');
      }

      setCurrentStep('complete');
      setLoading(false);

      // Call parent callback after a short delay for animation
      setTimeout(() => {
        onFlowComplete();
      }, 1500);
    } catch (err) {
      setError((err as Error).message || 'Verification failed');
      setLoading(false);
    }
  }, [userId, onFlowComplete]);

  // Go back to previous step
  const handleBack = useCallback(() => {
    if (currentStep === 'setup') {
      setCurrentStep('warning');
      setSelectedMethod(null);
      setMfaData(null);
      setError(null);
    } else if (currentStep === 'verification') {
      setCurrentStep('setup');
      setError(null);
    }
  }, [currentStep]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
              ngoName={ngoName}
              email={email}
            />
          </motion.div>
        )}

        {currentStep === 'setup' && selectedMethod && (
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
              ngoName={ngoName}
              onSetupComplete={handleSetupComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {currentStep === 'setup' && !selectedMethod && (
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
              ngoName={ngoName}
              email={email}
            />
          </motion.div>
        )}

        {currentStep === 'verification' && selectedMethod && (
          <motion.div
            key="verification"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <MFAVerification
              method={selectedMethod}
              email={email}
              onVerificationComplete={handleVerificationComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
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
  ngoName: string;
  email: string;
}

function MFAMethodSelection({
  onMethodSelect,
  onBack,
  loading,
  ngoName: _ngoName,
  email: _email
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
      className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-gray-900"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-cover bg-center opacity-50 z-0 blur-sm scale-110"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1974)',
        }}
      />
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),' +
            'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 30px'
        }}
      />

      <div className="relative z-10 w-full max-w-[500px] px-6">
        <div className="bg-white rounded-3xl p-10 shadow-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Choose Your Authentication Method
            </h1>
            <p className="text-sm text-gray-600">
              Select the method that works best for you
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
                <div className="text-3xl">📱</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Authenticator App</h3>
                  <p className="text-sm text-gray-600">
                    Use Google Authenticator, Microsoft Authenticator, or Authy
                  </p>
                  <p className="text-xs text-gray-500 mt-2">✓ Recommended</p>
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
              disabled={loading}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">🔐</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Security Key</h3>
                  <p className="text-sm text-gray-600">
                    Use YubiKey, Google Titan, or any FIDO2 device
                  </p>
                  <p className="text-xs text-gray-500 mt-2">✓ Most Secure</p>
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
              <span className="font-semibold">💡 Tip:</span> You can add multiple methods after setup for backup access.
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
