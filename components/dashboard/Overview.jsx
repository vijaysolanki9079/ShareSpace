import React from 'react';
import { Gift, ShoppingBag, MessageCircle, TrendingUp, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { MOCK_USER_STATS, MOCK_NGOS } from '@/lib/mock-data';

const Overview = () => {
  const stats = [
    { icon: Gift, label: 'Items Donated', value: MOCK_USER_STATS.itemsDonated.toString(), color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { icon: ShoppingBag, label: 'NGOs Supported', value: MOCK_USER_STATS.ngosSupported.toString(), color: 'text-sky-600', bgColor: 'bg-sky-50' },
    { icon: MessageCircle, label: 'Total Donations', value: MOCK_USER_STATS.totalDonations.toString(), color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { icon: TrendingUp, label: 'Impact Score', value: MOCK_USER_STATS.impactScore.toString(), color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'donation',
      title: 'Winter Jacket',
      status: 'Completed',
      date: '2 days ago',
      recipient: 'City Shelter NGO',
      icon: Gift,
      color: 'text-emerald-600',
    },
    {
      id: 2,
      type: 'request',
      title: 'Study Desk',
      status: 'Pending',
      date: '5 days ago',
      recipient: 'You',
      icon: ShoppingBag,
      color: 'text-sky-600',
    },
    {
      id: 3,
      type: 'message',
      title: 'New message from',
      status: 'Unread',
      date: '1 hour ago',
      recipient: 'Annapoorna Food Relief',
      icon: MessageCircle,
      color: 'text-amber-600',
    },
  ];

  const nearbyNgos = MOCK_NGOS.slice(0, 2).map((ngo) => ({
    id: ngo.id,
    name: ngo.name,
    distance: `${ngo.distanceKm} km`,
    category: ngo.category,
    image: ngo.image,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your donations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Link href="/dashboard?section=messages" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-10 h-10 ${activity.color.replace('text-', 'bg-').replace('-600', '-50')} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {activity.title}
                    </p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      activity.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                      activity.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-sky-50 text-sky-600'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.recipient}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Nearby NGOs */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/donate"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-emerald-600">Donate an Item</span>
              </Link>
              <Link
                href="/explore"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-sky-600" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-emerald-600">Explore NGOs</span>
              </Link>
              <Link
                href="/dashboard?section=events"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-emerald-600">View Events</span>
              </Link>
            </div>
          </div>

          {/* Nearby NGOs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Nearby NGOs</h2>
              <Link href="/explore" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {nearbyNgos.map((ngo) => (
                <Link
                  key={ngo.id}
                  href={`/explore?ngo=${ngo.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-emerald-500 hover:shadow-md transition-all group"
                >
                  <img
                    src={ngo.image}
                    alt={ngo.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                      {ngo.name}
                    </p>
                    <p className="text-xs text-gray-600">{ngo.category}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">{ngo.distance}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
