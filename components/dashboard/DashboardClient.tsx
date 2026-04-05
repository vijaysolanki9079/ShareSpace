'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Settings,
  Bell,
  ChevronDown,
  HeartHandshake,
  Gift,
  ShoppingBag,
  MessageCircle,
  MapPin,
  Calendar,
  TrendingUp,
  Home,
  LogOut,
  Search,
  ChevronRight,
  BarChart3,
  Zap,
  Shield,
  RefreshCw,
} from 'lucide-react';

// ============ ANIMATED WAVE BACKGROUND ============
const AnimatedWave = () => {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#7b61ff', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#7b61ff', stopOpacity: 0.05 }} />
        </linearGradient>
      </defs>
      <motion.path
        d="M 0 100 Q 300 50 600 100 T 1200 100 L 1200 400 L 0 400 Z"
        fill="url(#waveGradient)"
        initial={{ d: "M 0 100 Q 300 50 600 100 T 1200 100 L 1200 400 L 0 400 Z" }}
        animate={{
          d: [
            "M 0 100 Q 300 50 600 100 T 1200 100 L 1200 400 L 0 400 Z",
            "M 0 120 Q 300 70 600 120 T 1200 120 L 1200 400 L 0 400 Z",
            "M 0 100 Q 300 50 600 100 T 1200 100 L 1200 400 L 0 400 Z",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
};

// ============ CIRCULAR PROGRESS ============
const CircularProgress = ({
  percentage,
  label,
  color = '#7b61ff',
}: {
  percentage: number;
  label: string;
  color?: string;
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#e0e7ff" strokeWidth="8" />
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-600 text-center">{label}</p>
    </motion.div>
  );
};

// ============ AREA CHART WITH ANIMATED CURVE ============
const AreaChart = () => {
  const data = [30, 45, 35, 60, 50, 75, 60, 55, 70, 65];

  return (
    <div className="relative w-full h-48 flex items-end justify-around px-4 py-6 bg-gradient-to-b from-white to-indigo-50 rounded-2xl">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 200">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#7b61ff', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#7b61ff', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <motion.path
          d={`M ${data.map((v, i) => `${(i / (data.length - 1)) * 600} ${200 - v * 1.5}`).join(' L ')} L 600 200 L 0 200 Z`}
          fill="url(#chartGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.polyline
          points={data.map((v, i) => `${(i / (data.length - 1)) * 600},${200 - v * 1.5}`).join(' ')}
          fill="none"
          stroke="#7b61ff"
          strokeWidth="2"
          initial={{ strokeDasharray: 600, strokeDashoffset: 600 }}
          animate={{ strokeDasharray: 600, strokeDashoffset: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      </svg>
      <div className="relative z-10 text-xs text-gray-500 font-semibold">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'].map((day, i) => (
          <div key={i} className="w-8 h-12 flex items-end justify-center text-[10px]">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============ STAT CARD ============
const StatCard = ({
  icon: Icon,
  label,
  value,
  color = 'from-orange-400 to-orange-500',
  bgColor = 'bg-orange-100',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
  bgColor?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className={`${bgColor} rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-all`}
    >
      <motion.div
        className={`bg-gradient-to-br ${color} p-4 rounded-xl mb-4 text-white`}
        whileHover={{ rotate: 10 }}
      >
        <Icon className="w-8 h-8" />
      </motion.div>
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{label}</p>
      <h3 className="text-3xl font-black text-gray-900">{value}</h3>
    </motion.div>
  );
};

// ============ FUNCTION CARD ============
const FunctionCard = ({
  icon: Icon,
  label,
  active = false,
  color = 'from-red-400 to-red-500',
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  color?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
        active ? `bg-gradient-to-br ${color} text-white shadow-lg` : 'bg-white text-gray-900 border-2 border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
          <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-700'}`} />
        </div>
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <motion.div
        className={`w-4 h-4 rounded-full ${active ? 'bg-white' : 'bg-gray-300'}`}
        animate={{ scale: active ? 1.2 : 1 }}
      />
    </motion.div>
  );
};

// ============ CALENDAR PICKER ============
const CalendarPicker = () => {
  const [selectedDate, setSelectedDate] = useState(5);
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + i);
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i], date: date.getDate() };
  });

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome to ShareSpace</h2>
        <p className="text-sm text-gray-600">Start sharing and making community impact today</p>
      </div>
      <div className="flex gap-2">
        <motion.button whileHover={{ scale: 1.1 }} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </motion.button>
        <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
          {week.map((item, i) => (
            <motion.button
              key={i}
              onClick={() => setSelectedDate(item.date)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedDate === item.date
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xs text-gray-500 mb-1">{item.day}</div>
              {item.date}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ MAIN DASHBOARD ============
export default function DashboardComplete() {
  const [activeFunction, setActiveFunction] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { icon: Home, label: 'Dashboard' },
    { icon: Gift, label: 'Donations' },
    { icon: ShoppingBag, label: 'Requests' },
    { icon: MessageCircle, label: 'Messages' },
    { icon: MapPin, label: 'NGOs' },
    { icon: Calendar, label: 'Events' },
    { icon: Settings, label: 'Settings' },
  ];

  const functions = [
    { icon: BarChart3, label: 'Analytics', color: 'from-red-400 to-red-500', active: true },
    { icon: Zap, label: 'Optimization', color: 'from-yellow-400 to-yellow-500' },
    { icon: Shield, label: 'Protection', color: 'from-cyan-400 to-cyan-500' },
    { icon: RefreshCw, label: 'Refresh', color: 'from-purple-400 to-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* ============ SIDEBAR ============ */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="w-32 bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-6 flex flex-col items-center justify-between"
      >
        <div className="space-y-8 w-full">
          <div className="flex items-center justify-center gap-2 font-bold text-lg tracking-wider">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-indigo-900" />
            </div>
          </div>

          <nav className="space-y-6">
            {navItems.map((item, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
                title={item.label}
              >
                <item.icon className="w-6 h-6" />
              </motion.button>
            ))}
          </nav>
        </div>

        <motion.button whileHover={{ scale: 1.1 }} className="w-12 h-12 bg-red-500/20 hover:bg-red-500/30 rounded-xl flex items-center justify-center transition-all">
          <LogOut className="w-6 h-6 text-red-400" />
        </motion.button>
      </motion.div>

      {/* ============ MAIN CONTENT ============ */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40 px-12 py-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">ShareSpace Dashboard</h1>
            <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-12 pr-4 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <motion.button whileHover={{ scale: 1.1 }} className="relative p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </motion.button>
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <img src="https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSouth%20Asian%2F4" alt="User" className="w-8 h-8 rounded-lg" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">Priya Sharma</p>
                  <p className="text-xs text-gray-600">Donor</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="p-12 max-w-7xl mx-auto">
          {/* Calendar Section */}
          <CalendarPicker />

          {/* Content Grid */}
          <div className="grid grid-cols-3 gap-12">
            {/* Left Column - Main Reports */}
            <div className="col-span-2 space-y-12">
              {/* Hero Section with Wave */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-white overflow-hidden h-64 flex items-center"
              >
                <AnimatedWave />
                <div className="relative z-10">
                  <h2 className="text-4xl font-bold mb-3">Welcome to ShareSpace</h2>
                  <p className="text-white/90 max-w-md text-lg">Start your community sharing journey. Make donations that matter.</p>
                </div>
              </motion.div>

              {/* Weekly Stats Grid */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Impact</h3>
                <div className="grid grid-cols-2 gap-6">
                  <StatCard icon={Gift} label="Items Donated" value="12" bgColor="bg-orange-100" color="from-orange-400 to-orange-500" />
                  <StatCard icon={TrendingUp} label="Requests Fulfilled" value="8" bgColor="bg-blue-100" color="from-blue-400 to-blue-500" />
                  <StatCard icon={MessageCircle} label="Messages" value="24" bgColor="bg-purple-100" color="from-purple-400 to-purple-500" />
                  <StatCard icon={HeartHandshake} label="Connections" value="15" bgColor="bg-pink-100" color="from-pink-400 to-pink-500" />
                </div>
              </div>

              {/* Monitoring Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Your Impact Growth</h3>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <CircularProgress percentage={75} label="Donations" color="#f97316" />
                  <CircularProgress percentage={60} label="Requests" color="#3b82f6" />
                  <CircularProgress percentage={85} label="Community" color="#7b61ff" />
                </div>
              </div>

              {/* Chart Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Activity Trend</h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <AreaChart />
                </motion.div>
              </div>
            </div>

            {/* Right Column - Functions */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              {functions.map((func, i) => (
                <FunctionCard
                  key={i}
                  icon={func.icon}
                  label={func.label}
                  color={func.color}
                  active={func.active}
                />
              ))}

              {/* Stats Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mt-8"
              >
                <h4 className="font-bold text-lg mb-4">Your Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profile Completion</span>
                    <span className="font-bold">92%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      className="bg-white rounded-full h-2"
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-sm">Community Score</span>
                    <span className="font-bold">4.8/5.0</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}