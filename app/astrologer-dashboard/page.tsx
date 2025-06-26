"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Phone, 
  Video, 
  Star, 
  Clock, 
  DollarSign,
  Calendar,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  Users
} from 'lucide-react';
import CallingApiNotifications from '../components/astrologer/CallingApiNotifications';
import { getAuthToken, getUserDetails, clearAuthData } from '../utils/auth-utils';

interface DashboardStats {
  totalCalls: number;
  totalEarnings: number;
  averageRating: number;
  onlineHours: number;
}

export default function AstrologerDashboard() {
  const router = useRouter();
  const [astrologerDetails, setAstrologerDetails] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    totalEarnings: 0,
    averageRating: 0,
    onlineHours: 0
  });
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const token = getAuthToken();
        const userDetails = getUserDetails();

        if (!token || !userDetails) {
          router.push('/login');
          return;
        }

        setAstrologerDetails(userDetails);

        // Load dashboard stats (mock data for now)
        setStats({
          totalCalls: 156,
          totalEarnings: 23400,
          averageRating: 4.8,
          onlineHours: 142
        });

      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router]);

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const handleCallAccepted = (call: any) => {
    console.log('Call accepted:', call);
  };

  const handleCallRejected = (call: any) => {
    console.log('Call rejected:', call);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!astrologerDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access your dashboard.</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">
                Astrologer Dashboard
              </h1>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleOnlineStatus}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isOnline 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>

              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>

              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Welcome, {astrologerDetails.name || 'Astrologer'}
                  </h2>
                  <p className="text-gray-600">
                    Ready to help seekers find their path
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCalls}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Online Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.onlineHours}h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Call completed with Priya Sharma</p>
                    <p className="text-sm text-gray-600">Duration: 25 minutes • Earnings: ₹375</p>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Video consultation with Rahul Kumar</p>
                    <p className="text-sm text-gray-600">Duration: 18 minutes • Earnings: ₹360</p>
                  </div>
                  <span className="text-sm text-gray-500">4 hours ago</span>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New 5-star review received</p>
                    <p className="text-sm text-gray-600">"Excellent guidance and accurate predictions"</p>
                  </div>
                  <span className="text-sm text-gray-500">6 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Real-time Video Call Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Notifications</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Using Astrologer ID: <code className="bg-gray-100 px-1 rounded">{astrologerDetails.id}</code>
                </p>
                <p className="text-sm text-gray-600">
                  Test calls sent to: <code className="bg-gray-100 px-1 rounded">6633ebc7eb445d44336aab72</code>
                </p>
              </div>
              
              <CallingApiNotifications
                astrologerId={astrologerDetails.id}
                onCallAccepted={handleCallAccepted}
                onCallRejected={handleCallRejected}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">View Analytics</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Manage Profile</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Set Availability</span>
                </button>

                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">Update Rates</span>
                </button>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Specialization</p>
                  <p className="font-medium">Vedic Astrology, Numerology</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-medium">12+ years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Languages</p>
                  <p className="font-medium">Hindi, English, Sanskrit</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Call Rate</p>
                  <p className="font-medium">₹15/min</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Video Rate</p>
                  <p className="font-medium">₹20/min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 