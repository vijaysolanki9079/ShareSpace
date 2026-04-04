'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Gift,
  ShoppingBag,
  MessageCircle,
  MapPin,
  Calendar,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  HeartHandshake
} from 'lucide-react';
import Overview from '@/components/dashboard/Overview';
import MyDonations from '@/components/dashboard/MyDonations';
import MyRequests from '@/components/dashboard/MyRequests';
import Messages from '@/components/dashboard/Messages';
import NearbyNGOs from '@/components/dashboard/NearbyNGOs';
import EventsDrives from '@/components/dashboard/EventsDrives';

export default function DashboardClient() {
  const [activeSection, setActiveSection] = useState('overview');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [donationAlerts, setDonationAlerts] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@example.com',
    bio: 'I love helping my community by sharing things I no longer need.',
    location: 'Indiranagar, Bangalore',
    radius: '10 km'
  });

  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    // Handle save logic
    console.log('Saving profile:', profileData);
  };

  const handleSavePreferences = () => {
    // Handle save preferences logic
    console.log('Saving preferences');
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', id: 'overview' },
    { icon: Gift, label: 'My Donations', id: 'donations' },
    { icon: ShoppingBag, label: 'My Requests', id: 'requests' },
    { icon: MessageCircle, label: 'Messages', id: 'messages', badge: 2 },
  ];

  const communityItems = [
    { icon: MapPin, label: 'Nearby NGOs', id: 'ngos' },
    { icon: Calendar, label: 'Events & Drives', id: 'events' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#f6fbf9] text-[#0f1720]"
    >
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <div className="h-16 border-b border-[#00000014] bg-white flex items-center px-6 justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1f9d7a] rounded-lg flex items-center justify-center text-white">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-[#0f1720]">ShareNest</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="h-9 pl-9 pr-3 rounded-md border border-[#00000014] bg-[#f3f6f5] w-60 text-sm outline-none focus:border-[#1f9d7a] focus:ring-2 focus:ring-[#78c6b1]/20"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90a09a]" />
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative cursor-pointer">
                <Bell className="w-5 h-5 text-[#90a09a]" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ef4444] rounded-full border-2 border-white"></div>
              </div>

              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#00000014]">
                  <img
                    src="https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSouth%20Asian%2F4"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium">Priya Sharma</span>
                <ChevronDown className="w-4 h-4 text-[#90a09a]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="w-64 bg-white border-r border-[#00000014] p-6 flex flex-col gap-1 flex-shrink-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-[#78c6b1]/20 text-[#052d22]'
                    : 'text-[#90a09a] hover:bg-[#e6f6ef] hover:text-[#134e3a]'
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-[#78c6b1]/20 text-[#052d22] text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}

            <div className="text-xs uppercase text-[#90a09a] font-semibold mt-6 mb-2 px-3 tracking-wider">
              Community
            </div>
            {communityItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-[#78c6b1]/20 text-[#052d22]'
                    : 'text-[#90a09a] hover:bg-[#e6f6ef] hover:text-[#134e3a]'
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </button>
            ))}

            <div className="text-xs uppercase text-[#90a09a] font-semibold mt-6 mb-2 px-3 tracking-wider">
              Account
            </div>
            <button
              onClick={() => setActiveSection('settings')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeSection === 'settings'
                  ? 'bg-[#78c6b1]/20 text-[#052d22]'
                  : 'text-[#90a09a] hover:bg-[#e6f6ef] hover:text-[#134e3a]'
              }`}
            >
              <Settings className="w-[18px] h-[18px]" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-[#ef4444] hover:bg-[#fff1f1] transition-all"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span>Log Out</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 bg-[#f6fbf9] overflow-y-auto">
            <div className={activeSection === 'settings' ? 'max-w-4xl' : 'max-w-7xl'}>
              {/* Render Components Based on Active Section */}
              {activeSection === 'overview' && <Overview />}
              {activeSection === 'donations' && <MyDonations />}
              {activeSection === 'requests' && <MyRequests />}
              {activeSection === 'messages' && <Messages />}
              {activeSection === 'ngos' && <NearbyNGOs />}
              {activeSection === 'events' && <EventsDrives />}
              
              {/* Settings Section */}
              {activeSection === 'settings' && (
                <>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-1">Settings</h1>
                    <p className="text-[#90a09a]">Manage your account preferences and profile.</p>
                  </div>

                  {/* Profile Section */}
              <div className="bg-white border border-[#00000014] rounded-lg p-6 mb-6">
                <div className="mb-6 pb-4 border-b border-[#00000014]">
                  <div className="text-lg font-semibold text-[#0f1720] mb-1">Public Profile</div>
                  <div className="text-sm text-[#90a09a]">
                    This information will be displayed publicly on your donations.
                  </div>
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <img
                    src="https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSouth%20Asian%2F4"
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#00000014]"
                  />
                  <div>
                    <div className="flex gap-3 mb-2">
                      <button className="h-10 px-4 rounded-md border border-[#00000014] text-sm font-medium hover:bg-[#f3f6f5] transition-colors">
                        Change Photo
                      </button>
                      <button className="h-10 px-4 text-sm font-medium text-[#ef4444] hover:text-[#dc2626] transition-colors">
                        Remove
                      </button>
                    </div>
                    <div className="text-xs text-[#90a09a]">JPG, GIF or PNG. Max size 2MB.</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-[#0f1720] mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full h-10 px-3 border border-[#00000014] rounded-md bg-white text-sm outline-none focus:border-[#1f9d7a] focus:ring-2 focus:ring-[#78c6b1]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f1720] mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full h-10 px-3 border border-[#00000014] rounded-md bg-white text-sm outline-none focus:border-[#1f9d7a] focus:ring-2 focus:ring-[#78c6b1]/20"
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-[#0f1720] mb-2">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full h-10 px-3 border border-[#00000014] rounded-md bg-[#f3f6f5] text-sm cursor-not-allowed"
                  />
                  <div className="text-xs text-[#90a09a] mt-1">
                    Email cannot be changed directly. Contact support.
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#0f1720] mb-2">Bio / About</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-3 border border-[#00000014] rounded-md bg-white text-sm resize-none outline-none focus:border-[#1f9d7a] focus:ring-2 focus:ring-[#78c6b1]/20"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="h-10 px-4 bg-[#1f9d7a] text-white rounded-md font-medium text-sm hover:bg-[#1a8a6a] transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="bg-white border border-[#00000014] rounded-lg p-6 mb-6">
                <div className="mb-6 pb-4 border-b border-[#00000014]">
                  <div className="text-lg font-semibold text-[#0f1720] mb-1">Preferences</div>
                  <div className="text-sm text-[#90a09a]">
                    Manage your notification settings and discovery radius.
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-[#0f1720] mb-2">Default Search Location</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="flex-1 h-10 px-3 border border-[#00000014] rounded-md bg-white text-sm outline-none focus:border-[#1f9d7a] focus:ring-2 focus:ring-[#78c6b1]/20"
                    />
                    <button className="h-10 px-4 border border-[#00000014] rounded-md text-sm font-medium hover:bg-[#f3f6f5] transition-colors flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Detect
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#0f1720] mb-2">Discovery Radius</label>
                  <select
                    value={profileData.radius}
                    onChange={(e) => handleInputChange('radius', e.target.value)}
                    className="w-full h-10 px-3 border border-[#00000014] rounded-md bg-white text-sm outline-none focus:border-[#1f9d7a] focus:ring-2 focus:ring-[#78c6b1]/20"
                  >
                    <option>5 km</option>
                    <option>10 km</option>
                    <option>25 km</option>
                    <option>50 km</option>
                  </select>
                </div>

                <div className="border-t border-[#00000014] my-6"></div>

                <div className="flex items-center justify-between py-3 mb-4">
                  <div>
                    <div className="font-medium text-sm text-[#0f1720] mb-0.5">Email Notifications</div>
                    <div className="text-xs text-[#90a09a]">
                      Receive updates about your listings and requests.
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      emailNotifications ? 'bg-[#1f9d7a]' : 'bg-[#00000014]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                      style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-sm text-[#0f1720] mb-0.5">New Donation Alerts</div>
                    <div className="text-xs text-[#90a09a]">
                      Get notified when items you might like are posted nearby.
                    </div>
                  </div>
                  <button
                    onClick={() => setDonationAlerts(!donationAlerts)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      donationAlerts ? 'bg-[#1f9d7a]' : 'bg-[#00000014]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        donationAlerts ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                      style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}
                    />
                  </button>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSavePreferences}
                    className="h-10 px-4 bg-[#1f9d7a] text-white rounded-md font-medium text-sm hover:bg-[#1a8a6a] transition-colors"
                  >
                    Update Preferences
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#fffcfc] border border-[#fee2e2] rounded-lg p-6">
                <div className="mb-6 pb-4 border-b border-[#fee2e2]">
                  <div className="text-lg font-semibold text-[#ef4444] mb-1">Danger Zone</div>
                  <div className="text-sm text-[#90a09a]">
                    Irreversible actions for your account.
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-[#0f1720] mb-0.5">Delete Account</div>
                    <div className="text-xs text-[#90a09a]">
                      Permanently remove your account and all data.
                    </div>
                  </div>
                  <button className="h-10 px-4 bg-[#fef2f2] text-[#ef4444] border border-[#fee2e2] rounded-md font-medium text-sm hover:bg-[#fee2e2] transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


