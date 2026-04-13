'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

interface MFAOnboardingWarningProps {
  onContinueToMFA: () => void;
  ngoName: string;
  email: string;
}

export default function MFAOnboardingWarning({
  onContinueToMFA,
  ngoName,
  email
}: MFAOnboardingWarningProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-500/10 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Diagonal line pattern */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)'
        }}
      />

      <div className="relative z-10 w-full max-w-[500px] px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header with warning accent */}
          <div className="relative bg-gradient-to-r from-red-50 to-amber-50 border-b-4 border-red-500 px-8 py-8">
            <motion.div variants={itemVariants} className="flex justify-center mb-4">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-20"
                />
                <AlertTriangle className="w-14 h-14 text-red-600 relative z-10" strokeWidth={1.5} />
              </div>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-2xl font-bold text-center text-gray-900 mb-2">
              Set Up Two-Factor Authentication
            </motion.h1>
            <motion.p variants={itemVariants} className="text-center text-sm text-red-700 font-semibold">
              ⚠️ This is MANDATORY and cannot be skipped
            </motion.p>
          </div>

          {/* Main content */}
          <div className="px-8 py-8">
            {/* Organization info */}
            <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Setting up MFA for:</p>
              <p className="text-sm font-semibold text-gray-900">{ngoName}</p>
              <p className="text-xs text-gray-500">{email}</p>
            </motion.div>

            {/* Warning message */}
            <motion.div variants={itemVariants} className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded">
              <p className="text-sm text-amber-900 leading-relaxed">
                <span className="font-bold">You cannot proceed without setting up 2FA.</span> This is a mandatory security requirement for your NGO account. If you skip this step, you will not be able to log in to your account.
              </p>
            </motion.div>

            {/* Benefits list */}
            <motion.div variants={itemVariants} className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Why is this required?
              </h3>
              <ul className="space-y-2.5">
                {[
                  'Protects your NGO account from unauthorized access and hacking',
                  'Ensures compliance with security best practices and regulations',
                  'Secures sensitive organizational data and beneficiary information',
                  'Prevents account takeover even if password is compromised'
                ].map((benefit, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    className="flex gap-3 text-sm text-gray-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Time estimate */}
            <motion.div variants={itemVariants} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-blue-900">
                <span className="font-semibold">⏱️ Quick setup:</span> This takes only 2-3 minutes. You&apos;ll need a smartphone with an authenticator app.
              </p>
            </motion.div>

            {/* Consequence warning */}
            <motion.div variants={itemVariants} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-xs text-red-900 font-semibold mb-2">⛔ If you miss this step:</p>
              <ul className="text-xs text-red-800 space-y-1 ml-3">
                <li className="list-disc">You will not be able to log in to your account</li>
                <li className="list-disc">You will lose access to all organizational data</li>
                <li className="list-disc">You will need to contact administrator support for account recovery</li>
              </ul>
            </motion.div>

            {/* Acknowledgment checkbox */}
            <motion.div variants={itemVariants} className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors">
                  I understand that 2FA setup is mandatory. If I skip this, I cannot log in to my account.
                </span>
              </label>
            </motion.div>

            {/* Action buttons */}
            <motion.div variants={itemVariants} className="space-y-3">
              <button
                onClick={onContinueToMFA}
                disabled={!acknowledged}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-sm rounded-lg hover:shadow-lg hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                Set Up Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-xs text-center text-gray-500">
                {!acknowledged && '(Check the box above to continue)'}
              </p>
            </motion.div>

            {/* Support info */}
            <motion.div variants={itemVariants} className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Questions? <a href="#support" className="text-emerald-600 font-semibold hover:underline">Contact support</a>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer message */}
        <motion.p variants={itemVariants} className="text-xs text-gray-500 text-center mt-6">
          This is a one-time mandatory setup. After completion, you&apos;ll only need to verify codes during login.
        </motion.p>
      </div>
    </motion.div>
  );
}
