'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Camera, Lock, Mail, User, MapPin, AlignLeft, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { data: session, update } = useSession();
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    location: '',
    image: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Password Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [passwordVerification, setPasswordVerification] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [emailUpdateMsg, setEmailUpdateMsg] = useState('');

  useEffect(() => {
    if (session?.user) {
      setFormData({
        fullName: session.user.name || '',
        bio: (session.user as any)?.bio || '',
        location: (session.user as any)?.location || '',
        image: session.user.image || '',
      });
    }
  }, [session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      setMessage('Profile updated successfully!');
      
      // Update session to reflect immediately in the navbar
      await update({
        name: formData.fullName,
        image: formData.image,
        bio: formData.bio,
        location: formData.location,
      });
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPassword = async () => {
    // Simulate verifying password
    if (passwordVerification.length < 5) {
      setEmailUpdateMsg('Password must be longer.');
      return;
    }
    // Real implementation: API call to verify password
    setIsPasswordVerified(true);
    setEmailUpdateMsg('');
  };

  const handleUpdateEmail = async () => {
    // Simulate update email
    if (!newEmail.includes('@')) {
      setEmailUpdateMsg('Invalid email format.');
      return;
    }
    setIsPasswordVerified(false);
    setIsEmailModalOpen(false);
    // Real implementation: API update + force sign in again or update session
    alert('Email updated successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">Account Settings</h2>
        <p className="text-zinc-400 mt-1 text-sm">Manage your public profile and private details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Form fields */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Email Field (Locked) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-100/90 flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400/70" />
                Email Address
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1 opacity-70 group cursor-not-allowed">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={session?.user?.email || 'user@example.com'}
                    className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl bg-white/5 text-zinc-300 sm:text-sm cursor-not-allowed transition-all group-hover:border-red-500/30"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 whitespace-nowrap"
                >
                  Change Email
                </button>
              </div>
              <p className="text-xs text-zinc-500">Your email is locked for security. Click Change Email to update.</p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-100/90 flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400/70" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="block w-full px-4 py-2.5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-zinc-500 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 sm:text-sm transition-all"
                placeholder="John Doe"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-100/90 flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-emerald-400/70" />
                Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="block w-full px-4 py-3 border border-white/10 rounded-xl bg-black/40 text-white placeholder-zinc-500 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 sm:text-sm transition-all resize-none"
                placeholder="Tell us a little about yourself..."
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-100/90 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400/70" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="block w-full px-4 py-2.5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-zinc-500 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 sm:text-sm transition-all"
                placeholder="City, Country"
              />
            </div>

            {message && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-black bg-emerald-400 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Media & Quick Actions */}
        <div className="lg:col-span-1 border-t border-white/10 lg:border-t-0 pt-8 lg:pt-0">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 flex flex-col items-center text-center">
            <h3 className="text-sm font-medium text-emerald-100/90 mb-4 self-start">Profile Photo</h3>
            
            <div className="relative group w-32 h-32 rounded-full border-2 border-emerald-500/30 overflow-hidden mb-4">
              <img
                src={formData.image || session?.user?.image || 'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSouth%20Asian%2F4'}
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                <Camera className="h-8 w-8 text-white/80" />
              </div>
            </div>
            
            <p className="text-xs text-zinc-400 mb-6 px-4">
              Click the image to upload a new profile picture. Recommended size: 500x500px.
            </p>

            <button
              type="button"
              className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-sm font-medium text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              Upload Image
            </button>
          </div>
        </div>
      </div>

      {/* Change Email Modal */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEmailModalOpen(false);
                setIsPasswordVerified(false);
                setPasswordVerification('');
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl p-6 z-50 overflow-hidden"
            >
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/50 via-emerald-400 to-teal-500/50" />
              
              {!isPasswordVerified ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Security Verification</h3>
                      <p className="text-sm text-zinc-400">Please verify your password to continue.</p>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-emerald-100/90">Current Password</label>
                      <input
                        type="password"
                        value={passwordVerification}
                        onChange={(e) => setPasswordVerification(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 sm:text-sm transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    {emailUpdateMsg && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {emailUpdateMsg}
                      </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEmailModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifyPassword}
                        className="px-5 py-2 rounded-xl text-sm font-medium text-black bg-emerald-400 hover:bg-emerald-500 transition-colors"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Change Email Address</h3>
                      <p className="text-sm text-zinc-400">Enter your new email address below.</p>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-emerald-100/90">New Email</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-white/10 rounded-xl bg-black/40 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 sm:text-sm transition-all"
                        placeholder="new@example.com"
                      />
                    </div>
                    
                    {emailUpdateMsg && (
                      <p className="text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" /> {emailUpdateMsg}
                      </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEmailModalOpen(false);
                          setIsPasswordVerified(false);
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateEmail}
                        className="px-5 py-2 rounded-xl text-sm font-medium text-black bg-emerald-400 hover:bg-emerald-500 transition-colors"
                      >
                        Update Email
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
