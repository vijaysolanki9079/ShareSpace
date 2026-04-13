'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Lock, Shield, CheckCircle } from 'lucide-react';

interface MFAOnboardingWarningProps {
  onContinueToMFA: () => void;
  ngoName: string;
  email: string;
}

export default function MFAOnboardingWarning({
  onContinueToMFA,
  ngoName,
  email,
}: MFAOnboardingWarningProps) {
  const [isLearningMore, setIsLearningMore] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/5 rounded-full blur-3xl" />
      </div>

      {/* Lock Overlay Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),' +
            'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 30px'
        }}
      />

      <div className="relative z-10 w-full max-w-[500px] px-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-200"
        >
          {/* Warning Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
              <div className="relative p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-full border-2 border-red-200">
                <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={1.5} />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center mb-4"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Set Up Two-Factor Authentication
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-200">
              <Lock className="w-3.5 h-3.5 text-red-600" />
              <span className="text-xs font-semibold text-red-700">MANDATORY</span>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-center text-gray-600 mb-7 text-sm leading-relaxed"
          >
            You <span className="font-semibold text-gray-900">cannot proceed</span> without setting up two-factor authentication. This is required for your NGO account security.
          </motion.p>

          {/* Organization Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200/50 mb-6"
          >
            <p className="text-xs font-semibold text-emerald-700 mb-2">SECURING ACCOUNT FOR:</p>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">{ngoName}</p>
              <p className="text-xs text-gray-600">{email}</p>
            </div>
          </motion.div>

          {/* Why MFA is Mandatory */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Why 2FA is Mandatory
            </h3>

            <div className="space-y-3">
              {[
                {
                  icon: Lock,
                  title: 'Protects Your NGO Account',
                  description: 'Prevents unauthorized access even if passwords are compromised'
                },
                {
                  icon: CheckCircle,
                  title: 'Compliance & Data Security',
                  description: 'Required for regulatory compliance and protecting beneficiary data'
                },
                {
                  icon: Shield,
                  title: 'One-Time Setup',
                  description: 'Takes only ~2 minutes. You&apos;ll never need to set this up again'
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + idx * 0.05, duration: 0.3 }}
                  className="flex gap-3 p-3 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all"
                >
                  <item.icon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Learn More Section */}
          {isLearningMore && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200"
            >
              <h4 className="font-semibold text-sm text-blue-900 mb-2">How does 2FA work?</h4>
              <p className="text-xs text-blue-800 leading-relaxed mb-3">
                Two-factor authentication adds an extra security layer. After entering your password, you&apos;ll be asked to verify using:
              </p>
              <ul className="space-y-1.5 text-xs text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 mt-1">•</span>
                  <span><strong>Authenticator App</strong> - A time-based code from apps like Google Authenticator</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600 mt-1">•</span>
                  <span><strong>Security Key</strong> - A hardware key (YubiKey) for maximum security</span>
                </li>
              </ul>
              <p className="text-xs text-blue-800 mt-3 font-semibold">
                You can set up either or both methods for maximum flexibility and security.
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex gap-3"
          >
            <button
              onClick={() => setIsLearningMore(!isLearningMore)}
              className="flex-1 h-11 bg-gray-100 text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
            >
              {isLearningMore ? 'Hide Details' : 'Learn More'}
            </button>
            <button
              onClick={onContinueToMFA}
              className="flex-1 h-11 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 group"
            >
              <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={2} />
              Set Up Now
            </button>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-6 pt-6 border-t border-gray-200 text-center"
          >
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Your account is locked until 2FA is set up
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="text-center mt-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white text-xs font-medium">
            <Shield className="w-4 h-4 text-emerald-400" />
            ShareSpace NGO Portal
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
